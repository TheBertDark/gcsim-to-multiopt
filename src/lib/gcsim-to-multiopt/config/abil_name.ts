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
    "Charge 0": ["charge1", "subtype"],
    "Charge 1": ["charge2", "subtype"],
    "Aimed Shot": ["charged", "aimed"],
    "Fully-Charged Aimed Shot": ["charged", "aimedCharged"],
    "Surging Blade": ["skill", "bladeDmg"],
    "Low Plunge": ["plunging", "low"],
    "High Plunge": ["plunging", "high"],
    "Plunge Collision": ["plunging", "dmg"],

    //TODO reactions
    "bloom": ["reaction", "bloom"],
    "bloom (self damage)": ["type", "subtype"], //! Self damage (not relevant)
    "burning": ["reaction", "burning"],
    "hyperbloom": ["reaction", "hyperbloom"],
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

    //TODO passives/skills
    //?---------------------Albedo---------------------//
    //!"Charge 0": ["charged", "dmg1"]
    //!"Charge 1": ["charged", "dmg2"] //path same as alhaitam charge, this generates conflicts
    "Abiogenesis: Solar Isotoma": ["skill", "dmg"],
    "Abiogenesis: Solar Isotoma (Tick)": ["skill", "blossom"],

    //?---------------------Alhaitam-------------------//
    //!"Charge 1": ["charged", "dmg"] //path same as albedo charge, this generates conflicts
    "Universality: An Elaboration on Form": ["skill", "rushDmg"],
    "Chisel-Light Mirror: Projection Attack 1": ["skill", "mirrorDmg1"],
    "Chisel-Light Mirror: Projection Attack 2": ["skill", "mirrorDmg1"],
    "Chisel-Light Mirror: Projection Attack 3": ["skill", "mirrorDmg1"],
    "Particular Field: Fetters of Phenomena": ["burst", "instanceDmg"],
    
    //?---------------------Aloy-----------------------//
    "Freeze Bomb": ["skill", "freezeBombDmg"],
    "Chillwater Bomblets": ["skill", "chillWaterBomblets"],
    "Prophecies of Dawn": ["burst", "dmg"],

    //?---------------------Amber----------------------//
    //!"Aimed Shot": ["type", "subtype"], //Other characters have this?
    //!"Fully-Charged Aimed Shot": ["type", "subtype"], //Other characters have this?
    "Baron Bunny": ["skill", "dmg"],
    "Baron Bunny (Manual Explosion)": ["constellation2", "manualDetonationDmg"], //!C2
    "Fiery Rain": ["burst", "dmgPerWave"],

    //?-------------------Arlecchino-------------------//
    "Blood Debt Directive": ["skill", "sigilDmg"],
    "All is Ash (Spike)": ["skill", "spikeDmg"],
    "All is Ash (Cleave)": ["skill", "finalDmg"],
    "Balemoon Rising": ["burst", "burstDmg"],
    "Balemoon Bloodfire (C2)": ["constellation2", "bloodfireDmg"],
    
    //?---------------------Ayato----------------------//
    "Kamisato Art: Kyouka": ["skill", "illusionDmg"],
    "Kamisato Art: Suiyuu": ["burst", "dmg"],
    "Ayato C6": ["constellation6", "dmg"],
    
    //?---------------------Ayaka----------------------//
    //"Charge": ["charged", "dmg1"],
    "Dash": ["type", "subtype"], //! No damage
    "Hyouka": ["skill", "press"],
    "C2 Mini-Frostflake Seki no To (Bloom)": ["constellation2", "bloom"],
    "Soumetsu (Bloom)": ["burst", "bloom"],
    "C2 Mini-Frostflake Seki no To (Cutting)": ["constellation2", "dmg"],
    "Soumetsu (Cutting)": ["burst", "cutting"],
    
    //?---------------------Baizhu---------------------//
    "Spiritvein Damage": ["burst", "dmg"],
    "Gossamer Sprite: Splice. (Baizhu's C2)": ["constellation2", "dmg"],
    "Universal Diagnosis": ["skill", "dmg"],

    //?---------------------Barbara--------------------//
    "Let the Show Begin♪ (Droplet)": ["skill", "dmg"],
    "Let the Show Begin♪ (Melody Loop)": ["type", "subtype"], //! No damage? Apply hydro

    //?---------------------Beidou---------------------//
    "Tidecaller (E)": ["skill", "baseDmg"], //! Base damage [Modifi for "DMG w/1 hit or 2 hits"]
    "Stormbreaker (Q)": ["burst", "burstDmg"],
    "Stormbreak Proc (Q)": ["burst", "lightningDmg"],
    
    //?---------------------Bennett--------------------//
    "Passion Overload (Press)": ["skill", "press"],
    "Passion Overload (Level 1)": ["skill", "hold1_1"], //! Specify hit 1 or 2
    "Passion Overload (Level 2)": ["skill", "hold2_1"], //! Specify hit 1 or 2
    "Fantastic Voyage": ["burst", "dmg"],
    "Passion Overload (C4)": ["constellation4", "dmg"],
    
    //?---------------------Candace--------------------//
    "Sacred Rite: Heron's Sanctum (E)": ["skill", "basicDmg"],
    "Sacred Rite: Heron's Sanctum Charged Up (E)": ["skill", "chargedDmg"],
    "Sacred Rite: Wagtail's Tide (Q)": ["burst", "skillDmg"],
    "Sacred Rite: Wagtail's Tide (Wave)": ["burst", "waveDmg"],
    "The Overflow (C6)": ["constellation6", "dmg"],

    //?---------------------Charlotte------------------//
    "Spiritbreath Thorn (Charlotte)": ["charged", "thornDmg"],
    "Framing: Freezing Point Composition": ["skill", "photoPressDmg"],
    "Framing: Freezing Point Composition (Hold)": ["skill", "photoHoldDmg"],
    "Snappy Silhouette Mark": ["skill", "snapMarkDmg"],
    "Focused Impression Mark": ["skill", "focusMarkDmg"],
    "Still Photo: Comprehensive Confirmation": ["burst", "skillDmg"],
    "Still Photo: Kamera": ["burst", "kameraDmg"],
    "charlotte-c6-coordinate-atk": ["constellation6", "dmg"],

    //?---------------------Chasca---------------------//
    "Spirit Reins, Shadow Hunt": ["skill", "activationDmg"],
    "Shadowhunt Shell": ["skill", "shellDmg"],
    "Shining Shadowhunt Shell (hydro)": ["skill", "shiningShellDmg_hydro"],
    "Shining Shadowhunt Shell (pyro)": ["skill", "shiningShellDmg_pyro"],
    "Shining Shadowhunt Sheel (cryo)": ["skill", "shiningShellDmg_cryo"],
    "Shining Shadowhunt Shell (electro)": ["skill", "shiningShellDmg_electro"],
    "Radiant Soulseeker Shell (hydro)": ["burst", "radiantDmg_hydro"],
    "Galesplitting Soulseeker Shell": ["burst", "galeSplittingDmg"],
    "Burning Shadowhunt Shell (pyro)": ["passive2", "pyro"],
    "Burning Shadowhunt Shell (hydro)": ["passive2", "hydro"],
    "Burning Shadowhunt Shell (electro)": ["passive2", "electro"],
    "Burning Shadowhunt Shell (cryo)": ["passive2", "cryo"],
    "Shining Shadowhunt Shell (C2)": ["constellation2", "pyro"],
    "Radiant Shadowhunt Shell (C4)": ["constellation4", "hydro"],
    
    //?--------------------Chevreuse-------------------//
    "Short-Range Rapid Interdiction Fire": ["skill", "pressDmg"],
    "Short-Range Rapid Interdiction Fire [Hold]": ["skill", "holdDmg"],
    "Short-Range Rapid Interdiction Fire [Overcharged]": ["skill", "ballDmg"],
    "Surging Blade (Chevreuse)": ["skill", "bladeDmg"],
    "Explosive Grenade": ["burst", "grenadeDmg"],
    "Secondary Explosive Shell": ["burst", "shellDmg"],
    "Sniper Induced Explosion (C2)": ["constellation2", "dmg"],
    
    //?---------------------Chiori---------------------//
    "Fluttering Hasode (Upward Sweep)": ["skill", "sweepDmg"],
    "Fluttering Hasode (Tamato - Construct)": ["skill", "turretDmg"],
    "Fluttering Hasode (Tamato)": ["skill", "turretDmg"],
    "Hiyoku: Twin Blades": ["burst", "bloomDmg"],
    "Fluttering Hasode (Seize the Moment)": ["passive1", "dollDmg"],
    "Fluttering Hasode (Kinu)": ["constellation2", "dollDmg"],
    "Cleardew Cologne (A1)": ["passive1", "dmg"],

    //?---------------------Chongyun-------------------//
    "Spirit Blade: Chonghua's Layered Frost (A4)": ["passive2", "dmg"],
    "Spirit Blade: Chonghua's Layered Frost": ["skill", "dmg"],
    "Spirit Blade: Cloud-Parting Star": ["burst", "dmg"],
    "Chongyun C1": ["constellation1", "dmg"],

    //?---------------------Citlali--------------------//
    "Obsidian Tzitzimitl DMG": ["skill", "obsidianDmg"],
    "Frostfall Storm DMG": ["skill", "frostfallStormDmg"],
    "Ice Storm DMG": ["burst", "iceStormDmg"],
    "Spiritvessel Skull DMG": ["burst", "skullDmg"],
    "Spiritvessel Skull DMG (C4)": ["constellation4", "dmg"],

    //?---------------------Clorinde-------------------//
    "Swift Hunt (Piercing Shot) 0": ["skill", "piercingDmg"],
    "Swift Hunt (Piercing Shot) 1": ["skill", "piercingDmg"],
    "Swift Hunt (Piercing Shot) 2": ["skill", "piercingDmg"],
    "Impale the Night (0% BoL)": ["skill", "thrust1Dmg"],
    "Impale the Night (<100% BoL)": ["skill", "thrust2Dmg"],
    "Impale the Night (100%+ BoL)": ["skill", "thrust3Dmg"],
    "Burst": ["burst", "skillDmg"],
    "Nightwatch Shade (C1)": ["constellation1", "dmg"],
    "Glimbright Shade (C6)": ["constellation6", "dmg"],

    //?---------------------Collei---------------------//
    "Floral Brush": ["skill", "dmg"],
    "Trump-Card Kitty (Explosion)": ["burst", "explosionDmg"],
    "Trump-Card Kitty (Leap)": ["burst", "leapDmg"],
    "Floral Sidewinder (A1)": ["passive1", "dmg"],
    "Forest of Falling Arrows (C6)": ["constellation6", "dmg"],

    //?---------------------Cyno-----------------------//
    "Secret Rite: Chasmic Soulfarer": ["skill", "skillDmg"],
    "Mortuary Rite": ["skill", "riteDmg"],
    "Pactsworn Pathclearer 0": ["burst", "normal_0"],
    "Pactsworn Pathclearer 1": ["burst", "normal_1"],
    "Pactsworn Pathclearer 2": ["burst", "normal_2"],
    "Pactsworn Pathclearer 3": ["burst", "normal_3"],
    "Duststalker Bolt": ["passive1", "boltDmg"],
    "Raiment: Just Scales (C6)": ["passive1", "boltDmg"],

    //?---------------------Dehya----------------------//
    "Molten Inferno": ["skill", "indomitableDmg"],
    "Ranging Flame": ["skill", "rangingDmg"],
    "Molten Inferno (DoT)": ["skill", "fieldDmg"],
    "Incineration Drive": ["burst", "driveDmg"],
    "Flame-Mane's Fist": ["burst", "fistDmg"],

    //?---------------------Diluc----------------------//
    "Searing Onslaught 0": ["skill", "firstHit"],
    "Searing Onslaught 1": ["skill", "secondHit"],
    "Searing Onslaught 2": ["skill", "thirdHit"],
    "Dawn (Strike)": ["burst", "slashDmg"],
    "Dawn (Tick)": ["burst", "dotDmg"],

    //?---------------------Diona----------------------//
    "Fully-Charged Aimed Shot (C4)": ["charged", "aimedCharged"],
    "Icy Paw": ["skill", "skillDmg"],
    "Signature Mix (Initial)": ["burst", "skillDmg"],
    "Signature Mix (Tick)": ["burst", "fieldDmg"],

    //?---------------------Dori-----------------------//
    "Troubleshooter Shot": ["skill", "shotDmg"],
    "After-Sales Service Round": ["skill", "roundDmg"],
    "Alcazarzaray's Exactitude: Connector DMG": ["burst", "connectorDmg"],
    "Special Franchise": ["constellation2", "dmg"],

    //?---------------------Emilie---------------------//
    "Lumidouce Case (Summon)": ["skill", "skillDmg"],
    "Lumidouce Case (Level 1)": ["skill", "level1Dmg"],
    "Lumidouce Case (Level 2)": ["skill", "level2Dmg"],
    "Spiritbreath Thorn": ["skill", "thornDmg"],

    //?---------------------Escoffier------------------//
    "Low-Temperature Cooking": ["skill", "skillDmg"],
    "Frosty Parfait": ["skill", "parfaitDmg"],
    "Surging Blade (Escoffier)": ["skill", "bladeDmg"],
    "Scoring Cuts": ["burst", "skillDmg"],
    "Special-Grade Frozen Parfait (C6)": ["constellation6", "dmg"],

    //?---------------------Eula-----------------------//
    "Icetide Vortex": ["skill", "press"],
    "Icetide Vortex (Hold)": ["skill", "hold"],
    "Icetide Vortex (Icewhirl)": ["skill", "icewhirl"],
    "Icetide (Lightfall)": ["passive1", "shatteredLightfallSword"],
    "Glacial Illumination": ["burst", "dmg"],
    "Glacial Illumination (Lightfall)": ["burst", "lightFallSwordNew"],

    //?---------------------Faruzan--------------------//
    "Wind Realm of Nasamjnin (E)": ["skill", "skillDmg"],
    "Pressurized Collapse": ["skill", "vortexDmg"],
    "The Wind's Secret Ways (Q)": ["burst", "dmg"],

    //?---------------------Fischl---------------------//
    "Fischl A4": ["passive2", "dmg"],
    "Fischl C1": ["constellation1", "dmg"],
    "Her Pilgrimage of Bleak (C4)": ["constellation4", "burstAdditionalDmg"],
    "Fischl C6": ["constellation6", "ozActiveCharDmg"],
    "Midnight Phantasmagoria": ["burst", "dmg"],
    "Oz (Summon)": ["skill", "summonDmg"],
    "Oz (Skill)": ["skill", "ozDmg"],
    "Oz (Burst)": ["skill", "ozDmg"],

    //?---------------------Freminet-------------------//
    "Pressurized Floe: Upward Thrust": ["skill", "thrustDmg"],
    "Pressurized Floe: Spiritbreath Thorn": ["skill", "thornDmg"],
    "Pressurized Floe: Shattering Pressure (Cryo)": ["skill", "level0Dmg"],
    "Pressurized Floe: Pers Time Frost": ["skill", "frostDmg"],
    "Shadowhunter's Ambush": ["burst", "dmg"],

    //?---------------------Furina---------------------//
    "Spiritbreath Thorn (Furina)": ["normal", "thornBladeDmg"],
    "Surging Blade (Furina)": ["normal", "thornBladeDmg"],
    "Charge Pneuma": ["charged", "dmg"], //! I dont sure this is correct
    "Charge Ousia": ["charged", "dmg"], //! I dont sure this is correct
    "Salon Solitaire: Ousia Bubble": ["skill", "bubbleDmg"],
    "Salon Member: Surintendante Chevalmarin": ["skill", "chevalDmg"],
    "Salon Member: Gentilhomme Usher": ["skill", "usherDmg"],
    "Salon Member: Mademoiselle Crabaletta": ["skill", "crabDmg"],
    "Let the People Rejoice": ["burst", "skillDmg"],

    //?---------------------Gaming---------------------//
    "Charmed Cloudstrider": ["skill", "cloudstriderDmg"],
    "Suanni's Gilded Dance (Q)": ["burst", "smashDmg"],

    //?---------------------Ganyu----------------------//
    "Frostflake Arrow": ["charged", "frostflake"],
    "Frostflake Arrow Bloom": ["charged", "frostflakeBloom"],
    "Ice Lotus": ["skill", "dmg"],
    "Celestial Shower": ["burst", "dmg"],

    //?---------------------Gorou----------------------//
    "Inuzaka All-Round Defense": ["skill", "dmg"],
    "Juuga: Forward Unto Victory": ["burst", "dmg"],
    "Crystal Collapse": ["burst", "crystalCollapse"],
    
    //?---------------------Heizou---------------------//

    //?---------------------Hu Tao---------------------//
    "Blood Blossom": ["skill", "dmg"],
    "Spirit Soother": ["burst", "dmg"],
    "Paramita (0 dmg)": ["skill", "atk"],

    //?---------------------Itto-----------------------//
    "Arataki Kesagiri Final Slash": ["charged", "akFinal"],
    "Arataki Kesagiri Combo Slash": ["charged", "akSlash"],
    "Masatsu Zetsugi: Akaushi Burst!": ["skill", "dmg"],
    
    //?---------------------Iansan---------------------//
    //?---------------------Jean-----------------------//
    //?---------------------Kachina--------------------//
    //?---------------------Kaeya----------------------//
    //?---------------------Kaveh----------------------//

    //?---------------------Kazuha---------------------//
    "Kazuha A1": ["passive1", "absorb"],
    // "High Plunge": ["skill", "phigh"], //! Not sure
    "Chihayaburu": ["skill", "press"], //! Not sure
    "Kazuha Slash": ["burst", "dmg"],
    "Kazuha Slash (Dot)": ["burst", "dot"],
    "Kazuha Slash (Absorb Dot)": ["burst", "absorb"],

    //?---------------------Keqing---------------------//

    //?---------------------Kinich---------------------//
    "Loop Shot 0": ["skill", "shotDmg"],
    "Loop Shot 1": ["skill", "shotDmg"],
    "Scalespiker Cannon": ["skill", "cannonDmg"],
    "Scalespiker Cannon (C6)": ["constellation6", "dmg"],

    //?---------------------Kirara---------------------//
    "Flipclaw Strike": ["skill", "strikeDmg"],
    "Urgent Neko Parcel": ["skill", "parcelDmg"],
    "Secret Art: Surprise Dispatch": ["burst", "skillDmg"],
    "Cat Grass Cardamom Explosion": ["burst", "explosionDmg"],
    "Steed of Skanda": ["constellation4", "dmg"],

    //?---------------------Klee-----------------------//

    //?---------------------Kokomi---------------------//
    "Bake-Kurage": ["skill", "dmg"],
    "Nereid's Ascension": ["burst", "dmg"],
    "At Water's Edge (C1)": ["constellation1", "dmg"],

    //?---------------------Kuki-----------------------//
    //?---------------------Lan Yan--------------------//
    //?---------------------Layla----------------------//

    //?---------------------Lisa-----------------------//
    "Lightning Rose (Initial)": ["burst", "summon"],
    "Lightning Rose (Tick)": ["burst", "tick"],

    //?---------------------Lynette--------------------//
    //?---------------------Lyney----------------------//
    
    //?---------------------Mavuika--------------------//
    "The Named Moment (Flamestrider)": ["skill", "skillDmg"],
    "Flamestrider Normal 0": ["skill", "normal1Dmg"],
    "Flamestrider Normal 1": ["skill", "normal2Dmg"],
    "Flamestrider Normal 2": ["skill", "normal3Dmg"],
    "Flamestrider Normal 3": ["skill", "normal4Dmg"],
    "Flamestrider Normal 4": ["skill", "normal5Dmg"],
    "Flamestrider Charged Attack (Cyclic)": ["skill", "chargedCyclicDmg"],
    "Flamestrider Charged Attack (Final)": ["skill", "chargedFinalDmg"],
    "Flamestrider Sprint": ["skill", "sprintDmg"],
    "Sunfell Slice": ["burst", "skillDmg"],
    "The Named Moment": ["skill", "skillDmg"],
    "Rings of Searing Radiance": ["skill", "radianceDmg"],
    "Flamestrider (C6)": ["constellation6", "flamestriderDmg"],
    "Rings of Searing Radiance (C6)": ["constellation6", "ringDmg"],

    //?---------------------Mika-----------------------//
    //?---------------------Mona-----------------------//

    //?---------------------Mualani--------------------//
    //!"Surfing Hit": ["type", "subtype"],
    "Sharky's Surging Bite": ["skill", "surgingDmg"],
    "Boomsharka-laka": ["burst", "dmg"],

    //?---------------------Nahida---------------------//
    "All Schemes to Know (Press)": ["skill", "pressDmg"],
    "Tri-Karma Purification": ["skill", "karmaDmg"],
    "Tri-Karma Purification: Karmic Oblivion": ["constellation6", "dmg"],

    //?---------------------Navia----------------------//
    "Rosula Shardshot": ["skill", "totalShardDmg"],
    "As the Sunlit Sky's Singing Salute": ["burst", "skillDmg"],
    "Cannon Fire Support": ["burst", "supportDmg"],
    "The President's Pursuit of Victory": ["burst", "supportDmg"], //! (C2)

    //?---------------------Neuvillette----------------//
    "Charged Attack: Equitable Judgment": ["charged", "judgmentDmg"],
    "O Tides, I Have Returned: Waterfall DMG": ["burst", "waterfallDmg"],
    "O Tides, I Have Returned: Skill DMG": ["burst", "skillDmg"],
    "Spiritbreath Thorn (Neuvillette)": ["skill", "thornDmg"],
    "O Tears, I Shall Repay": ["skill", "skillDmg"],
    "Charged Attack: Equitable Judgment (C6)": ["constellation6", "currentDmg"],

    //?---------------------Nilou----------------------//
    "Tranquility Aura": ["element", "hydro"], //! No damage
    "Water Wheel": ["skill", "wheelDmg"],
    "Sword Dance 0": ["skill", "dance1Dmg"],
    "Sword Dance 1": ["skill", "dance2Dmg"],
    "Dance of Haftkarsvar": ["skill", "skillDmg"],
    "Lingering Aeon": ["burst", "aeonDmg"],
    "Dance of Abzendegi: Distant Dreams, Listening Spring": ["burst", "skillDmg"],


    //?---------------------Ningguang------------------//
    //?---------------------Noelle---------------------//
    //?---------------------Ororon---------------------//
    //?---------------------Qiqi-----------------------//

    //?---------------------Raiden---------------------//
    "Musou Shinsetsu": ["burst", "dmg"],
    "Musou Isshin 0": ["burst", "hit1"],
    "Musou Isshin 1": ["burst", "hit2"],
    "Musou Isshin 2": ["burst", "hit3"],
    "Musou Isshin 3": ["burst", "hit41"], //! N3 have 2 hits whit different Multipliers but difference is insignificative
    "Eye of Stormy Judgement": ["skill", "dmg"],
    "Eye of Stormy Judgement (Strike)": ["skill", "coorDmg"],

    //?---------------------Razor----------------------//

    //?---------------------Rosaria--------------------//
    "Ravaging Confession (Hit 1)": ["skill", "hit1"],
    "Ravaging Confession (Hit 2)": ["skill", "hit2"],
    "Rites of Termination (Hit 1)": ["burst", "hit1"],
    "Rites of Termination (Hit 2)": ["burst", "hit2"],
    "Rites of Termination (DoT)": ["burst", "dotDmg"],

    //?---------------------Sara-----------------------//
    "Fully-Charged Aimed Shot (A1)": ["charged", "fullyAimed"], //! Same other characters?
    "Tengu Juurai: Ambush": ["skill", "dmg"],
    "Tengu Juurai: Ambush C2": ["constellation2", "dmg"],
    "Tengu Juurai: Titanbreaker": ["burst", "titanbreaker"],
    "Tengu Juurai: Stormcluster": ["burst", "stormcluster"],

    //?---------------------Sayu-----------------------//
    //?---------------------Sethos---------------------//

    //?---------------------Shenhe---------------------//
    "Spring Spirit Summoning (Press)": ["skill", "press"],
    "Spring Spirit Summoning (Hold)": ["skill", "hold"],
    "Divine Maiden's Deliverance (Initial)": ["burst", "dmg"],
    "Divine Maiden's Deliverance (DoT)": ["burst", "dot"],

    //?---------------------Sigewinne------------------//

    //?---------------------Sucrose--------------------//
    "Astable Anemohypostasis Creation-6308": ["skill", "press"],
    "Forbidden Creation-Isomer 75/Type II": ["burst", "dot"],
    "Forbidden Creation-Isomer 75/Type II (Absorb)": ["burst", "cryo"],

    //?---------------------Tartaglia------------------//
    //?---------------------Thoma----------------------//
    //?---------------------Tighnari-------------------//
    //?---------------------Traveler (Anemo)-----------//
    //?---------------------Traveler (Cryo)------------//

    //?---------------------Traveler (Dendro)----------//
    "Razorgrass Blade": ["skill", "dmg"],
    "Lea Lotus Lamp": ["burst", "lampDmg"],

    //?---------------------Traveler (Electro)---------//
    //?---------------------Traveler (Geo)-------------//
    //?---------------------Traveler (Hydro)-----------//
    //?---------------------Traveler (Pyro)------------//
    //?---------------------Varesa---------------------//
    //?---------------------Venti----------------------//

    //?---------------------Wanderer-------------------//
    "Normal 0 (Windfavored)": ["normal", "0"],
    "Normal 1 (Windfavored)": ["normal", "1"],
    "Normal 2 (Windfavored)": ["normal", "2"],
    "Kyougen: Five Ceremonial Plays (Windfavored)": ["burst", "dmg"],
    "Gales of Reverie": ["passive2", "dmg"],
    "Hanega: Song of the Wind": ["skill", "dmg"],
    "Shugen: The Curtains’ Melancholic Sway": ["constellation6", "0"],

    //?---------------------Wriothesley----------------//
    //?---------------------Xiangling------------------//

    //?---------------------Xiangyun-------------------//
    "Driftcloud Wave (1 Leaps)": ["skill", "firstLeapDmg"],
    "Driftcloud Wave (2 Leaps)": ["skill", "secondLeapDmg"],
    "Driftcloud Wave (3 Leaps)": ["skill", "thirdLeapDmg"],
    "Stars Gather at Dusk (Initial)": ["burst", "instantDmg"],
    "Starwicker": ["burst", "coordinatedDmg"],

    //?---------------------Xiao-----------------------//
    
    //?---------------------Xilonen--------------------//
    "Yohual's Scratch": ["skill", "rushDmg"],
    "Blade Roller 0": ["normal", "ns0"],
    "Blade Roller 1": ["normal", "ns1"],
    "Ocelotlicue Point!": ["burst", "skillDmg"],
    
    //?---------------------Xingqiu--------------------//
    "Xingqiu Orbital": ["type", "subtype"], //! No damage
    "Guhua Sword: Fatal Rainscreen": ["skill", "press1"], //! Only first hit because both hits have same name
    "Guhua Sword: Raincutter": ["burst", "dmg"],

    //?---------------------Xinyan---------------------//
    //?---------------------Yae Miko-------------------//
    //?---------------------Yanfei---------------------//
    //?---------------------Yaoyao---------------------//

    //?---------------------Yelan----------------------//
    "Lingering Lifeline": ["skill", "dmg"],
    "Depth-Clarion Dice": ["burst", "pressDmg"],
    "Exquisite Throw": ["burst", "throwDmg"],
    "Yelan C2 Proc": ["constellation2", "arrowDmg"],
    "Breakthrough Barb": ["constellation6", "barbDmg"], //! Same as Yelan charged

    //?---------------------Yoimiya--------------------//
    "Aurous Blaze": ["burst", "dmg"],
    "Aurous Blaze (Explode)": ["burst", "exp"],
    "Kindling (C6) - N0": ["constellation6", "0"], //! N1 * 2
    "Kindling (C6) - N1": ["constellation6", "1"], //! N2
    "Kindling (C6) - N2": ["constellation6", "2"], //! N3
    "Kindling (C6) - N3": ["constellation6", "3"], //! N4 * 2
    "Kindling (C6) - N4": ["constellation6", "4"], //! N5

    //?---------------------Mizuki---------------------//
    //?---------------------Yun Jin--------------------//

    //?---------------------Zhongli--------------------//
    "Stone Stele (Initial)": ["skill", "stele"],
    "Stone Stele (Hold)": ["skill", "holdDMG"],
    "Stone Stele (Tick)": ["skill", "resonance"],
    "Planet Befall": ["burst", "dmg"],
    

    //TODO weapons
    "Viridescent": ["weapon:TheViridescentHunt", "dmg"],

    //TODO artifacts
    "Sea-Dyed Foam": ["artifact:OceanHuedClam", "heal"],
};

