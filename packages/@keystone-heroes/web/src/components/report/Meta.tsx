/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid */
import type { FightSuccessResponse } from "@keystone-heroes/api/functions/fight";
import Link from "next/link";
import { useStaticData } from "src/context/StaticData";
import { icons } from "src/icons";
import { useFight } from "src/pages/report/[reportID]/[fightID]";
import {
  createWCLUrl,
  fightTimeToString,
  createWowheadUrl,
  classTextColorMap,
} from "src/utils";

import { AbilityIcon } from "../AbilityIcon";
import { ExternalLink } from "../ExternalLink";
import { SpecIcon } from "../SpecIcon";

export function Meta(): JSX.Element {
  const { reportID, fightID, fight } = useFight();

  const { classes, dungeons, affixes, tormentedPowers } = useStaticData();

  if (!fight) {
    return <h1>loading</h1>;
  }

  const dungeon = dungeons[fight.dungeon];

  return (
    <div className="flex flex-col justify-between w-full lg:w-2/6">
      <div className="bg-white rounded-t-lg shadow-sm lg:rounded-lg dark:bg-coolgray-700">
        <div className="justify-between p-4 md:flex lg:block ">
          <h1 className="text-4xl font-bold">
            <ExternalLink href={createWCLUrl({ reportID, fightID })}>
              <span className="lg:hidden 2xl:inline-block">{dungeon.name}</span>
              <span className="hidden lg:inline-block 2xl:hidden">
                {dungeon.slug}
              </span>{" "}
              +{fight.meta.level}
              <sup className="pl-2 space-x-1">
                {Array.from({ length: fight.meta.chests }, (_, index) => (
                  <svg
                    key={index}
                    className="inline w-4 h-4 text-yellow-500 fill-current"
                  >
                    <use href={`#${icons.star.id}`} />
                  </svg>
                ))}
              </sup>
            </ExternalLink>
          </h1>
          <div className="flex pt-2 space-x-1 space-x-2 md:pt-0 lg:pt-2">
            {fight.affixes.map((affix) => (
              <ExternalLink
                href={createWowheadUrl({
                  category: "affix",
                  id: affix,
                })}
                key={affix}
                className="w-10 h-10"
              >
                <AbilityIcon
                  icon={affixes[affix].icon}
                  alt={affixes[affix].name}
                  title={affixes[affix].name}
                  className="object-cover w-full h-full rounded-full"
                />
              </ExternalLink>
            ))}
          </div>
        </div>

        {/* <-------> */}

        <div className="flex p-4 pt-0 space-x-2 text-2xl">
          <span>{fightTimeToString(fight.meta.time)}</span>
          <span
            className="italic text-green-600 dark:text-green-500"
            title={`${fight.meta.chests} chest${
              fight.meta.chests > 1 ? "s" : ""
            }`}
          >
            +{fightTimeToString(dungeon.time - fight.meta.time)}
          </span>
          {fight.meta.totalDeaths > 0 && (
            <span
              className="italic text-red-600 dark:text-red-500"
              title={`${fight.meta.totalDeaths} deaths`}
            >
              -{fightTimeToString(fight.meta.totalDeaths * 5 * 1000, true)}
            </span>
          )}
        </div>
      </div>

      {/* <-------> */}

      <div className="p-4 bg-white rounded-b-lg shadow-sm lg:rounded-lg dark:bg-coolgray-600">
        <h2 className="pb-4 text-xl font-bold">Group Composition</h2>
        <div className="flex flex-col justify-between sm:flex-row lg:flex-col lg:space-y-2">
          {fight.player.map((player) => {
            const { name, specs } = classes[player.class];
            const spec = specs.find((spec) => spec.id === player.spec);

            if (!spec) {
              return null;
            }

            const classColor = classTextColorMap[name.toLowerCase()];

            return (
              <div
                className="flex justify-between sm:flex-col lg:flex-row"
                key={player.actorID}
              >
                <div className="flex space-x-2">
                  <Link
                    href={`/character/${player.region.toLowerCase()}/${player.server.toLowerCase()}/${player.name.toLowerCase()}`}
                    key={player.actorID}
                    prefetch={false}
                  >
                    <a
                      className="flex items-center space-x-2"
                      onClick={(event) => {
                        event.preventDefault();
                        // eslint-disable-next-line no-alert
                        alert("not yet implemented");
                      }}
                    >
                      <div className="w-8 h-8">
                        <SpecIcon class={name} spec={spec.name} />
                      </div>{" "}
                      <span className={`font-semibold ${classColor}`}>
                        {player.name}
                      </span>
                    </a>
                  </Link>
                  <WarcraftLogsProfileLink
                    name={player.name}
                    server={player.server}
                    region={player.region}
                  />

                  <RaiderIOLink
                    name={player.name}
                    server={player.server}
                    region={player.region}
                  />
                </div>
                <div className="flex pt-2 space-x-2 sm:space-y-2 sm:space-x-0 md:space-x-2 sm:flex-col md:flex-row md:space-y-0 lg:space-x-2 lg:pt-0">
                  {player.tormented.map((id, index) => {
                    const power = tormentedPowers[id];

                    return (
                      <ExternalLink
                        href={createWowheadUrl({
                          category: "spell",
                          id,
                        })}
                        className="w-8 h-8"
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${id}-${index}}`}
                      >
                        <AbilityIcon
                          icon={power.icon}
                          alt={power.name ?? "Skipped"}
                          className="object-cover w-full h-full rounded-full"
                        />
                      </ExternalLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div>
        <p>Total Percent - {meta.percent}%</p>
        <p>Chests - {meta.chests}</p>
        <p>DPS - {meta.dps.toLocaleString("en-US")}</p>
        <p>HPS - {meta.hps.toLocaleString("en-US")}</p>
        <p>DTPS - {meta.dtps.toLocaleString("en-US")}</p>
        <p>Avg ItemLevel - {meta.averageItemLevel}</p>
        <p>Rating - {meta.rating}</p>
      </div> */}
    </div>
  );
}

type LinkProps = Pick<
  FightSuccessResponse["player"][number],
  "name" | "server" | "region"
>;

function RaiderIOLink({ name, server, region }: LinkProps): JSX.Element {
  return (
    <ExternalLink
      href={`https://raider.io/characters/${region}/${server}/${name}`}
      className="hidden xl:block"
    >
      <sup>
        <img
          src="/static/icons/rio.svg"
          alt="Raider.io profile"
          className="w-4 h-4"
        />
      </sup>
    </ExternalLink>
  );
}

function WarcraftLogsProfileLink({
  name,
  server,
  region,
}: LinkProps): JSX.Element {
  return (
    <ExternalLink
      href={`https://www.warcraftlogs.com/character/${region}/${server}/${name}`}
      className="hidden xl:block"
    >
      <sup>
        <img
          src="/static/icons/wcl.png"
          alt="WarcraftLogs profile"
          className="w-4 h-4"
        />
      </sup>
    </ExternalLink>
  );
}
