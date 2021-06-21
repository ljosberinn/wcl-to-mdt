import { Affixes } from "@keystone-heroes/db/types";

import type { AllTrackedEventTypes, DamageEvent } from "../types";
import { reduceEventsByPlayer } from "../utils";

export const VOLCANIC = 209_862;

/**
 * @see https://www.warcraftlogs.com/reports/LafTw4CxyAjkVHv6#fight=8&type=summary&view=events&pins=2%24Off%24%23909049%24expression%24type%20%3D%22damage%22%20and%20target.type%20%3D%20%22player%22%20and%20ability.id%20%3D%20209862
 * ```gql
 * {
 *   reportData {
 *     report(code: "LafTw4CxyAjkVHv6") {
 *       fights(fightIDs: [2]) {
 *         startTime
 *         endTime
 *       }
 *       events(startTime: 34007, endTime: 1759795, filterExpression: "type =\"damage\" and target.type = \"player\" and ability.id = 209862") {
 *         data
 *       }
 *     }
 *   }
 * }
 * ```
 */
export const filterExpression = [
  `type = "damage" and target.type = "player" and ability.id = ${VOLCANIC}`,
];

const isVolcanicEvent = (event: AllTrackedEventTypes): event is DamageEvent =>
  event.type === "damage" &&
  "abilityGameID" in event &&
  event.abilityGameID === VOLCANIC;

export const getVolcanicEvents = (
  allEvents: AllTrackedEventTypes[],
  affixSet: Set<Affixes>
): DamageEvent[] => {
  if (!affixSet.has(Affixes.Volcanic)) {
    return [];
  }

  return reduceEventsByPlayer(allEvents.filter(isVolcanicEvent), "targetID");
};
