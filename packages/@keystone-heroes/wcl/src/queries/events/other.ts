import type { AnyEvent, ApplyBuffEvent, CastEvent } from "./types";
import { createIsSpecificEvent } from "./utils";

export const INVISIBILITY = {
  DIMENSIONAL_SHIFTER: 321_422,
  POTION_OF_THE_HIDDEN_SPIRIT: 307_195,
} as const;

export const ENGINEERING_BATTLE_REZ = {
  // Disposable Spectrophasic Reanimator
  SHADOWLANDS: 345_130,
} as const;

export const LEATHERWORKING_DRUMS = {
  // Drums of Deathly Ferocity
  SHADOWLANDS: 309_658,
} as const;

const isLeatherworkingDrumsEvent = createIsSpecificEvent<ApplyBuffEvent>({
  abilityGameID: LEATHERWORKING_DRUMS.SHADOWLANDS,
  type: "applybuff",
});

const isInvisibilityEvent = createIsSpecificEvent<ApplyBuffEvent>({
  type: "applybuff",
  abilityGameID: [
    INVISIBILITY.DIMENSIONAL_SHIFTER,
    INVISIBILITY.POTION_OF_THE_HIDDEN_SPIRIT,
  ],
});

const isEngineeringBattleRezEvent = createIsSpecificEvent<CastEvent>({
  type: "cast",
  abilityGameID: ENGINEERING_BATTLE_REZ.SHADOWLANDS,
});

/**
 * @see https://www.warcraftlogs.com/reports/LafTw4CxyAjkVHv6#fight=8&type=auras&pins=2%24Off%24%23244F4B%24expression%24type%20%3D%20%22applybuff%22%20and%20ability.id%20in%20(321422,%20307195)&view=events
 */
export const invisibilityFilterExpression = `type = "applybuff" and ability.id in (${INVISIBILITY.DIMENSIONAL_SHIFTER}, ${INVISIBILITY.POTION_OF_THE_HIDDEN_SPIRIT})`;

/**
 * @see https://www.warcraftlogs.com/reports/fxq2w3aAW49dHhjb#fight=3&pins=2%24Off%24%23244F4B%24expression%24type%20%3D%20%22cast%22%20and%20ability.id%20%3D%20345130&view=events
 */
export const engineeringBattleRezExpression = `type = "cast" and ability.id = ${ENGINEERING_BATTLE_REZ.SHADOWLANDS}`;

/**
 * @see https://www.warcraftlogs.com/reports/Rt7FqrJkhdmvV4j3#fight=3&type=casts&view=events&pins=2%24Off%24%23244F4B%24expression%24ability.id%20%3D%20309658
 */
export const leatherworkingDrumsExpression = `type = "cast" and ability.id = ${LEATHERWORKING_DRUMS.SHADOWLANDS}`;

export const filterProfessionEvents = (
  allEvents: AnyEvent[]
): (CastEvent | ApplyBuffEvent)[] => {
  const leatherworkingDrums = allEvents.filter(isLeatherworkingDrumsEvent);
  const invisibility = allEvents.filter(isInvisibilityEvent);
  const engineeringBattleRez = allEvents.filter(isEngineeringBattleRezEvent);

  return [...leatherworkingDrums, ...invisibility, ...engineeringBattleRez];
};
