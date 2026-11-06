import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { readGZFromDisk } from './helpers/nodeReader';
import { getCharacterAbils, getCustomDescription } from '../src/lib/gcsim-to-multiopt';
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
    });

    describe('Default ignored mods', () => {
        it('should identify 2pc artifact sets to avoid double counting in GO', () => {
            const mods = ['furina-c2', 'golden-troupe-2pc', 'golden-troupe-4pc', 'hydro-resonance'];
            const ignored = computeDefaultIgnored(mods);

            expect(ignored).toContain('golden-troupe-2pc');
        });
    });
});
