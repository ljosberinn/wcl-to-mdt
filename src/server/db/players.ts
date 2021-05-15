import { prisma } from "../prismaClient";

import type { FooFight } from "../../pages/api/fight";
import type { Server, Spec, Character } from "@prisma/client";

export type PlayerInsert = Pick<
  FooFight["composition"][number],
  | "dps"
  | "hps"
  | "deaths"
  | "itemLevel"
  | "covenantId"
  | "soulbindId"
  | "legendary"
  | "actorId"
> & {
  serverId: Server["id"];
  specId: Spec["id"];
  characterId: Character["id"];
};

export const PlayerRepo = {
  createMany: async (
    player: PlayerInsert[],
    reportId: number
  ): Promise<Record<number, number>> => {
    // eslint-disable-next-line no-console
    console.info(`[PlayerRepo/createMany] creating ${player.length} player`);

    await prisma.player.createMany({
      data: player.map((dataset) => {
        return {
          dps: dataset.dps,
          hps: dataset.hps,
          deaths: dataset.deaths,
          reportId,
          itemLevel: dataset.itemLevel,
          soulbindId: dataset.soulbindId,
          covenantId: dataset.covenantId,
          specId: dataset.specId,
          characterId: dataset.characterId,
          legendaryId: dataset.legendary?.effectId ?? null,
          actorId: dataset.actorId,
        };
      }),
      skipDuplicates: true,
    });

    const playerData = await prisma.player.findMany({
      where: {
        OR: player.map((dataset) => {
          return {
            characterId: dataset.characterId,
            reportId,
          };
        }),
      },
    });

    return Object.fromEntries(
      playerData.map((dataset) => [dataset.characterId, dataset.id])
    );
  },
};
