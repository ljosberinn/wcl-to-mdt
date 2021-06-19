import type { DamageEvent, HealEvent } from "../../types";
import { createIsSpecificEvent } from "../../utils";

export const NW = {
  ORB: 328_406,
  HAMMER: 328_128,
  SPEAR: 328_351,
  KYRIAN_ORB: {
    heal: 344_422,
    damage: 344_421,
  },
};

/**
 * @see https://www.warcraftlogs.com/reports/Jq7KrbYV1hmTWMyw#fight=4&type=summary&view=events&pins=2%24Off%24%23909049%24expression%24type%20%3D%20%22heal%22%20and%20source.type%20%3D%20%22player%22%20and%20ability.id%20%3D344422%5E2%24Off%24%23909049%24expression%24type%20%3D%20%22damage%22%20and%20source.type%20%3D%20%22player%22%20and%20ability.id%20%3D328406%5E2%24Off%24%23a04D8A%24expression%24type%20%3D%20%22damage%22%20and%20source.type%20%3D%20%22player%22%20and%20ability.id%20%3D328128%5E2%24Off%24%23DF5353%24expression%24type%20%3D%20%22damage%22%20and%20source.type%20%3D%20%22player%22%20and%20ability.id%20%3D328351%5E2%24Off%24rgb(78%25,%2061%25,%2043%25)%24expression%24type%20%3D%20%22damage%22%20and%20source.type%20%3D%20%22player%22%20and%20ability.id%20%3D344421
 */
const orbDamageFilterExpression = `type = "damage" and source.type = "player" and ability.id = ${NW.ORB}`;
const hammerDamageFilterExpression = `type = "damage" and source.type = "player" and ability.id = ${NW.HAMMER}`;
const spearDamageFilterExpression = `type = "damage" and source.type = "player" and ability.id = ${NW.SPEAR}`;
const kyrianOrbDamageFilterExpression = `type = "damage" and source.type = "player" and ability.id = ${NW.KYRIAN_ORB.damage}`;
const kyrianHealFilterExpression = `type = "heal" and source.type = "player" and ability.id = ${NW.KYRIAN_ORB.heal}`;

export const filterExpression = [
  orbDamageFilterExpression,
  hammerDamageFilterExpression,
  spearDamageFilterExpression,
  kyrianHealFilterExpression,
  kyrianOrbDamageFilterExpression,
];

export const isNwSpearEvent = createIsSpecificEvent<DamageEvent>({
  type: "damage",
  abilityGameID: NW.SPEAR,
});

export const isNwHammerEvent = createIsSpecificEvent<DamageEvent>({
  type: "damage",
  abilityGameID: NW.HAMMER,
});

export const isNwOrbEvent = createIsSpecificEvent<DamageEvent>({
  type: "damage",
  abilityGameID: NW.ORB,
});

export const isNwKyrianOrbDamageEvent = createIsSpecificEvent<DamageEvent>({
  type: "damage",
  abilityGameID: NW.KYRIAN_ORB.damage,
});

export const isNwKyrianOrbHealEvent = createIsSpecificEvent<HealEvent>({
  type: "heal",
  abilityGameID: NW.KYRIAN_ORB.heal,
});

// NW Spear applies a bleed for 16 seconds
// each usage is hopefully thus at least 16s apart of each other
// may have to adjust later for multi-spearing...
// const spearReducer = createChunkByThresholdReducer(16 * 1000);

// export const getNecroticWakeSpearUsage = async (
//   params: GetEventBaseParams
// ): Promise<DamageEvent[]> => {
//   const allEvents = await getEvents<DamageEvent>({
//     ...params,
//     dataType: EventDataType.DamageDone,
//     hostilityType: HostilityType.Friendlies,
//     abilityID: NW.SPEAR,
//   });

//   return (
//     allEvents
//       .reduce<DamageEvent[][]>(spearReducer, [])
//       // creates one event per spear usage
//       .flatMap((chunk) => reduceEventsByPlayer(chunk, "sourceID"))
//   );
// };

// NW Orb pulses every 1s for 8s
// each usage is hopefully thus at least 8s apart of each other
// may have to adjust later for multi-orbing...
// const orbReducer = createChunkByThresholdReducer(8 * 1000);

// export const getNecroticWakeOrbUsage = async (
//   params: GetEventBaseParams
// ): Promise<DamageEvent[]> => {
//   const allEvents = await getEvents<DamageEvent>({
//     ...params,
//     dataType: EventDataType.DamageDone,
//     hostilityType: HostilityType.Friendlies,
//     abilityID: NW.ORB,
//   });

//   return (
//     allEvents
//       .reduce<DamageEvent[][]>(orbReducer, [])
//       // creates one event per orb usage
//       .flatMap((chunk) => reduceEventsByPlayer(chunk, "sourceID"))
//   );
// };

// export const getNecroticWakeHammerUsage = createEventFetcher<DamageEvent>({
//   dataType: EventDataType.DamageDone,
//   hostilityType: HostilityType.Friendlies,
//   abilityID: NW.HAMMER,
// });

// export const getNecroticWakeKyrianOrbHealEvents = async (
//   params: GetEventBaseParams
// ): Promise<HealEvent[]> => {
//   const allEvents = await getEvents<HealEvent>({
//     ...params,
//     dataType: EventDataType.Healing,
//     hostilityType: HostilityType.Friendlies,
//     abilityID: NW.KYRIAN_ORB.heal,
//   });

//   return reduceEventsByPlayer(allEvents, "targetID");
// };

// export const getNecroticWakeKyrianOrbDamageEvents = async (
//   params: GetEventBaseParams
// ): Promise<DamageEvent[]> => {
//   const allEvents = await getEvents<DamageEvent>({
//     ...params,
//     dataType: EventDataType.DamageDone,
//     hostilityType: HostilityType.Friendlies,
//     abilityID: NW.KYRIAN_ORB.damage,
//   });

//   return reduceEventsByPlayer(allEvents, "targetID");
// };
