const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const fixturePath = path.join(__dirname, '..', 'tests', 'fixtures', 'electrocargadolunar.gz');
const data = fs.readFileSync(fixturePath);
const unzip = zlib.inflateSync(data);
const sample = JSON.parse(unzip.toString('utf-8'));

const chars = sample.character_details;

const preDmgMods = (sample.logs || []).filter(log => log.event === 'pre_damage_mods');
console.log(`Total pre_damage_mods events: ${preDmgMods.length}`);

// Group by char_index and show ALL unique amt values
const charAmts = {};
for (const m of preDmgMods) {
    const charName = chars[m.char_index]?.name ?? `unknown(${m.char_index})`;
    if (!charAmts[charName]) charAmts[charName] = new Set();
    charAmts[charName].add(m.logs?.amt ?? 0);
}
console.log('\n=== ALL UNIQUE AMT VALUES PER CHAR ===');
for (const [name, amts] of Object.entries(charAmts)) {
    console.log(`  ${name}: [${[...amts].join(', ')}]`);
}

// Show ALL pre_damage_mods events
console.log('\n=== ALL PRE_DAMAGE_MODS EVENTS ===');
for (const m of preDmgMods) {
    const charName = chars[m.char_index]?.name ?? `unknown(${m.char_index})`;
    console.log(`  Frame ${m.frame}: char=${charName}, amt=${m.logs?.amt}`);
}

// Max amt per char (what our tool calculates)
const maxAmtByChar = new Map();
for (const m of preDmgMods) {
    const amt = m.logs?.amt ?? 0;
    const charIdx = m.char_index;
    if (amt > 0 && charIdx !== undefined) {
        maxAmtByChar.set(charIdx, Math.max(maxAmtByChar.get(charIdx) ?? 0, amt));
    }
}
let total = 0;
console.log('\n=== MAX AMT PER CHAR (what tool calculates) ===');
for (const [idx, amt] of maxAmtByChar.entries()) {
    console.log(`  ${chars[idx]?.name}: ${amt} (${(amt * 100).toFixed(2)}%)`);
    total += amt;
}
console.log(`  TOTAL: ${total} (${(total * 100).toFixed(2)}%)`);
console.log(`  Expected total with sets: ${((total + 0.1 + 0.1) * 100).toFixed(2)}% (vs react_base_dmg_bonus=28%)`);