const characterAbils: Record<string, AbilsType> = {
    chiori: {
        "Fluttering Hasode (Upward Sweep)": ["skill", "sweepDmg"],
        "Fluttering Hasode (Tamato - Construct)": ["skill", "turretDmg"],
        "Fluttering Hasode (Tamato)": ["skill", "turretDmg"],
        "Hiyoku: Twin Blades": ["burst", "bloomDmg"],
        "Fluttering Hasode (Seize the Moment)": ["passive1", "dollDmg"],
        "Fluttering Hasode (Kinu)": ["constellation2", "dollDmg"],
    },

    kokomi: {
        "Bake-Kurage": ["skill", "dmg"],
        "Nereid's Ascension": ["burst", "dmg"],
        "At Water's Edge (C1)": ["constellation1", "dmg"],
    },

    nilou: {
        "Water Wheel": ["skill", "wheelDmg"],
        "Sword Dance 0": ["skill", "dance1Dmg"],
        "Sword Dance 1": ["skill", "dance2Dmg"],
        "Dance of Haftkarsvar": ["skill", "skillDmg"],
        "Lingering Aeon": ["burst", "aeonDmg"],
        "Dance of Abzendegi: Distant Dreams, Listening Spring": ["burst", "skillDmg"],
    },

    ayaka: {
        "Charge": ["charged", "dmg1"],
        "Hyouka": ["skill", "press"],
        "C2 Mini-Frostflake Seki no To (Bloom)": ["constellation2", "bloom"],
        "Soumetsu (Bloom)": ["burst", "bloom"],
        "C2 Mini-Frostflake Seki no To (Cutting)": ["constellation2", "dmg"],
        "Soumetsu (Cutting)": ["burst", "cutting"],
    },

    neuvillette: {
        "Charged Attack: Equitable Judgment": ["charged", "judgmentDmg"],
        "O Tides, I Have Returned: Waterfall DMG": ["burst", "waterfallDmg"],
        "O Tides, I Have Returned: Skill DMG": ["burst", "skillDmg"],
        "Spiritbreath Thorn (Neuvillette)": ["skill", "thornDmg"],
        "O Tears, I Shall Repay": ["skill", "skillDmg"],
    },

    hutao: {
        "Blood Blossom": ["skill", "dmg"],
        // sim doesn't have different names for <50% hp and >50% hp hu tao bursts
        "Spirit Soother": ["burst", "dmg"],
    }
};

export default function (charName?: string) {
    if (!charName || !characterAbils[charName]) {
        return defaultAbils;
    }
    // some abils have the same name in gcsim, but different paths in go
    // like charged (["charged", "dmg"] for most characters, but ["charged", "dmg1"] for ayaka)
    return { ...defaultAbils, ...characterAbils[charName] };
}