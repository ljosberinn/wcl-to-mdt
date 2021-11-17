import { outlineQuestionCircle } from "../../../icons";
import { DUMMY_CD } from "../../../staticData";
import { createWowheadUrl, timeDurationToString } from "../../../utils";
import { classnames } from "../../../utils/classnames";
import { AbilityIcon } from "../../AbilityIcon";
import { ExternalLink } from "../../ExternalLink";
import type { TableRowProps } from "../Pulls";
import {
  TimestampCell,
  TypeCell,
  SourceOrTargetPlayerCell,
  MaybeWastedCooldownCell,
} from "../cells";
import { determineAbility } from "../utils";
import type { DefaultEvent } from "../utils";

export type CastRowProps = {
  event: Omit<DefaultEvent, "ability" | "type" | "sourcePlayerID"> & {
    ability: NonNullable<DefaultEvent["ability"]>;
    sourcePlayerID: NonNullable<DefaultEvent["sourcePlayerID"]>;
    type: "Cast" | "BeginCast";
  };
} & Pick<
  TableRowProps,
  "msSinceLastEvent" | "playerIdPlayerNameMap" | "playerIdTextColorMap"
>;

// eslint-disable-next-line import/no-default-export
export default function CastRow({
  event,
  playerIdPlayerNameMap,
  msSinceLastEvent,
  playerIdTextColorMap,
}: CastRowProps): JSX.Element | null {
  const ability = determineAbility(event.ability.id);

  if (!ability) {
    if (typeof window !== "undefined") {
      console.log(event);
    }
    return null;
  }

  const cooldown = ability ? ability.cd : 0;
  const abilityName = ability?.name ?? "Unknown Ability";

  const usedUnderCooldown = cooldown
    ? (event.timestamp - (event.ability.lastUse ?? 0)) / 1000 <= cooldown
    : false;

  const possibleUsageCount = event.ability.lastUse
    ? Math.floor(
        (event.timestamp - event.ability.lastUse + cooldown) / 1000 / cooldown
      )
    : 0;

  const delayedTooHard = possibleUsageCount > 1;

  return (
    <tr
      className={classnames(
        "text-center",
        event.type === "BeginCast"
          ? "bg-yellow-700 hover:bg-yellow-900"
          : "bg-coolgray-200 hover:bg-white dark:bg-coolgray-600 dark:hover:bg-coolgray-700"
      )}
    >
      <TimestampCell event={event} msSinceLastEvent={msSinceLastEvent} />

      <TypeCell type={event.type} />

      <SourceOrTargetPlayerCell
        playerIdTextColorMap={playerIdTextColorMap}
        playerIdPlayerNameMap={playerIdPlayerNameMap}
        sourcePlayerID={event.sourcePlayerID}
      />

      <td colSpan={ability.cd === DUMMY_CD ? 3 : 1}>
        <ExternalLink
          href={createWowheadUrl({
            category: "spell",
            id: event.ability.id,
          })}
        >
          <AbilityIcon
            icon={ability.icon}
            alt={abilityName}
            className="inline object-cover w-4 h-4 rounded-lg"
            width={16}
            height={16}
          />
          <span className="pl-2">{abilityName}</span>
        </ExternalLink>
      </td>

      {ability.cd === DUMMY_CD ? null : (
        <td
          className={classnames(
            delayedTooHard && "text-red-500",
            usedUnderCooldown && "text-green-500",
            event.ability.lastUse ? null : "text-yellow-500"
          )}
          title={
            delayedTooHard
              ? `This ability could have been used at least ${
                  possibleUsageCount - 1
                }x since its last usage.`
              : undefined
          }
        >
          {event.ability.lastUse ? (
            <span>
              {timeDurationToString(
                event.timestamp - event.ability.lastUse,
                true
              )}{" "}
              ago
            </span>
          ) : (
            "first use"
          )}
          {delayedTooHard && (
            <sup>
              <svg className="inline w-4 h-4 ml-2 text-black dark:text-white">
                <use href={`#${outlineQuestionCircle.id}`} />
              </svg>
            </sup>
          )}
        </td>
      )}

      <MaybeWastedCooldownCell event={event} />
    </tr>
  );
}