export type AbilsType = Record<string, string[]>;

const defaultAbils: AbilsType = {
    "Normal 0": ["normal", "0"],
    "Normal 1": ["normal", "1"],
    "Normal 2": ["normal", "2"],
    "Normal 3": ["normal", "3"],
    "Normal 4": ["normal", "4"],
    "Normal 5": ["normal", "5"],
    "Charge": ["charged", "dmg"],
    "Charge Attack": ["charged", "dmg"],
    "Charge 0": ["charged", "dmg1"],
    "Charge 1": ["charged", "dmg2"],
    "Aimed Shot": ["charged", "aimed"],
    "Fully-Charged Aimed Shot": ["charged", "aimedCharged"],
    "Low Plunge": ["plunging", "low"],
    "High Plunge": ["plunging", "high"],
    "Plunge Collision": ["plunging", "dmg"],

    //TODO reactions
    "bloom": ["reaction", "bloom"],
    "bloom (self damage)": ["type", "subtype"], //! Self damage (not relevant)
    "burning": ["reaction", "burning"],
    "hyperbloom": ["reaction", "hyperbloom"],
    "hyperbloom (self damage)": ["type", "subtype"], //! Self damage (not relevant)
    "overload": ["reaction", "overloaded"],
    "electrocharged": ["reaction", "electrocharged"],
    "swirl-hydro": ["reaction", "hydroSwirl"],
    "swirl-electro": ["reaction", "electroSwirl"],
    "swirl-electro (aoe)": ["reaction", "electroSwirl"],
    "swirl-cryo": ["reaction", "cryoSwirl"],
    "swirl-pyro": ["reaction", "pyroSwirl"],
    "Freeze Broken": ["type", "subtype"], //! No damage? irrelevant
    "shatter": ["reaction", "shattered"],
    "superconduct": ["reaction", "superconduct"],

    //TODO events
    "Hurt": ["type", "subtype"], //! Character takes damage

    //TODO weapons
    
    //bows
    "Messenger Proc": ["weapon:Messenger","dmg"],
    "Viridescent": ["weapon:TheViridescentHunt", "dmg"],
    "End of the Line Proc": ["weapon:EndOfTheLine","dmg"],
    "Sequence of Solitude Proc": ["weapon:SequenceOfSolitude","dmg"],
    "King's Squire Proc": ["weapon:KingsSquire","dmg"],
    "Skyward Harp Proc": ["weapon:SkywardHarp","dmg"],

    //catalysts
    "Ash-Graven Drinking Horn Proc": ["weapon:AshGravenDrinkingHorn","dmg"],
    "Frostbearer Proc": ["weapon:Frostbearer","dmgAoe"], // use this path for cryo infused enemies :["weapon:Frostbearer","dmgOnCryoOp"],
    "Eye of Preception Proc": ["weapon:EyeOfPerception","dmg_"],
    "Skyward Atlas Proc": ["weapon:SkywardAtlas","dmg"],

    //claymores
    "Prototype Archaic Proc": ["weapon:PrototypeArchaic","dmg"],
    "Starsilver Proc": ["weapon:SnowTombedStarsilver","dmgAoe"], // use this path for cryo infused enemies :["weapon:SnowTombedStarsilver","dmgOnCryoOp"],
    "Skyward Pride Proc": ["weapon:SkywardPride","dmg"],
    "Debate Club Proc": ["weapon:DebateClub","dmg"],
    "Luxurious Sea-Lord Proc": ["weapon:LuxuriousSeaLord","dmg"],

    //polearms
    "Dragonspine Proc": ["weapon:DragonspineSpear","dmgAoe"], // use this path for cryo infused enemies :["weapon:DragonspineSpear","dmgOnCryoOp"],
    "Crescent Pike Proc": ["weapon:CrescentPike","hit"],
    "Halberd Proc": ["weapon:Halberd","dmg"],
    "Skyward Spine Proc": ["weapon:SkywardSpine","dmg"],

    //swords
    "Aquila Favonia": ["weapon:AquilaFavonia","dmg"],
    "Flute Proc": ["weapon:TheFlute","dmg_"],
    "Kagotsurube Isshin Proc": ["weapon:KagotsurubeIsshin","dmg"],
    "Sword of Descension Proc": ["weapon:SwordOfDescension","dmg_"],
    "Fillet Blade Proc": ["weapon:FilletBlade","dmg_"],
    "Skyward Blade Proc": ["weapon:SkywardBlade","dmg"],
    "Sword of Narzissenkreuz":["weapon:SwordOfNarzissenkreuz","dmg"],

    //TODO artifacts
    "Sea-Dyed Foam": ["artifact:OceanHuedClam", "heal"],
};

