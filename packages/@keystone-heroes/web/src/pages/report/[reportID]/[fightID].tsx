import type {
  FightResponse,
  FightSuccessResponse,
} from "@keystone-heroes/api/functions/fight";
import { isValidReportId } from "@keystone-heroes/wcl/utils";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import { Data } from "src/components/report/Data";
import { Map } from "src/components/report/Map";
import { Meta } from "src/components/report/Meta";
import { useStaticData } from "src/context/StaticData";
import { useAbortableFetch } from "src/hooks/useAbortableFetch";
import { fightTimeToString } from "src/utils";

type FightIDProps = {
  cache?: {
    fight: FightResponse | null;
    reportID: string | null;
    fightID: number | null;
  };
};

const useFightURL = (cache: FightIDProps["cache"]) => {
  const { query, isFallback } = useRouter();

  if (isFallback) {
    return {
      url: null,
      reportID: null,
      fightID: null,
    };
  }

  if (cache?.fight) {
    return {
      url: null,
      reportID: cache.reportID,
      fightID: cache.fightID ? `${cache.fightID}` : null,
    };
  }

  const { reportID, fightID } = query;

  if (!isValidReportId(reportID)) {
    return {
      url: null,
      fightID: null,
      reportID: null,
    };
  }

  if (!fightID || Array.isArray(fightID)) {
    return {
      url: null,
      fightID: null,
      reportID: null,
    };
  }

  const maybeFightID = Number.parseInt(fightID);

  if (!maybeFightID || Number.isNaN(maybeFightID) || maybeFightID < 1) {
    return {
      url: null,
      fightID: null,
      reportID: null,
    };
  }

  const params = new URLSearchParams({
    reportID,
    fightID: `${fightID}`,
  }).toString();

  return {
    url: `/api/fight?${params}`,
    fightID,
    reportID,
  };
};

type FightContextDefinition = {
  reportID: string;
  fightID: string;
  loading: boolean;
  fight: FightSuccessResponse | null;
};

const FightContext = createContext<FightContextDefinition | null>(null);

export const useFight = (): FightContextDefinition => {
  const ctx = useContext(FightContext);

  if (!ctx) {
    throw new Error("useFight must be used within FightContext.Provider");
  }

  return ctx;
};

export default function FightID({ cache }: FightIDProps): JSX.Element | null {
  const { url, fightID, reportID } = useFightURL(cache);

  const [fight, loading] = useAbortableFetch<FightResponse>({
    url,
    initialState: cache?.fight ?? null,
  });

  if (!fightID || !reportID || !fight) {
    return null;
  }

  if ("error" in fight) {
    return <h1>{fight.error}</h1>;
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    fight,
    loading,
    reportID,
    fightID,
  };

  return (
    <FightContext.Provider value={value}>
      <FightIDHead />

      <div className="flex flex-col space-x-0 lg:space-x-4 lg:flex-row">
        <Meta />
        <Map />
      </div>

      <Data />
    </FightContext.Provider>
  );
}

type StaticPathParams = {
  reportID: string;
  fightID: string;
};

export const getStaticPaths: GetStaticPaths<StaticPathParams> = () => {
  return {
    fallback: true,
    paths: [],
  };
};

export const getStaticProps: GetStaticProps<FightIDProps, StaticPathParams> =
  () => {
    return {
      props: {
        cache: {
          fight: null,
          fightID: null,
          reportID: null,
        },
      },
    };
  };

function FightIDHead() {
  const { fight } = useFight();
  const { dungeons } = useStaticData();

  if (!fight) {
    return (
      <Head>
        <title>Keystone Heroes | loading...</title>
      </Head>
    );
  }

  const dungeon = dungeons[fight.dungeon];

  return (
    <Head>
      <title>
        KSH | {dungeon.slug} +{fight.meta.level} in{" "}
        {fightTimeToString(fight.meta.time)}
      </title>
    </Head>
  );
}
