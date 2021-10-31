import { createWowheadUrl } from "../../../utils";
import { AbilityIcon } from "../../AbilityIcon";
import { ExternalLink } from "../../ExternalLink";
import type { TableRowProps } from "../Pulls";
import { TimestampCell, TypeCell } from "../cells";
import type { DefaultEvent } from "../utils";
import { determineAbility } from "../utils";
import type { CastRowProps } from "./CastRow";

export type ApplyDebuffRowProps = {
  event: Omit<DefaultEvent, "ability" | "type"> & {
    ability: CastRowProps["event"]["ability"];
    type: "ApplyDebuff" | "ApplyDebuffStack";
  };
} & Pick<
  TableRowProps,
  "msSinceLastEvent" | "playerIdPlayerNameMap" | "playerIdTextColorMap"
>;

// eslint-disable-next-line import/no-default-export
export default function ApplyDebuffRow({
  event,
  msSinceLastEvent,
  playerIdPlayerNameMap,
  playerIdTextColorMap,
}: ApplyDebuffRowProps): JSX.Element | null {
  const ability = determineAbility(event.ability.id);

  if (!ability) {
    if (typeof window !== "undefined") {
      console.log(event.type, { event });
    }
    return null;
  }

  return (
    <tr className="text-center text-white bg-yellow-700 hover:bg-yellow-900">
      <TimestampCell event={event} msSinceLastEvent={msSinceLastEvent} />

      <TypeCell type={event.type} />

      <td colSpan={4}>
        <ExternalLink
          href={createWowheadUrl({
            category: "spell",
            id: event.ability.id,
          })}
        >
          <AbilityIcon
            icon={ability.icon}
            alt={ability.name}
            className="inline object-cover w-4 h-4 rounded-lg"
            width={16}
            height={16}
          />
          <b className="pl-2">
            {ability.name}
            {event.stacks ? <> ({event.stacks})</> : null}
          </b>
        </ExternalLink>
        {event.targetPlayerID && (
          <>
            <span> on </span>
            <span className={playerIdTextColorMap[event.targetPlayerID]}>
              {playerIdPlayerNameMap[event.targetPlayerID]}
            </span>
          </>
        )}
      </td>
    </tr>
  );
}
