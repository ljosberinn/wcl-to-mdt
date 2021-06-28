import type { Dungeon, Zone } from "@prisma/client";

import { ExpansionEnum } from "./expansions";

export const createDungeonTimer = (
  initialTime: number
): [number, number, number] => [
  initialTime * 60 * 1000,
  initialTime * 60 * 1000 * 0.8,
  initialTime * 60 * 1000 * 0.6,
];

enum Boss {
  // SoA
  KIN_TARA = 162_059,
  VENZULES = 163_077,
  VENTUNAX = 162_058,
  ORYPHRION = 162_060,
  DEVOS = 162_061,
  // NW
  BLIGHTBONE = 162_691,
  AMARTH = 163_157,
  SURGEON_STITCHFLESH = 162_689,
  NALTHOR_THE_RIMEBINDER = 162_693,
  // DoS
  HAKKAR_THE_SOULFLAYER = 164_558,
  MILLHOUSE_MANASTORM = 164_556,
  MILLIFICIENT_MANASTORM = 164_555,
  DEALER_XY_EXA = 164_450,
  MUEH_ZALA = 166_608,
  // HoA
  HALKIAS = 165_408,
  ECHELON = 164_185,
  HIGH_ADJUDICATOR_ALEEZ = 165_410,
  LORD_CHAMBERLAIN = 164_218,
  // ToP
  PACERAN_THE_VIRULENT = 164_463,
  DESSIA_THE_DECAPITATOR = 164_451,
  SATHEL_THE_ACCURSED = 164_461,
  GORECHOP = 162_317,
  XAV_THE_UNFALLEN = 162_329,
  KUL_THAROK = 162_309,
  MORDRETHA_THE_ENDLESS_EMPRESS = 165_946,
  // SD
  KRYXIS_THE_VORACIOUS = 162_100,
  EXECUTOR_TARVOLD = 162_103,
  GRAND_PROCTOR_BERYLLIA = 162_102,
  GENERAL_KAAL = 162_099,
  // MotS
  INGRA_MALOCH = 164_567,
  DROMAN_OULFARRAN = 164_804,
  MISTCALLER = 164_501,
  TRED_OVA = 164_517,
  // PF
  GLOBGROG = 164_255,
  DOCTOR_ICKUS = 164_967,
  DOMINA_VENOMBLADE = 164_266,
  MARGRAVE_STRADAMA = 164_267,
}

export enum DungeonIDs {
  SANGUINE_DEPTHS = 2284,
  SPIRES_OF_ASCENSION = 2285,
  THE_NECROTIC_WAKE = 2286,
  HALLS_OF_ATONEMENT = 2287,
  PLAGUEFALL = 2289,
  MISTS_OF_TIRNA_SCITHE = 2290,
  DE_OTHER_SIDE = 2291,
  THEATER_OF_PAIN = 2293,
}

type DungeonMeta = Omit<Dungeon, "id" | "time"> & {
  /**
   * 1 chest / 2 chest / 3 chest in milliseconds
   */
  timer: [number, number, number];
  /**
   * an exhaustive list of all boss unit ids
   */
  bossIDs: Boss[];
  /**
   * the expansion this dungeon is in
   */
  expansionID: ExpansionEnum;
  /**
   * all zones this dungeon has
   */
  zones: Omit<Zone, "dungeonID">[];
  /**
   * a list of IDs the site does not need to track due to various reasons, e.g.
   * - invisible dummy unit
   * - boss add
   */
  ignorableNPCIDs: Set<number>;
  /**
   * a map mapping unit id to given count
   */
  unitCountMap: Record<number, number>;
  /**
   * required count in total for this dungeon
   */
  count: number;
};

