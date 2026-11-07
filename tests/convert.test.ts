import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { readGZFromDisk } from './helpers/nodeReader';
import { getCharacterAbils, getCustomDescription } from '../src/lib/gcsim-to-multiopt';
import { isTransformativeReaction } from '../src/lib/gcsim-to-multiopt/reactions/classifiers';
import { convertAbils } from '../src/lib/gcsim-to-multiopt/convert';
import getAbilities from '../src/lib/gcsim-to-multiopt/config/abil_name';
import { computeDefaultIgnored } from '../src/lib/gcsim-to-multiopt/config/default_ignored_mods';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('GCSim to MultiOpt Engine', () => {
    describe('Fixture decompression and parsing', () => {
        it('should correctly load and decompress electrocargadolunar.gz', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'electrocargadolunar.gz'));
            expect(sample).toBeDefined();
            expect(sample.character_details).toBeDefined();
            expect(sample.character_details?.length).toBe(4);

            const names = sample.character_details?.map(c => c.name);
            expect(names).toContain('furina');
            expect(names).toContain('sucrose');
            expect(names).toContain('flins');
            expect(names).toContain('ineffa');
        });

        it('should correctly load and decompress lauma2.gz', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'lauma2.gz'));
            expect(sample).toBeDefined();
            expect(sample.character_details?.length).toBe(4);

            const names = sample.character_details?.map(c => c.name);
            expect(names).toContain('raiden');
            expect(names).toContain('lauma');
        });
    });

    describe('Ability extraction and conversion', () => {
        it('should extract abilities and convert for furina in electrocargadolunar.gz', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'electrocargadolunar.gz'));
            const [abilities, mods, char] = getCharacterAbils(sample, 'furina', []);

            expect(char).toBeDefined();
            expect(char?.name).toBe('furina');
            expect(abilities.length).toBeGreaterThan(0);
            expect(mods.length).toBeGreaterThan(0);

            const mapping = getAbilities('furina');
            expect(mapping).toBeDefined();

            const [target, errors] = convertAbils(abilities, mapping, char);
            expect(target).toBeDefined();
            expect(target.targets).toBeDefined();
            expect(target.targets.length).toBeGreaterThan(0);

            // Targets should have valid weights
            for (const t of target.targets) {
                expect(t.weight).toBeGreaterThan(0);
                expect(t.path).toBeDefined();
            }
        });

        it('should return empty abilities gracefully for non-participating characters', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'electrocargadolunar.gz'));
            const [abilities, , char] = getCharacterAbils(sample, 'nonexistent_character', []);

            expect(char).toBeUndefined();
            expect(abilities).toEqual([]);
        });

        it('should compute custom descriptions for characters with specific buffs', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'electrocargadolunar.gz'));
            const [, mods, char] = getCharacterAbils(sample, 'furina', []);
            const customDesc = getCustomDescription(char, mods);

            expect(Array.isArray(customDesc)).toBe(true);
        });

        it('should convert all characters in estelar.gz with zero unknown ability or stat errors', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'estelar.gz'));
            const chars = sample.character_details?.map(c => c.name) ?? [];
            expect(chars).toEqual(['yumemizukimizuki', 'yaemiko', 'odette', 'luminecryo']);

            for (const charName of chars) {
                const [abilities, mods, char] = getCharacterAbils(sample, charName, []);
                expect(abilities.length).toBeGreaterThan(0);
                expect(mods.length).toBeGreaterThan(0);

                const mapping = getAbilities(charName);
                const [target, errors] = convertAbils(abilities, mapping, char);

                expect(errors).toEqual([]);
                expect(target.targets.length).toBeGreaterThan(0);
            }
        });

        it('should convert all characters in sample.gz (varka, prune, odette, luminecryo) with zero unknown ability or stat errors', () => {
            const sample = readGZFromDisk(path.join(FIXTURES_DIR, 'sample.gz'));
            const chars = sample.character_details?.map(c => c.name) ?? [];
            expect(chars).toEqual(['varka', 'prune', 'odette', 'luminecryo']);

            for (const charName of chars) {
                const [abilities, mods, char] = getCharacterAbils(sample, charName, []);
                expect(abilities.length).toBeGreaterThan(0);
                expect(mods.length).toBeGreaterThan(0);

                const mapping = getAbilities(charName);
                const [target, errors] = convertAbils(abilities, mapping, char);

                expect(errors).toEqual([]);
                expect(target.targets.length).toBeGreaterThan(0);
                // Ensure char.name in sample.character_details is never mutated
                expect(char?.name).toBe(charName);
            }
        });
    });

    describe('Default ignored mods', () => {
        it('should identify 2pc artifact sets to avoid double counting in GO', () => {
            const mods = ['furina-c2', 'golden-troupe-2pc', 'golden-troupe-4pc', 'hydro-resonance'];
            const ignored = computeDefaultIgnored(mods);

            expect(ignored).toContain('golden-troupe-2pc');
        });
    });

    describe('Mathematical integrity against gcsim calc ground truth', () => {
        it('should never inflate critRate_ or reaction DMG% beyond gcsim calc values across fixtures', () => {
            const fixtureFiles = [
                'Lunar.gz',
                'electrocargadolunar.gz',
                'estelar.gz',
                'lauma2.gz',
                'fallbacktest.gz',
                'test1y1.gz',
                'sample.gz',
            ];

            for (const file of fixtureFiles) {
                const sample = readGZFromDisk(path.join(FIXTURES_DIR, file));
                const chars = sample.character_details ?? [];

                for (let charIdx = 0; charIdx < chars.length; charIdx++) {
                    const charName = chars[charIdx].name;
                    const [abilities] = getCharacterAbils(sample, charName, []);

                    // Base crit rate from character stats-check or character details
                    const baseCr =
                        0.05 +
                        (chars[charIdx].stats?.[9] ?? 0); // index 9 in gcsim stats array is CR from artifacts/substats/ascension

                    for (const abil of abilities) {
                        // 1. Check Ascendant Gleam cap: any Lunar reaction bonus without character-specific passives
                        // must never exceed the gcsim calc react_bonus on direct talent hits at the same frame
                        const matchingCalc = (sample.logs ?? []).find(
                            l =>
                                l.event === 'calc' &&
                                l.char_index === charIdx &&
                                l.frame === abil.frame &&
                                l.logs?.abil === abil.name
                        );

                        if (matchingCalc && typeof matchingCalc.logs?.react_bonus === 'number') {
                            const calcReactBonus = matchingCalc.logs.react_bonus;
                            if (calcReactBonus > 0) {
                                const lunarorStellarBuff =
                                    (abil.buffs['lunarcharged%'] ?? 0) +
                                    (abil.buffs['lunarcrystallize%'] ?? 0) +
                                    (abil.buffs['lunarbloom%'] ?? 0) +
                                    (abil.buffs['stellarconduct%'] ?? 0) +
                                    (abil.buffs['stellarswirl%'] ?? 0);
                                // Our extracted reaction DMG% buff must never exceed gcsim's total react_bonus
                                expect(lunarorStellarBuff).toBeLessThanOrEqual(calcReactBonus + 1e-6);
                            }
                        }

                        // 2. Check critRate_ buff is never double-counted beyond calc.cr
                        if (
                            matchingCalc &&
                            typeof matchingCalc.logs?.cr === 'number' &&
                            matchingCalc.logs.cr > 0 &&
                            !isTransformativeReaction(abil.name)
                        ) {
                            const crBuff = abil.buffs['cr'] ?? 0;
                            // Total CR (baseCr + crBuff) should not exceed calc.cr by more than rounding tolerance
                            // (unless calc.cr was clamped to 1.0 by gcsim)
                            if (matchingCalc.logs.cr < 1.0) {
                                expect(baseCr + crBuff).toBeLessThanOrEqual(
                                    matchingCalc.logs.cr + 0.01
                                );
                            }
                        } else if (
                            matchingCalc &&
                            typeof matchingCalc.logs?.cr === 'number' &&
                            isTransformativeReaction(abil.name) &&
                            abil.name !== 'lunarcrystallize' &&
                            abil.name !== 'lunarcharged'
                        ) {
                            // Transformative reactions (bloom, hyperbloom, burgeon) do not use character baseCr,
                            // only reaction CR buffs (like Lauma A1 +15% CR).
                            const crBuff = abil.buffs['cr'] ?? 0;
                            expect(crBuff).toBeLessThanOrEqual(matchingCalc.logs.cr + 0.01);
                        }
                    }
                }
            }
        });
    });
});