const characterAbils: Record<string, AbilsType> = {
    aino: {},

    albedo: {
        "Charge 0": ["charged", "dmg1"],
        "Charge 1": ["charged", "dmg2"],
        "Abiogenesis: Solar Isotoma (Initial)": ["skill", "dmg"],
        "Abiogenesis: Solar Isotoma (Tick)": ["skill", "blossom"],
        "Rite of Progeniture: Tectonic Tide": ["burst", "dmg"],
        "Rite of Progeniture: Tectonic Tide (Blossom)": ["burst", "blossom"],
    },

    // Should create an exception on his charged
    alhaitham: {
        "Charge 0": ["charged", "dmg"],
        "Charge 1": ["charged", "dmg"],
        "Universality: An Elaboration on Form": ["skill", "rushDmg"],
        "Chisel-Light Mirror: Projection Attack 1": ["skill", "mirrorDmg1"],
        "Chisel-Light Mirror: Projection Attack 2": ["skill", "mirrorDmg1"],
        "Chisel-Light Mirror: Projection Attack 3": ["skill", "mirrorDmg1"],
        "Particular Field: Fetters of Phenomena": ["burst", "instanceDmg"],
    },

    aloy: {
        "Freeze Bomb": ["skill", "freezeBombDmg"],
        "Chillwater Bomblets": ["skill", "chillWaterBomblets"],
        "Prophecies of Dawn": ["burst", "dmg"],
    },

    // Miss ["constellation1","secondAimedCharged"] and ["constellation1","secondAimed"]
    amber: {
        "Baron Bunny": ["skill", "dmg"],
        "Baron Bunny (Manual Explosion)": ["constellation2", "manualDetonationDmg"],
        "Fiery Rain": ["burst", "dmgPerWave"],
        "Aimed Shot (C1)": ["constellation1","secondAimedCharged"]
    },

    arlecchino: {
        "Blood Debt Directive": ["skill", "sigilDmg"],
        "All is Ash (Spike)": ["skill", "spikeDmg"],
        "All is Ash (Cleave)": ["skill", "finalDmg"],
        "Balemoon Rising": ["burst", "burstDmg"],
        "Balemoon Bloodfire (C2)": ["constellation2", "bloodfireDmg"],
    },

    ayato: {
        "Kamisato Art: Kyouka": ["skill", "illusionDmg"],
        "Shunsuiken 0": ["skill", "dmg0"],
        "Shunsuiken 1": ["skill", "dmg1"],
        "Shunsuiken 2": ["skill", "dmg2"],
        "Kamisato Art: Suiyuu": ["burst", "dmg"],
        "Boundless Origin (C6)": ["constellation6", "dmg"]
    },
    
    // Should create an exception on her charged
    ayaka: {
        "Charge": ["charged", "dmg1"],
        "Hyouka": ["skill", "press"],
        "Soumetsu (Cutting)": ["burst", "cutting"],
        "Soumetsu (Bloom)": ["burst", "bloom"],
        "Mini-Frostflake Seki no To (Cutting) (C2)": ["constellation2", "dmg"],
        "Mini-Frostflake Seki no To (Bloom) (C2)": ["constellation2", "bloom"],
    },

    baizhu: {
        "Spiritvein Damage": ["burst", "dmg"],
        "Gossamer Sprite: Splice. (C2)": ["constellation2", "dmg"],
        "Universal Diagnosis": ["skill", "dmg"],
    },

    barbara: {
        "Let the Show Begin♪ (Droplet)": ["skill", "dmg"],
        "Let the Show Begin♪ (Melody Loop)": ["type", "subtype"], // No Opt
    },

    beidou: {
        "Tidecaller": ["skill", "baseDmg"],
        "Tidecaller (Level 1)": ["skill","dmgOneHit"],
        "Tidecaller (Level 2)": ["skill","dmgTwoHits"],
        "Stormbreaker (Initial)": ["burst", "burstDmg"],
        "Stormbreaker (Bounce)": ["burst", "lightningDmg"],
        "Stunning Revenge (C4)": ["constellation4","skillDmg"],
    },

    // Miss second hit for hold1/2 (["skill","hold1_2"], ["skill","hold2_2"])
    // Miss third hit for hold2 (["skill","explosion"])
    bennett: {
        "Passion Overload (Press)": ["skill", "press"],
        "Passion Overload (Level 1)": ["skill", "hold1_1"],
        "Passion Overload (Level 2)": ["skill", "hold2_1"],
        "Fantastic Voyage": ["burst", "dmg"],
        "Passion Overload (C4)": ["constellation4", "dmg"],
    },

    candace: {
        "Sacred Rite: Heron's Sanctum": ["skill", "basicDmg"],
        "Sacred Rite: Heron's Sanctum (Charged)": ["skill", "chargedDmg"],
        "Sacred Rite: Wagtail's Tide (Initial)": ["burst", "skillDmg"],
        "Sacred Rite: Wagtail's Tide (Wave)": ["burst", "waveDmg"],
        "The Overflow (C6)": ["constellation6", "dmg"],
    },

    charlotte: {
        "Spiritbreath Thorn (Charlotte)": ["charged", "thornDmg"],
        "Framing: Freezing Point Composition": ["skill", "photoPressDmg"],
        "Framing: Freezing Point Composition (Hold)": ["skill", "photoHoldDmg"],
        "Snappy Silhouette Mark": ["skill", "snapMarkDmg"],
        "Focused Impression Mark": ["skill", "focusMarkDmg"],
        "Still Photo: Comprehensive Confirmation": ["burst", "skillDmg"],
        "Still Photo: Kamera": ["burst", "kameraDmg"],
        "A Summation of Interest (C6)": ["constellation6", "dmg"],
    },

    chasca: {
        "Spirit Reins, Shadow Hunt": ["skill", "activationDmg"],
        "Normal 0": ["skill", "pressDmg"],
        "Shadowhunt Shell": ["skill", "shellDmg"],
        "Shining Shadowhunt Shell (pyro)": ["skill", "shiningShellDmg_pyro"],
        "Shining Shadowhunt Shell (hydro)": ["skill", "shiningShellDmg_hydro"],
        "Shining Shadowhunt Shell (cryo)": ["skill", "shiningShellDmg_cryo"],
        "Shining Shadowhunt Shell (electro)": ["skill", "shiningShellDmg_electro"],
        "Soulseeker Shell": ["burst", "shellDmg"],
        "Radiant Soulseeker Shell (pyro)": ["burst", "radiantDmg_pyro"],
        "Radiant Soulseeker Shell (hydro)": ["burst", "radiantDmg_hydro"],
        "Radiant Soulseeker Shell (cryo)": ["burst", "radiantDmg_cryo"],
        "Radiant Soulseeker Shell (electro)": ["burst", "radiantDmg_electro"],
        "Galesplitting Soulseeker Shell": ["burst", "galeSplittingDmg"],
        "Burning Shadowhunt Shell": ["passive2", "anemo"],
        "Burning Shadowhunt Shell (pyro)": ["passive2", "pyro"],
        "Burning Shadowhunt Shell (hydro)": ["passive2", "hydro"],
        "Burning Shadowhunt Shell (cryo)": ["passive2", "cryo"],
        "Burning Shadowhunt Shell (electro)": ["passive2", "electro"],
        "Shining Shadowhunt Shell (C2)": ["constellation2", "hydro", "pyro", "cryo", "electro"],
        "Radiant Shadowhunt Shell (C4)": ["constellation4", "hydro", "pyro", "cryo", "electro"],
    },

    chevreuse: {
        "Short-Range Rapid Interdiction Fire": ["skill", "pressDmg"],
        "Short-Range Rapid Interdiction Fire [Hold]": ["skill", "holdDmg"],
        "Short-Range Rapid Interdiction Fire [Overcharged]": ["skill", "ballDmg"],
        "Surging Blade (Chevreuse)": ["skill", "bladeDmg"],
        "Explosive Grenade": ["burst", "grenadeDmg"],
        "Secondary Explosive Shell": ["burst", "shellDmg"],
        "Sniper Induced Explosion (C2)": ["constellation2", "dmg"],
    },

    chiori: {
        "Fluttering Hasode (Upward Sweep)": ["skill", "sweepDmg"],
        "Fluttering Hasode (Tamato - Construct)": ["skill", "turretDmg"],
        "Fluttering Hasode (Tamato)": ["skill", "turretDmg"],
        "Hiyoku: Twin Blades": ["burst", "bloomDmg"],
        "Fluttering Hasode (Seize the Moment)": ["passive1", "dollDmg"],
        "Fluttering Hasode (Kinu)": ["constellation2", "dollDmg"],
    },

    chongyun: {
        "Spirit Blade: Chonghua's Layered Frost (A4)": ["passive2", "dmg"],
        "Spirit Blade: Chonghua's Layered Frost": ["skill", "dmg"],
        "Spirit Blade: Cloud-Parting Star": ["burst", "dmg"],
        "Chongyun C1": ["constellation1", "dmg"],
    },

    citlali: {
        "Obsidian Tzitzimitl DMG": ["skill", "obsidianDmg"],
        "Frostfall Storm DMG": ["skill", "frostfallStormDmg"],
        "Ice Storm DMG": ["burst", "iceStormDmg"],
        "Spiritvessel Skull DMG": ["burst", "skullDmg"],
        "Spiritvessel Skull DMG (C4)": ["constellation4", "dmg"],
    },

    clorinde: {
        "Swift Hunt (Normal shot) 0": ["skill", "normalDmg"],
        "Swift Hunt (Normal shot) 1": ["skill", "normalDmg"],
        "Swift Hunt (Normal shot) 2": ["skill", "normalDmg"],
        "Swift Hunt (Piercing Shot) 0": ["skill", "piercingDmg"],
        "Swift Hunt (Piercing Shot) 1": ["skill", "piercingDmg"],
        "Swift Hunt (Piercing Shot) 2": ["skill", "piercingDmg"],
        "Impale the Night (0% BoL)": ["skill", "thrust1Dmg"],
        "Impale the Night (<100% BoL)": ["skill", "thrust2Dmg"],
        "Impale the Night (100%+ BoL)": ["skill", "thrust3Dmg"],
        "Surging Blade": ["skill", "bladeDmg"],
        "Last Lightfall": ["burst", "skillDmg"],
        "Nightwatch Shade (C1)": ["constellation1", "dmg"],
        "Glimbright Shade (C6)": ["constellation6", "dmg"],
    },

    collei: {
        "Floral Brush": ["skill", "dmg"],
        "Trump-Card Kitty (Explosion)": ["burst", "explosionDmg"],
        "Trump-Card Kitty (Leap)": ["burst", "leapDmg"],
        "Floral Sidewinder (A1)": ["passive1", "dmg"],
        "Forest of Falling Arrows (C6)": ["constellation6", "dmg"],
    },

    cyno: {
        "Secret Rite: Chasmic Soulfarer": ["skill", "skillDmg"],
        "Mortuary Rite": ["skill", "riteDmg"],
        "Pactsworn Pathclearer 0": ["burst", "normal_0"],
        "Pactsworn Pathclearer 1": ["burst", "normal_1"],
        "Pactsworn Pathclearer 2": ["burst", "normal_2"],
        "Pactsworn Pathclearer 3": ["burst", "normal_3"],
        "Pactsworn Pathclearer 4": ["burst", "normal_4"],
        "Pactsworn Pathclearer Charge": ["burst", "charged"],
        "Low Plunge (Pactsworn Pathclearer)": ["burst","plunging_low"],
        "High Plunge (Pactsworn Pathclearer)": ["burst","plunging_high"],
        "Duststalker Bolt": ["passive1", "boltDmg"],
        "Raiment: Just Scales (C6)": ["passive1", "boltDmg"],
    },

    dahlia: {},

    dehya: {
        "Molten Inferno": ["skill", "indomitableDmg"],
        "Ranging Flame": ["skill", "rangingDmg"],
        "Molten Inferno (DoT)": ["skill", "fieldDmg"],
        "Incineration Drive": ["burst", "driveDmg"],
        "Flame-Mane's Fist": ["burst", "fistDmg"],
    },

    diluc: {
        "Searing Onslaught 0": ["skill", "firstHit"],
        "Searing Onslaught 1": ["skill", "secondHit"],
        "Searing Onslaught 2": ["skill", "thirdHit"],
        "Dawn (Strike)": ["burst", "slashDmg"],
        "Dawn (Tick)": ["burst", "dotDmg"],
        "Dawn (Explode)": ["burst", "explosionDmg"],
    },

    diona: {
        "Fully-Charged Aimed Shot (C4)": ["charged", "aimedCharged"],
        "Icy Paw": ["skill", "skillDmg"],
        "Signature Mix (Initial)": ["burst", "skillDmg"],
        "Signature Mix (Tick)": ["burst", "fieldDmg"],
    },

    dori: {
        "Troubleshooter Shot": ["skill", "shotDmg"],
        "After-Sales Service Round": ["skill", "roundDmg"],
        "Alcazarzaray's Exactitude: Connector DMG": ["burst", "connectorDmg"],
        "Special Franchise (C2)": ["constellation2", "dmg"],
    },

    emilie: {
        "Spiritbreath Thorn": ["skill", "thornDmg"],
        "Lumidouce Case (Summon)": ["skill", "skillDmg"],
        "Lumidouce Case (Level 1)": ["skill", "level1Dmg"],
        "Lumidouce Case (Level 2)": ["skill", "level2Dmg"],
        "Lumidouce Case (Level 3)": ["burst", "level3Dmg"],
        "Cleardew Cologne (A1)": ["passive1", "dmg"],
    },

    escoffier: {
        "Low-Temperature Cooking": ["skill", "skillDmg"],
        "Frosty Parfait": ["skill", "parfaitDmg"],
        "Surging Blade (Escoffier)": ["skill", "bladeDmg"],
        "Scoring Cuts": ["burst", "skillDmg"],
        "Special-Grade Frozen Parfait (C6)": ["constellation6", "dmg"],
    },

    eula: {
        "Icetide Vortex": ["skill", "press"],
        "Icetide Vortex (Hold)": ["skill", "hold"],
        "Icetide Vortex (Icewhirl)": ["skill", "icewhirl"],
        "Icetide (Lightfall)": ["passive1", "shatteredLightfallSword"],
        "Glacial Illumination (Initial)": ["burst", "dmg"],
        "Glacial Illumination (Lightfall)": ["burst", "lightFallSwordNew"],
    },

    faruzan: {
        "Wind Realm of Nasamjnin": ["skill", "skillDmg"],
        "Pressurized Collapse": ["skill", "vortexDmg"],
        "The Wind's Secret Ways": ["burst", "dmg"],
    },

    // Miss ["passive1","aimedChargedOz"], seems it's not implemented
    fischl: {
        "Thundering Retribution (A4)": ["passive2", "dmg"],
        "Gaze of the Deep (C1)": ["constellation1", "dmg"],
        "Her Pilgrimage of Bleak (C4)": ["constellation4", "burstAdditionalDmg"],
        "Evernight Raven (C6)": ["constellation6", "ozActiveCharDmg"],
        "Midnight Phantasmagoria": ["burst", "dmg"],
        "Oz (Summon)": ["skill", "summonDmg"],
        "Oz (Skill)": ["skill", "ozDmg"],
        "Oz (Burst)": ["skill", "ozDmg"],
    },

    freminet: {
        "Pressurized Floe: Upward Thrust": ["skill", "thrustDmg"],
        "Pressurized Floe: Pers Time Frost": ["skill", "frostDmg"],
        "Pressurized Floe: Shattering Pressure (Cryo Lvl 0)": ["skill", "level0Dmg"],
        "Pressurized Floe: Shattering Pressure (Cryo Lvl 1)": ["skill", "level1CryoDmg"],
        "Pressurized Floe: Shattering Pressure (Cryo Lvl 2)": ["skill", "level2CryoDmg"],
        "Pressurized Floe: Shattering Pressure (Cryo Lvl 3)": ["skill", "level3CryoDmg"],
        "Pressurized Floe: Shattering Pressure (Physical Lvl 1)": ["skill", "level1PhysDmg"],
        "Pressurized Floe: Shattering Pressure (Physical Lvl 2)": ["skill", "level2PhysDmg"],
        "Pressurized Floe: Shattering Pressure (Physical Lvl 3)": ["skill", "level3PhysDmg"],
        "Pressurized Floe: Shattering Pressure (Physical Lvl 4)": ["skill", "level4Dmg"],
        "Pressurized Floe: Spiritbreath Thorn": ["skill", "thornDmg"],
        "Shadowhunter's Ambush": ["burst", "dmg"],
    },

    furina: {
        "Spiritbreath Thorn (Furina)": ["normal", "thornBladeDmg"],
        "Surging Blade (Furina)": ["normal", "thornBladeDmg"],
        "Charge Pneuma": ["charged", "dmg"],
        "Charge Ousia": ["charged", "dmg"],
        "Salon Solitaire: Ousia Bubble": ["skill", "bubbleDmg"],
        "Salon Member: Surintendante Chevalmarin": ["skill", "chevalDmg"],
        "Salon Member: Gentilhomme Usher": ["skill", "usherDmg"],
        "Salon Member: Mademoiselle Crabaletta": ["skill", "crabDmg"],
        "Let the People Rejoice": ["burst", "skillDmg"],
    },

    gaming: {
        "Charmed Cloudstrider": ["skill", "cloudstriderDmg"],
        "Suanni's Gilded Dance": ["burst", "smashDmg"],
    },

    ganyu: {
        "Frostflake Arrow": ["charged", "frostflake"],
        "Frostflake Arrow Bloom": ["charged", "frostflakeBloom"],
        "Ice Lotus": ["skill", "dmg"],
        "Celestial Shower": ["burst", "dmg"],
    },

    gorou: {
        "Inuzaka All-Round Defense": ["skill", "dmg"],
        "Juuga: Forward Unto Victory": ["burst", "dmg"],
        "Crystal Collapse": ["burst", "crystalCollapse"],
    },
    
    // GO doesn’t use different names for the number of stacks; it only changes in the [Talents] section
    heizou: {
      "Heartstopper Strike": ["skill", "dmg"],
      "Fudou Style Vacuum Slugger": ["burst", "slugger_dmg"],
      "Windmuster Iris": ["burst", "hydro_iris_dmg", "pyro_iris_dmg", "cryo_iris_dmg", "electro_iris_dmg"],
    },

    // Miss ["burst","lowHpDmg"] sim doesn't have different names for <50% hp and >50% hp hu tao bursts
    // Maybe see with a4 proc
    hutao: {
        "Blood Blossom": ["skill", "dmg"],
        "Spirit Soother": ["burst", "dmg"], //! sim doesn't have different names for <50% hp and >50% hp hu tao bursts
        "Spirit Soother (Low HP)": ["burst","lowHpDmg"],
        "Low Plunge (Paramita Papilio)": ["plunging","low"], //! GO doesnt have different names for low and high plunge in skill state to normal state
        "High Plunge (Paramita Papilio)": ["plunging","high"],
    },

    iansan: {},

    ifa: {},

    ineffa: {},

    itto: {
        "Saichimonji Slash": ["charged", "sSlash"],
        "Arataki Kesagiri Final Slash": ["charged", "akFinal"],
        "Arataki Kesagiri Combo Slash": ["charged", "akSlash"],
        "Masatsu Zetsugi: Akaushi Burst!": ["skill", "dmg"],
    },

    jean: {
        "Gale Blade": ["skill", "dmg"],
        "Dandelion Breeze": ["burst", "dmg"],
        "Dandelion Breeze (In/Out)": ["burst", "enterExitDmg"],
        "swirl-pyro (aoe)": ["reaction", "pyroSwirl"],
        "swirl-hydro (aoe)": ["reaction", "hydroSwirl"],
        "swirl-cryo (aoe)": ["reaction", "cryoSwirl"],
        "swirl-electro (aoe)": ["reaction", "electroSwirl"],
    },

    kachina: {},

    kaeya: {
        "Frostgnaw": ["skill", "dmg"],
        "Glacial Waltz": ["burst", "dmg"],
    },

    kaveh: {
        "Artistic Ingenuity": ["skill","dmg"],
        "Painted Dome": ["burst","dmg"],
        "Pairidaeza's Dreams (C6)": ["constellation6","dmg"],
    },

    // Miss ["skill","hold"] don't have the diff on gcsim
    // Gcsim let only high_plunge after e
    kazuha: {
        "Soumon Swordsmanship (A1)": ["passive1", "absorb"],
        "High Plunge": ["skill", "phigh"],
        "Chihayaburu (Press)": ["skill", "press"],
        "Chihayaburu (Hold)": ["skill", "hold"],
        "Kazuha Slash": ["burst", "dmg"],
        "Kazuha Slash (DoT)": ["burst", "dot"],
        "Kazuha Slash (Absorb DoT)": ["burst", "absorb"],
    },

    keqing: {
        "Stellar Restoration": ["skill", "stiletto"],
        "Stellar Restoration (Slashing)": ["skill", "slash"],
        "Thunderclap Slash": ["skill", "thunderclap"],
        "Starward Sword (Initial)": ["burst", "initial"],
        "Starward Sword (Consecutive Slash)": ["burst", "slash"],
        "Starward Sword (Last Attack)": ["burst", "final"],
        "Stellar Restoration (C1)": ["constellation1", "dmg"],
    },

    kinich: {
        "Loop Shot 0": ["skill", "shotDmg"],
        "Loop Shot 1": ["skill", "shotDmg"],
        "Scalespiker Cannon": ["skill", "cannonDmg"],
        "Hail to the Almighty Dragonlord (Skill DMG)": ["burst", "skillDmg"],
        "Hail to the Almighty Dragonlord (Dragon Breath DMG)": ["burst", "laserDmg"],
        "Scalespiker Cannon (C6)": ["constellation6", "dmg"],
    },

    kirara: {
        "Flipclaw Strike": ["skill", "strikeDmg"],
        "Urgent Neko Parcel": ["skill", "parcelDmg"],
        "Tail-Flicking Flying Kick": ["skill", "tailDmg"],
        "Secret Art: Surprise Dispatch": ["burst", "skillDmg"],
        "Cat Grass Cardamom Explosion": ["burst", "explosionDmg"],
        "Steed of Skanda": ["constellation4", "dmg"],
    },

    klee: {
        "Jumpy Dumpty (Bounce)": ["skill","jumptyDumptyDmg"],
        "Jumpy Dumpty (Mine)": ["skill","mineDmg"],
        "Sparks'n'Splash": ["burst","dmg"],
        "Sparks'n'Splash (C1)": ["constellation1","chainedReactionsDmg"],
        "Sparkly Explosion (C4)": ["constellation4","sparklyExplosionDmg"],
    },

    kokomi: {
        "Bake-Kurage": ["skill", "dmg"],
        "Nereid's Ascension": ["burst", "dmg"],
        "At Water's Edge (C1)": ["constellation1", "dmg"],
    },

    kuki: {
        "Sanctifying Ring": ["skill","pressDmg"],
        "Grass Ring of Sanctification": ["skill","ringDmg"],
        "Gyoei Narukami Kariyama Rite": ["burst","singleDmg"],
        "Thundergrass Mark (C4)": ["constellation4","markDmg"],
    },

    lanyan: {
        "Feathermoon Ring": ["skill", "ringDmg"],
        "Feathermoon Ring (C1)": ["skill", "ringDmg"],
        "Lustrous Moonrise": ["burst", "dmg"],
        "Feathermoon Ring (hydro)": ["passive1", "hydro"],
        "Feathermoon Ring (C1) (hydro)": ["passive1", "hydro"],
        "Feathermoon Ring (pyro)": ["passive1", "pyro"],
        "Feathermoon Ring (C1) (pyro)": ["passive1", "pyro"],
        "Feathermoon Ring (cryo)": ["passive1", "cryo"],
        "Feathermoon Ring (C1) (cryo)": ["passive1", "cryo"],
        "Feathermoon Ring (electro)": ["passive1", "electro"],
        "Feathermoon Ring (C1) (electro)": ["passive1", "electro"],
    },

    lauma: {},

    layla: {
        "Charge 0":["charged","dmg1"],
        "Charge 1":["charged","dmg2"],
        "Nights of Formal Focus":["skill","skillDmg"],
        "Shooting Star":["skill","starDmg"],
        "Starlight Slug":["burst","slugDmg"],
    },

    // Miss ["skill","stack1"] (1 to 3) for conductive stacks
    lisa: {
        "Violet Arc (Press)": ["skill", "press"],
        "Violet Arc (Hold)": ["skill", "stack0"],
        "Lightning Rose (Initial)": ["burst", "summon"],
        "Lightning Rose (Tick)": ["burst", "tick"],
    },

    lynette: {
        "Normal 3": ["normal", "4"],
        "Charge 0": ["charged", "dmg1"],
        "Charge 1": ["charged", "dmg2"],
        "Enigmatic Feint":["skill","thrustDmg"],
        "Surging Blade (Lynette)":["skill","bladeDmg"],
        "Magic Trick: Astonishing Shift":["burst","dmg"],
        "Bogglecat Box":["burst","boxDmg"],
        "Vivid Shot":["burst","shotDmg"],
    },

    lyney: {
        "Fully-Charged Aimed Shot (Prop Arrow)" :["charged","prop"],
        "Pyrotechnic Strike": ["charged","pyrotechnic"],
        "Spiritbreath Thorn (Lyney)": ["charged","spiritbreath"],
        "Bewildering Lights": ["skill","dmg"],
        "Wondrous Trick: Miracle Parade": ["burst","dmg"],
        "Wondrous Trick: Miracle Parade (Explosive Firework)": ["burst","fireworkDmg"],
        "Pyrotechnic Strike: Reprised (C6)": ["constellation6","dmg"],
    },

    mavuika: {
        "The Named Moment": ["skill", "skillDmg"],
        "The Named Moment (Flamestrider)": ["skill", "skillDmg"],
        "Rings of Searing Radiance": ["skill", "radianceDmg"],
        "Flamestrider Normal 0": ["skill", "normal1Dmg"],
        "Flamestrider Normal 1": ["skill", "normal2Dmg"],
        "Flamestrider Normal 2": ["skill", "normal3Dmg"],
        "Flamestrider Normal 3": ["skill", "normal4Dmg"],
        "Flamestrider Normal 4": ["skill", "normal5Dmg"],
        "Flamestrider Charged Attack (Cyclic)": ["skill", "chargedCyclicDmg"],
        "Flamestrider Charged Attack (Final)": ["skill", "chargedFinalDmg"],
        "Flamestrider Sprint": ["skill", "sprintDmg"],
        "Flamestrider Plunge": ["skill", "plungeDmg"],
        "Sunfell Slice": ["burst", "skillDmg"],
        "Flamestrider (C6)": ["constellation6", "flamestriderDmg"],
        "Rings of Searing Radiance (C6)": ["constellation6", "ringDmg"],
    },

    mika: {
        "Flowfrost Arrow": ["skill", "arrowDmg"],
        "Rimestar Flare": ["skill", "flareDmg"],
        "Rimestar Shard": ["skill", "shardDmg"],
    },

    mizuki: {
        "Aisa Utamakura Pilgrimage": ["skill", "skillDmg"],
        "Dreamdrifter Continuous Attack": ["skill", "contDmg"],
        "Anraku Secret Spring Therapy": ["burst", "skillDmg"],
        "Munen Shockwave": ["burst", "shockwaveDmg"],
    },

    mona: {
        "Mirror Reflection of Doom (Tick)": ["skill", "dot"],
        "Mirror Reflection of Doom (Explode)": ["skill", "dmg"],
        "Illusory Bubble (Explosion)": ["burst", "dmg"],
        "Mirror Reflection of Doom (A1 Explode)": ["passive1", "dmg"],
    },

    // Miss ["constellation1","surgingDmg"] not differentiate from skill surging
    mualani: {
        "Sharky's Bite (0 momentum)":["skill","basicDmg"],
        "Sharky's Bite (1 momentum)":["skill","stack1Dmg"],
        "Sharky's Bite (2 momentum)":["skill","stack2Dmg"],
        "Sharky's Surging Bite": ["skill", "surgingDmg"],
        "Boomsharka-laka": ["burst", "dmg"],
    },

    nahida: {
        "All Schemes to Know (Press)": ["skill", "pressDmg"],
        "All Schemes to Know (Hold)": ["skill", "holdDmg"],
        "Tri-Karma Purification": ["skill", "karmaDmg"],
        "Tri-Karma Purification: Karmic Oblivion": ["constellation6", "dmg"],
    },

    navia: {
        "Rosula Shardshot": ["skill", "totalShardDmg"],
        "Surging Blade": ["skill", "bladeDmg"],
        "As the Sunlit Sky's Singing Salute": ["burst", "skillDmg"],
        "Cannon Fire Support": ["burst", "supportDmg"],
        "Cannon Fire Support (C2)": ["burst", "supportDmg"], //! (C2)
    },

    neuvillette: {
        "Charged Attack: Equitable Judgment": ["charged", "judgmentDmg"],
        "O Tides, I Have Returned: Waterfall DMG": ["burst", "waterfallDmg"],
        "O Tides, I Have Returned: Skill DMG": ["burst", "skillDmg"],
        "Spiritbreath Thorn (Neuvillette)": ["skill", "thornDmg"],
        "O Tears, I Shall Repay": ["skill", "skillDmg"],
        "Charged Attack: Equitable Judgment (C6)": ["constellation6", "currentDmg"],
    },

    nilou: {
        "Water Wheel": ["skill", "wheelDmg"],
        "Sword Dance 0": ["skill", "dance1Dmg"],
        "Sword Dance 1": ["skill", "dance2Dmg"],
        "Whirling Steps 0":["skill","whirl1Dmg"],
        "Whirling Steps 1":["skill","whirl2Dmg"],
        "Luminous Illusion": ["skill", "moonDmg"],
        "Dance of Haftkarsvar": ["skill", "skillDmg"],
        "Lingering Aeon": ["burst", "aeonDmg"],
        "Dance of Abzendegi: Distant Dreams, Listening Spring": ["burst", "skillDmg"],
        "Tranquility Aura": ["type", "subtype"], // No Opt
    },

    ningguang: {
        "Jade Screen": ["skill", "dmg"],
        "Starshatter": ["burst", "gemDmg"],
    },

    noelle: {
        "Breastplate": ["skill", "dmg"],
        "Sweeping Time (Burst)": ["burst", "burstDmg"],
        "Sweeping Time (Skill)": ["burst", "skillDmg"],
        "Breastplate (C4)": ["constellation4", "dmg"],
    },

    ororon: {
        "Spirit Orb DMG": ["skill", "dmg"],
        "Ritual DMG": ["burst", "activationDmg"],
        "Soundwave Collision DMG": ["burst", "soundwaveDmg"],
        "Hypersense": ["passive1", "dmg"],
        "Hypersense (C6)": ["constellation6", "dmg"],
    },

    qiqi: {
        "Herald of Frost: Initial Damage": ["skill", "castDmg"],
        "Herald of Frost: Skill Damage": ["skill", "tickDmg"],
        "Fortune-Preserving Talisman": ["burst", "dmg"],
    },

    // Miss ["burst","hit42"] for 2nd hit of n4 (marginal)
    // Miss ["burst","charged2"] for 2nd hit of charged
    raiden: {
        "Musou Shinsetsu": ["burst", "dmg"],
        "Musou Isshin 0": ["burst", "hit1"],
        "Musou Isshin 1": ["burst", "hit2"],
        "Musou Isshin 2": ["burst", "hit3"],
        "Musou Isshin 3": ["burst", "hit41"],
        "Musou Isshin 4": ["burst", "hit5"],
        "Musou Isshin (Charge Attack 0)": ["burst", "charged1"],
        "Musou Isshin (Charge Attack 1)": ["burst", "charged2"],
        "Plunge Collision (Musou Isshin)": ["burst","plunge"],
        "Low Plunge (Musou Isshin)": ["burst","plungeLow"],
        "High Plunge (Musou Isshin)": ["burst","plungeHigh"],
        "Eye of Stormy Judgement": ["skill", "dmg"],
        "Eye of Stormy Judgement (Strike)": ["skill", "coorDmg"],
    },

    razor: {
        "Claw and Thunder (Press)": ["skill", "press"],
        "Claw and Thunder (Hold)": ["skill", "hold"],
        "Lightning Fang": ["burst", "dmg"],
        "The Wolf Within 0": ["burst", "companionDmg1"],
        "The Wolf Within 1": ["burst", "companionDmg2"],
        "The Wolf Within 2": ["burst", "companionDmg3"],
        "The Wolf Within 3": ["burst", "companionDmg4"],
        "Lupus Fulguris": ["constellation6", "dmg"],
    },

    rosaria: {
        "Ravaging Confession (Hit 1)": ["skill", "hit1"],
        "Ravaging Confession (Hit 2)": ["skill", "hit2"],
        "Rites of Termination (Initial 1)": ["burst", "hit1"],
        "Rites of Termination (Initial 2)": ["burst", "hit2"],
        "Rites of Termination (DoT)": ["burst", "dotDmg"],
    },

    sara: {
        "Fully-Charged Aimed Shot (A1)": ["charged", "fullyAimed"],
        "Tengu Juurai: Ambush": ["skill", "dmg"],
        "Tengu Juurai: Ambush (C2)": ["constellation2", "dmg"],
        "Tengu Juurai: Titanbreaker": ["burst", "titanbreaker"],
        "Tengu Juurai: Stormcluster": ["burst", "stormcluster"],
    },

    sayu: {
        "Fuufuu Windwheel (DoT Press)": ["skill", "wheelDmg"],
        "Fuufuu Windwheel (DoT Hold)": ["skill", "wheelDmg"],
        "Fuufuu Whirlwind (Kick Press)": ["skill", "kickPressDmg"],
        "Fuufuu Whirlwind (Kick Hold)": ["skill", "kickHoldDmg"],
        "Yoohoo Art: Mujina Flurry": ["burst", "pressDmg"],
        "Muji-Muji Daruma": ["burst", "darumaDmg"],
    },

    // Miss ["burst", "dusk_2"] N2 during burst has 2 identical hit on gcsim (marginal)
    sethos: {
        "Shadowpiercing Shot": ["charged", "shadow"],
        "Ancient Rite: Thunderous Roar of Sand": ["skill", "dmg"],
        "Dusk Bolt 0": ["burst", "dusk_0"],
        "Dusk Bolt 1": ["burst", "dusk_1"],
        "Dusk Bolt 2": ["burst", "dusk_3"],
    },

    shenhe: {
        "Spring Spirit Summoning (Press)": ["skill", "press"],
        "Spring Spirit Summoning (Hold)": ["skill", "hold"],
        "Divine Maiden's Deliverance (Initial)": ["burst", "dmg"],
        "Divine Maiden's Deliverance (DoT)": ["burst", "dot"],
    },

    sigewinne: {
        "Mini-Stration Bubble": ["charged", "bubble"],
        "Rebound Hydrotherapy": ["skill", "dmg"],
        "Spiritbreath Thorn (Sigewinne)": ["skill", "bladeDmg"],
        "Super Saturated Syringing": ["burst", "spoutDmg"],
    },

    // Miss ["constellation6","burstDmg"] and ["constellation6","chargedDmg"]
    // Haven't found how to proc it on sims
    // Plunge are not yet implemented for skirk on gcsim
    skirk: {
        "Normal (Skill) 0": ["skill", "0"],
        "Normal (Skill) 1": ["skill", "1"],
        "Normal (Skill) 2": ["skill", "2"],
        "Normal (Skill) 3": ["skill", "3"],
        "Normal (Skill) 4": ["skill", "4"],
        "Charge (Skill) 0": ["skill", "chargedDmg"],
        "Charge (Skill) 1": ["skill", "chargedDmg"],
        "Charge (Skill) 2": ["skill", "chargedDmg"],
        "Havoc: Ruin (DoT)": ["burst", "skillDmg"],
        "Havoc: Ruin (Final)": ["burst", "finalDmg"],
        "Far to Fall (C1)": ["constellation1", "dmg"],
        "Havoc: Sever (Normal)": ["constellation6", "normalDmg"],
    },

    sucrose: {
        "Astable Anemohypostasis Creation-6308": ["skill", "press"],
        "Forbidden Creation-Isomer 75/Type II": ["burst", "dot"],
        "Forbidden Creation-Isomer 75/Type II (Absorb)": ["burst", "hydro", "pyro", "cryo", "electro"],
    },

    // Miss ["skill","normal62"] 2nd hit of N6
    tartaglia: {
        "Normal 0": ["skill", "normal1"],
        "Normal 1": ["skill", "normal2"],
        "Normal 2": ["skill", "normal3"],
        "Normal 3": ["skill", "normal4"],
        "Normal 4": ["skill", "normal5"],
        "Normal 5": ["skill", "normal61"],
        "Riptide Flash": ["charged", "flashDmg"],
        "Riptide Burst": ["charged", "burstDmg"],
        "Charged Attack 0": ["skill", "charged1"],
        "Charged Attack 1": ["skill", "charged2"],
        "Foul Legacy: Raging Tide": ["skill", "stanceDmg"],
        "Riptide Slash": ["skill", "riptideSlash"],
        "Ranged Stance: Flash of Havoc": ["burst", "rangedDmg"],
        "Melee Stance: Light of Obliteration": ["burst", "meleeDmg"],
        "Riptide Blast": ["burst", "riptideBlastDmg"],
    },

    thoma: {
        "Blazing Blessing": ["skill", "dmg"],
        "Crimson Ooyoroi": ["burst", "pressDmg"],
        "Fiery Collapse": ["burst", "collapseDmg"],
    },

    tighnari: {
        "Fully-Charged Aimed Shot (Wreath Arrow)": ["charged", "wreath"],
        "Clusterbloom Arrow": ["charged", "cluster"],
        "Vijnana-Phala Mine": ["skill", "dmg"],
        "Tanglevine Shaft": ["burst", "primaryDmg"],
        "Secondary Tanglevine Shaft": ["burst", "secondaryDmg"],
        "Karma Adjudged From the Leaden Fruit": ["constellation6", "cluster"],
    },

    traveleranemo: {
        "Palm Vortex (Tap)": ["skill", "initial_dmg"],
        "Palm Vortex Initial Cutting (Hold)": ["skill", "initial_dmg"],
        "Palm Vortex Max Cutting (Hold)": ["skill", "initial_max"],
        "Palm Vortex Initial Cutting Absorbed (Hold)": ["skill", "initial_ele_dmg"],
        "Palm Vortex Max Cutting Absorbed (Hold)": ["skill", "max_ele_dmg"],
        "Palm Vortex Initial Storm (Hold)": ["skill", "storm_dmg"],
        "Palm Vortex Max Storm (Hold)": ["skill", "storm_max"],
        "Palm Vortex Initial Storm Absorbed (Hold)": ["skill", "storm_ele_dmg"],
        "Palm Vortex Max Storm Absorbed (Hold)": ["skill", "storm_ele_max"],
        "Gust Surge": ["burst", "dmg"],
        "Gust Surge (Absorbed)": ["burst", "absorb"],
        "Slitting Wind (A1)": ["passive1", "dmg"],
    },

    travelerdendro: {
        "Razorgrass Blade": ["skill", "dmg"],
        "Lea Lotus Lamp": ["burst", "lampDmg"],
        "Lea Lotus Lamp (Explosion)": ["burst", "explosionDmg"],
    },

    // Miss ["burst","thirdThunderDmg"] which is written the same way as ["burst","thunderDmg"]
    travelerelectro: {
        "Lightning Blade": ["skill", "dmg"],
        "Bellowing Thunder": ["burst", "pressDmg"],
        "Falling Thunder": ["burst", "thunderDmg"],
    },

    travelergeo: {
        "Starfell Sword": ["skill", "dmg"],
        "Wake of Earth": ["burst", "dmg"],
        "Frenzied Rockslide (A4)": ["passive2", "dmg"],
        "Rockcore Meltdown": ["constellation2", "dmg"],
    },

    travelerhydro: {
        "Torrent Surge": ["skill", "surgeDmg"],
        "Dewdrop (Hold)": ["skill", "dewdropDmg"],
        "Spiritbreath Thorn": ["skill", "thornDmg"],
        "Rising Waters": ["burst", "dmg"],
    },

    travelerpyro: {
        "Blazing Threshold DMG": ["skill", "blazingDmg"],
        "Flowfire Blade (Hold DMG)": ["skill", "scorchingInstantDmg"],
        "Scorching Threshold": ["skill", "scorchingDmg"],
        "Plains Scorcher": ["burst", "dmg"],
    },

    // Miss ["burst","fpKickDmg"] and ["plunging","fplow"] haven't found how to proc them on gcsim
    varesa: {
        "Fiery Passion 0": ["normal", "fp0"],
        "Fiery Passion 1": ["normal", "fp1"],
        "Fiery Passion 2": ["normal", "fp2"],
        "Charged Attack (Follow-Up Strike)": ["charged", "dmg"],
        "Fiery Passion Charged Attack": ["charged", "fpDmg"],
        "Fiery Passion Charged Attack (Follow-Up Strike)": ["charged", "fpDmg"],
        "Fiery Passion Low Plunge": ["plunging","fplow"],
        "Fiery Passion High Plunge": ["plunging", "fphigh"],
        "Rush": ["skill", "rushDmg"],
        "Fiery Passion Rush": ["skill", "fpRushDmg"],
        "Flying Kick": ["burst", "kickDmg"],
        "Fiery Passion Flying Kick": ["burst","fpKickDmg"],
        "Volcano Kablam": ["burst", "volcanoDmg"],
    },

    venti: {
        "Skyward Sonnett (Press)": ["skill", "press"],
        "Skyward Sonnett (Hold)": ["skill", "hold"],
        "Wind's Grand Ode": ["burst", "base"],
        "Wind's Grand Ode (Absorbed)": ["burst", "absorb"],
        "Aimed Shot (C1)": ["constellation1", "aimed"],
        "Fully-Charged Aimed Shot (C1)": ["constellation1", "fully"],
    },

    // Miss ["constellation6","1"] and ["constellation6","2"] which scale with N2 and N3 instead of N1
    wanderer: {
        "Normal 0 (Windfavored)": ["normal", "0"],
        "Normal 1 (Windfavored)": ["normal", "1"],
        "Normal 2 (Windfavored)": ["normal", "2"],
        "Charge Attack (Windfavored)": ["charged", "dmg"],
        "Kyougen: Five Ceremonial Plays": ["burst", "dmg"],
        "Kyougen: Five Ceremonial Plays (Windfavored)": ["burst", "dmg"],
        "Gales of Reverie": ["passive2", "dmg"],
        "Hanega: Song of the Wind": ["skill", "dmg"],
        "Shugen: The Curtains’ Melancholic Sway": ["constellation6", "0"],
    },

    // Will be issue with Normal atk as it's the same element not like Ayato
    wriothesley: {
        "Rebuke: Vaulting Fist": ["charged", "rebukeDmg"],
        "Normal 0 (Enhanced)": ["skill", "enhanced_0"],
        "Normal 1 (Enhanced)": ["skill", "enhanced_1"],
        "Normal 2 (Enhanced)": ["skill", "enhanced_2"],
        "Normal 3 (Enhanced)": ["skill", "enhanced_3"],
        "Normal 4 (Enhanced)": ["skill", "enhanced_4"],
        "Darkgold Wolfbite": ["burst", "skillDmg"],
        "Surging Blade": ["burst", "bladeDmg"],
        "Rebuke: Vaulting Fist (C6)": ["constellation6", "icicleDmg"],
    },

    xiangling: {
        "Guoba": ["skill", "press"],
        "Pyronado Hit 1": ["burst", "dmg1"],
        "Pyronado Hit 2": ["burst", "dmg2"],
        "Pyronado Hit 3": ["burst", "dmg3"],
        "Pyronado": ["burst", "dmgNado"],
        "Oil Meets Fire (C2)": ["constellation2", "dmg"],
    },

    xianyun: {
        "Skyladder": ["skill","trailDmg"],
        "Driftcloud Wave (1 Leaps)": ["skill", "firstLeapDmg"],
        "Driftcloud Wave (2 Leaps)": ["skill", "secondLeapDmg"],
        "Driftcloud Wave (3 Leaps)": ["skill", "thirdLeapDmg"],
        "Stars Gather at Dusk (Initial)": ["burst", "instantDmg"],
        "Starwicker": ["burst", "coordinatedDmg"],
    },

    xiao: {
        "Lemniscatic Wind Cycling": ["skill", "press"],
    },

    xilonen: {
        "Yohual's Scratch": ["skill", "rushDmg"],
        "Blade Roller 0": ["normal", "ns0"],
        "Blade Roller 1": ["normal", "ns1"],
        "Ocelotlicue Point!": ["burst", "skillDmg"],
    },

    xingqiu: {
        "Xingqiu Orbital": ["type", "subtype"], //! No damage
        "Guhua Sword: Fatal Rainscreen 0": ["skill", "press1"], //! Only first hit because both hits have same name [add logic to get both hits]
        "Guhua Sword: Fatal Rainscreen 1": ["skill", "press2"], //! Only first hit because both hits have same name [add logic to get both hits]
        "Guhua Sword: Raincutter": ["burst", "dmg"],
    },

    xinyan: {
        "Sweeping Fervor (Initial)": ["skill","dmg"],
        "Sweeping Fervor (DoT)": ["skill","lvl3Dmg"],
        "Riff Revolution (Initial)": ["burst","pressPhysDmg"],
        "Riff Revolution (DoT)": ["burst","dotPyroDmg"],
    },

    // Missing ["skill","dmg3"] and ["skill","dmg4"] cause can't see Sesshou Sakura level (or number)
    yaemiko: {
        "Sesshou Sakura Tick": ["skill", "dmg2"],
        "Great Secret Art: Tenko Kenshin": ["burst", "dmg"],
        "Tenko Thunderbolt": ["burst", "tenkoDmg"],
    },

    // Missing ["charged","1"] to ["charged","4"], all seal number variation which we can't see
    yanfei: {
        "Charge Attack": ["charged", "0"],
        "Signed Edict": ["skill", "dmg"],
        "Done Deal": ["burst", "dmg"],
        "Blazing Eye (A4)": ["passive2", "dmg"],
    },

    yaoyao: {
        "Radish (Skill)": ["skill", "dmg"],
        "Moonjade Descent": ["burst", "skillDmg"],
        "Radish (Burst)": ["burst", "radish"],
        "Mega Radish": ["constellation6", "dmg"],
    },

    yelan: {
        "Lingering Lifeline": ["skill", "dmg"],
        "Depth-Clarion Dice": ["burst", "pressDmg"],
        "Exquisite Throw": ["burst", "throwDmg"],
        "Exquisite Throw (C2)": ["constellation2", "arrowDmg"],
        "Breakthrough Barb": ["constellation6", "barbDmg"], //! Same as Yelan charged
    },

    yoimiya: {
        "Aurous Blaze (Initial)": ["burst", "dmg"],
        "Aurous Blaze (Explode)": ["burst", "exp"],
        "Kindling (C6) - N0": ["constellation6", "0"], //! N1 * 2
        "Kindling (C6) - N1": ["constellation6", "1"], //! N2
        "Kindling (C6) - N2": ["constellation6", "2"], //! N3
        "Kindling (C6) - N3": ["constellation6", "3"], //! N4 * 2
        "Kindling (C6) - N4": ["constellation6", "4"], //! N5
    },

    // What should we do with additive damage like it's q or shenhe e ?
    yunjin: {
        "Opening Flourish (Press)":["skill","dmg"],
        "Opening Flourish (Level 1)":["skill","dmg1"],
        "Opening Flourish (Level 2)":["skill","dmg2"],
        "Cliffbreaker's Banner":["burst","dmg"],
    },

    zhongli: {
        "Stone Stele (Initial)": ["skill", "stele"],
        "Stone Stele (Hold)": ["skill", "holdDMG"],
        "Stone Stele (Tick)": ["skill", "resonance"],
        "Planet Befall": ["burst", "dmg"],
    }
};

export { defaultAbils, characterAbils };

export default function (charName?: string) {
    if (!charName || !characterAbils[charName]) {
        return defaultAbils;
    }
    // some abils have the same name in gcsim, but different paths in go
    // like charged (["charged", "dmg"] for most characters, but ["charged", "dmg1"] for ayaka)
    return { ...defaultAbils, ...characterAbils[charName] };
}