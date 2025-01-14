import { createWowheadUrl } from "../../../utils";
import { AbilityIcon } from "../../AbilityIcon";
import { ExternalLink } from "../../ExternalLink";
import type { TableRowProps } from "../Events";
import {
  ResponsiveAbilityCell,
  SourceOrTargetPlayerCell,
  TimestampCell,
  TypeCell,
} from "../cells";
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
  | "msSinceLastEvent"
  | "playerIdPlayerNameMap"
  | "playerIdTextColorMap"
  | "playerIdIconMap"
>;

// eslint-disable-next-line import/no-default-export
export default function ApplyDebuffRow({
  event,
  msSinceLastEvent,
  playerIdPlayerNameMap,
  playerIdTextColorMap,
  playerIdIconMap,
}: ApplyDebuffRowProps): JSX.Element | null {
  const ability = determineAbility(event.ability.id);

  if (!ability) {
    if (typeof window !== "undefined") {
      console.log(event.type, { event });
    }
    return null;
  }

  return (
    <tr className="text-white bg-yellow-700/50 hover:bg-yellow-900">
      <TimestampCell event={event} msSinceLastEvent={msSinceLastEvent} />

      <TypeCell type={event.type} />

      {event.sourcePlayerID && (
        <SourceOrTargetPlayerCell
          playerIdTextColorMap={playerIdTextColorMap}
          playerIdPlayerNameMap={playerIdPlayerNameMap}
          playerIdIconMap={playerIdIconMap}
          sourcePlayerID={event.sourcePlayerID}
          transparent
        />
      )}

      {event.targetPlayerID &&
        event.sourcePlayerID !== event.targetPlayerID && (
          <SourceOrTargetPlayerCell
            playerIdTextColorMap={playerIdTextColorMap}
            playerIdPlayerNameMap={playerIdPlayerNameMap}
            playerIdIconMap={playerIdIconMap}
            targetPlayerID={event.targetPlayerID}
            transparent
          />
        )}

      <td colSpan={event.targetPlayerID ? 3 : 4}>
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
          <ResponsiveAbilityCell name={ability.name} />
          {event.stacks ? <> ({event.stacks})</> : null}
        </ExternalLink>

        {event.targetNPC && (
          <span className="space-x-2">
            <span className="pl-2">{">"}</span>
            <ExternalLink
              href={createWowheadUrl({
                category: "npc",
                id: event.targetNPC.id,
              })}
            >
              <img
                src={`/static/npcs/${event.targetNPC.id}.png`}
                alt={event.targetNPC.name}
                className="inline object-cover w-4 h-4 rounded-full"
                width={16}
                height={16}
                loading="lazy"
              />
              <ResponsiveAbilityCell name={event.targetNPC.name} />
            </ExternalLink>
          </span>
        )}
      </td>
    </tr>
  );
}
