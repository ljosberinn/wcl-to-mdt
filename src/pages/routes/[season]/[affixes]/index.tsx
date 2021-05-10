import type { Affix, Dungeon, Season } from "@prisma/client";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";

import {
  affixes as allAffixes,
  getAffixById,
} from "../../../../../prisma/affixes";
import { dungeons } from "../../../../../prisma/dungeons";
import { seasons } from "../../../../../prisma/seasons";
import { weeks as allWeeks } from "../../../../../prisma/weeks";

type AffixesProps = {
  affixSlug: string;
  affixes: Affix[];
  season: Omit<Season, "startTime" | "endTime" | "affixId" | "expansionId">;
  dungeons: Omit<Dungeon, "time">[];
};

export default function Affixes({
  affixes,
  season,
  dungeons,
  affixSlug,
}: AffixesProps): JSX.Element {
  return (
    <>
      <h1>{season.name}</h1>
      <hr />

      <h2>Current Affixes</h2>
      {affixes.map((affix) => {
        return <div key={affix.id}>{affix.name}</div>;
      })}

      <h2>Dungeons</h2>

      {dungeons.map((dungeon) => {
        return (
          <div key={dungeon.id}>
            <Link
              href={`/routes/${
                season.slug
              }/${affixSlug}/${dungeon.slug.toLowerCase()}`}
            >
              <a>{dungeon.name}</a>
            </Link>
          </div>
        );
      })}
    </>
  );
}

type StaticParams = {
  season: string;
  affixes: string;
};

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  const paths = seasons.flatMap((season) => {
    const weeks = allWeeks.filter((week) => week.seasonId === season.seasonId);

    return weeks.map((week) => {
      const affixSlug = [
        getAffixById(week.affix1Id),
        getAffixById(week.affix2Id),
        getAffixById(week.affix3Id),
        getAffixById(season.affixId),
      ]
        .map((affix) => affix.name.toLowerCase())
        .join("-");

      return {
        params: {
          affixes: affixSlug,
          season: season.slug,
        },
      };
    });
  });

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps<
  AffixesProps,
  StaticParams
> = async (ctx) => {
  if (
    !ctx.params?.affixes ||
    !ctx.params.season ||
    Array.isArray(ctx.params.affixes) ||
    Array.isArray(ctx.params.season) ||
    !ctx.params.affixes.includes("-")
  ) {
    throw new Error("nope");
  }

  const affixSlug = ctx.params.affixes;
  const affixSlugs = affixSlug.split("-");
  const affixes = allAffixes.filter((affix) =>
    affixSlugs.includes(affix.name.toLowerCase())
  );

  const seasonSlug = ctx.params.season;
  const season = seasons.find((season) => season.slug === seasonSlug);

  if (!season) {
    throw new Error("nope");
  }

  return {
    props: {
      affixSlug,
      affixes,
      season: {
        id: season.id,
        name: season.name,
        slug: season.slug,
      },
      dungeons: dungeons
        .filter((dungeon) => dungeon.expansionId === season.expansionId)
        .map((dungeon) => {
          return {
            id: dungeon.id,
            name: dungeon.name,
            slug: dungeon.slug,
          };
        }),
    },
  };
};