export const SANGUINE_DEPTHS: DungeonMeta = {
  name: "Sanguine Depths",
  timer: createDungeonTimer(41),
  slug: "SD",
  bossIDs: [
    Boss.KRYXIS_THE_VORACIOUS,
    Boss.EXECUTOR_TARVOLD,
    Boss.GRAND_PROCTOR_BERYLLIA,
    Boss.GENERAL_KAAL,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1675, name: "Depths of Despair", order: 1 },
    { id: 1676, name: "Amphitheater of Sorrow", order: 2 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {},
  count: 364,
};

export const SPIRES_OF_ASCENSION: DungeonMeta = {
  name: "Spires of Ascension",
  timer: createDungeonTimer(39),
  slug: "SoA",
  bossIDs: [
    Boss.KIN_TARA,
    Boss.VENZULES,
    Boss.VENTUNAX,
    Boss.ORYPHRION,
    Boss.DEVOS,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1692, name: "Honor's Ascent", order: 1 },
    { id: 1693, name: "Garden of Repose", order: 2 },
    { id: 1694, name: "Font of Fealty", order: 3 },
    { id: 1695, name: "Seat of the Archon", order: 4 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {},
  count: 285,
};

export const THE_NECROTIC_WAKE: DungeonMeta = {
  name: "The Necrotic Wake",
  timer: createDungeonTimer(36),
  slug: "NW",
  bossIDs: [
    Boss.BLIGHTBONE,
    Boss.AMARTH,
    Boss.SURGEON_STITCHFLESH,
    Boss.NALTHOR_THE_RIMEBINDER,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1666, name: "The Necrotic Wake", order: 1 },
    { id: 1667, name: "Stitchwerks", order: 2 },
    { id: 1668, name: "Zolramus", order: 3 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {},
  count: 283,
};

export const HALLS_OF_ATONEMENT: DungeonMeta = {
  name: "Halls of Atonement",
  timer: createDungeonTimer(31),
  slug: "HoA",
  bossIDs: [
    Boss.HALKIAS,
    Boss.ECHELON,
    Boss.HIGH_ADJUDICATOR_ALEEZ,
    Boss.LORD_CHAMBERLAIN,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1663, name: "Halls of Atonement", order: 1 },
    { id: 1664, name: "The Nave of Pain", order: 2 },
    { id: 1665, name: "The Sanctuary of Souls", order: 3 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {
    165_515: 4, // Depraved Darkblade
    // eslint-disable-next-line inclusive-language/use-inclusive-words
    164_562: 4, // Depraved Houndmaster
    164_563: 4, // Vicious Gargon
    165_414: 4, // Depraved Obliterator
    174_175: 4, // Loyal Stoneborn
    165_415: 2, // Toiling Groundskeeper
    165_529: 4, // Depraved Collector
    164_557: 10, // Shard of Halkias
    167_612: 6, // Stoneborn Reaver
    167_610: 1, // Stonefiend Anklebiter
    167_611: 4, // Stoneborn Eviscerator
    167_607: 7, // Stoneborn Slasher
    167_876: 20, // Inquisitor Sigar
  },
  count: 273,
};

export const PLAGUEFALL: DungeonMeta = {
  name: "Plaguefall",
  timer: createDungeonTimer(38),
  slug: "PF",
  bossIDs: [
    Boss.GLOBGROG,
    Boss.DOCTOR_ICKUS,
    Boss.DOMINA_VENOMBLADE,
    Boss.MARGRAVE_STRADAMA,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1674, name: "Plaguefall", order: 1 },
    { id: 1697, name: "The Festering Sanctum", order: 2 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {},
  count: 600,
};

export const MISTS_OF_TIRNA_SCITHE: DungeonMeta = {
  name: "Mists of Tirna Scithe",
  timer: createDungeonTimer(30),
  slug: "MoTS",
  bossIDs: [
    Boss.INGRA_MALOCH,
    Boss.DROMAN_OULFARRAN,
    Boss.MISTCALLER,
    Boss.TRED_OVA,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [{ id: 1669, name: "Mists of Tirna Scithe", order: 1 }],
  ignorableNPCIDs: new Set(),
  unitCountMap: {
    165_111: 2, // Drust Spiteclaw
    164_929: 7, // Tirnenn Villager
    164_920: 4, // Drust Soulcleaver
    164_926: 6, // Drust Boughbreaker
    164_921: 4, // Drust Harvester
    163_058: 4, // Mistveil Defender
    166_301: 4, // Mistveil Stalker
    166_304: 4, // Mistveil Stinger
    166_276: 4, // Mistveil Guardian
    166_299: 4, // Mistveil Tender
    166_275: 4, // Mistveil Shaper
    167_111: 5, // Spinemaw Staghorn
    167_113: 4, // Spinemaw Acidgullet
    172_312: 4, // Spinemaw Gorger
    167_117: 1, // Spinemaw Larva
    167_116: 4, // Spinemaw Reaver
    173_720: 16, // Mistveil Goregullet
    173_655: 16, // Mistveil Matriarch
  },
  count: 260,
};

export const DE_OTHER_SIDE: DungeonMeta = {
  name: "De Other Side",
  timer: createDungeonTimer(43),
  slug: "DOS",
  bossIDs: [
    Boss.HAKKAR_THE_SOULFLAYER,
    Boss.MILLHOUSE_MANASTORM,
    Boss.MILLIFICIENT_MANASTORM,
    Boss.DEALER_XY_EXA,
    Boss.MUEH_ZALA,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1677, name: "Ardenweald", order: 4 },
    { id: 1678, name: "Mechagon", order: 3 },
    { id: 1679, name: "Zul'Gurub", order: 2 },
    { id: 1680, name: "De Other Side", order: 1 },
  ],
  ignorableNPCIDs: new Set([
    171_685, // Primeval Grasp; some hidden unit present _exclusively_ in the first fight
    168_326, // Shattered Visage; totem during Mueh'zala fight
    165_905, // Son of Hakkar,
    Boss.HAKKAR_THE_SOULFLAYER,
    Boss.MILLHOUSE_MANASTORM,
    Boss.MILLIFICIENT_MANASTORM,
    Boss.DEALER_XY_EXA,
    Boss.MUEH_ZALA,
  ]),
  unitCountMap: {
    167_966: 0, // Experimental Sludge
    168_949: 4, // Risen Bonesoldier,
    168_992: 4, // Risen Cultist
    169_905: 6, // Risen Warlord
    168_986: 3, // Skeletal Raptor
    168_942: 6, // Death Speaker
    168_934: 8, // Enraged Spirit
    167_962: 8, // Defunct Dental Drill
    167_963: 5, // Headless Client
    167_964: 8, // 4.RF-4.RF,
    167_965: 5, // Lubricator
    167_967: 6, // Sentient Oil
    170_147: 0, // Volatile Memory
    170_572: 6, // Atal'ai Hoodoo Hexxer
    170_490: 5, // Atal'ai High Priest
    170_486: 2, // Atal'ai Devoted
    170_480: 5, // Atal'ai Deathwalker
    164_862: 3, // Weald Shimmermoth
    164_857: 2, // Spriggan Mendbender
    171_342: 2, // Juvenile Runestag
    164_873: 4, // Runestag Elderhorn
    164_861: 2, // Spriggan Barkbinder,
    171_341: 1, // Bladebeak Hatchling
    171_181: 4, // Territorial Bladebeak
    171_343: 5, // Bladebeak Matriarch
    192_240: 12, // Mythresh, Sky's Talons
  },
  count: 384,
};

export const THEATER_OF_PAIN: DungeonMeta = {
  name: "Theater of Pain",
  timer: createDungeonTimer(37),
  slug: "TOP",
  bossIDs: [
    Boss.PACERAN_THE_VIRULENT,
    Boss.DESSIA_THE_DECAPITATOR,
    Boss.SATHEL_THE_ACCURSED,
    Boss.GORECHOP,
    Boss.XAV_THE_UNFALLEN,
    Boss.KUL_THAROK,
    Boss.MORDRETHA_THE_ENDLESS_EMPRESS,
  ],
  expansionID: ExpansionEnum.SHADOWLANDS,
  zones: [
    { id: 1683, name: "Theater of Pain", order: 1 },
    { id: 1684, name: "Chamber of Conquest", order: 2 },
    { id: 1685, name: "Altars of Agony", order: 3 },
    { id: 1686, name: "Upper Barrow of Carnage", order: 4 },
    { id: 1687, name: "Lower Barrow of Carnage", order: 5 },
  ],
  ignorableNPCIDs: new Set(),
  unitCountMap: {},
  count: 271,
};

export const dungeonMap: Record<Dungeon["id"], DungeonMeta> = {
  [DungeonIDs.SANGUINE_DEPTHS]: SANGUINE_DEPTHS,
  [DungeonIDs.SPIRES_OF_ASCENSION]: SPIRES_OF_ASCENSION,
  [DungeonIDs.THE_NECROTIC_WAKE]: THE_NECROTIC_WAKE,
  [DungeonIDs.HALLS_OF_ATONEMENT]: HALLS_OF_ATONEMENT,
  [DungeonIDs.PLAGUEFALL]: PLAGUEFALL,
  [DungeonIDs.MISTS_OF_TIRNA_SCITHE]: MISTS_OF_TIRNA_SCITHE,
  [DungeonIDs.DE_OTHER_SIDE]: DE_OTHER_SIDE,
  [DungeonIDs.THEATER_OF_PAIN]: THEATER_OF_PAIN,
};

export const dungeons: (Omit<Dungeon, "time"> & {
  timer: [number, number, number];
  bossIDs: Boss[];
  expansionID: ExpansionEnum;
  zones: Omit<Zone, "dungeonID">[];
})[] = Object.entries(dungeonMap).map(([id, dataset]) => ({
  id: Number.parseInt(id),
  ...dataset,
}));
