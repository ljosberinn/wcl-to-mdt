import { PF, spells } from "../../../staticData";
import { createWowheadUrl, timeDurationToString } from "../../../utils";
import { AbilityIcon } from "../../AbilityIcon";
import { ExternalLink } from "../../ExternalLink";
import { usePullDetailsSettings } from "../PullDetailsSettings";
import type { DefaultEvent } from "../utils";

export type ViolentDetonationDamageRowProps = {
  events: (Omit<DefaultEvent, "ability" | "damage" | "type"> & {
    ability: NonNullable<DefaultEvent["ability"]>;
    damage: number;
    type: "DamageDone" | "DamageTaken";
  })[];
};

const ability = spells[PF.CANISTER_VIOLENT_DETONATION];

// eslint-disable-next-line import/no-default-export
export default function ViolentDetonationDamageRow({
  events,
}: ViolentDetonationDamageRowProps): JSX.Element {
  const { groupDPS } = usePullDetailsSettings();

  const totalDamageDone = events.reduce(
    (acc, event) => (event.type === "DamageDone" ? acc + event.damage : acc),
    0
  );

  return (
    <tr className="text-white bg-yellow-700 border-t-2 border-coolgray-900 hover:bg-yellow-900">
      <td colSpan={6} className="text-center">
        <span>Total </span>
        <ExternalLink
          href={createWowheadUrl({
            category: "spell",
            id: PF.CANISTER_VIOLENT_DETONATION,
          })}
        >
          <AbilityIcon
            icon={ability.icon}
            alt={ability.name}
            className="inline object-cover w-4 h-4 rounded-lg"
            width={16}
            height={16}
          />
          <b className="pl-2">{ability.name}</b>
        </ExternalLink>
        <span> Damage: </span>
        <b>{totalDamageDone.toLocaleString("en-US")}</b>
        <span> - Estimated Time Save: </span>
        <b>{timeDurationToString((totalDamageDone / groupDPS) * 1000, true)}</b>
      </td>
    </tr>
  );
}
