import { FightRepo, ReportRepo } from "@keystone-heroes/db/repos";
import { isValidReportId } from "@keystone-heroes/wcl/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import type { FightResponse } from "@keystone-heroes/api/handler/fight";
import type { ReportResponse } from "@keystone-heroes/api/handler/report";
import type { GetStaticPaths, GetStaticProps } from "next";

type ReportProps = {
  cache?: {
    report: ReportResponse | null;
    fights: FightResponse[] | [];
  };
};

function useFights(
  report: ReportResponse | null,
  initialFights: FightResponse[] = []
) {
  const { isFallback } = useRouter();
  const [fights, setFights] = useState<FightResponse[]>(initialFights);

  useEffect(() => {
    if (
      isFallback ||
      !report ||
      !report.reportID ||
      report.fights.length === 0 ||
      initialFights.length > 0
    ) {
      return;
    }

    const params = new URLSearchParams({
      reportID: report.reportID,
    });

    report.fights.forEach((id) => {
      // @ts-expect-error doesn't have to be a string
      params.append("fightIDs", id);
    });

    const query = params.toString();

    fetch(`/api/fight?${query}`)
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((response) => response.json())
      // eslint-disable-next-line promise/prefer-await-to-then
      .then(setFights)
      // eslint-disable-next-line promise/prefer-await-to-then, no-console
      .catch(console.error);
  }, [report, isFallback, initialFights]);

  return fights;
}

function useReport(cachedReport: ReportResponse | null = null) {
  const { query, isFallback } = useRouter();
  const [report, setReport] = useState<ReportResponse | null>(cachedReport);

  useEffect(() => {
    if (
      isFallback ||
      report ||
      !query.reportID ||
      Array.isArray(query.reportID) ||
      !isValidReportId(query.reportID)
    ) {
      return;
    }

    fetch(`/api/report?reportID=${query.reportID}`)
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((response) => response.json())
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((data: ReportResponse) => {
        if (data) {
          setReport(data);
        }
      })
      // eslint-disable-next-line no-console, promise/prefer-await-to-then
      .catch(console.error);
  }, [query.reportID, report, isFallback]);

  return report;
}

export default function Report({ cache }: ReportProps): JSX.Element | null {
  const { query } = useRouter();

  const report = useReport(cache?.report);
  const fights = useFights(report, cache?.fights);

  if (!report) {
    return (
      <>
        <Head>
          <title>{query.id ?? "unknown report"}</title>
        </Head>
        <h1>retrieving data</h1>
      </>
    );
  }

  if (fights.length === 0) {
    return <h1>still loading stuff</h1>;
  }

  return <code>{JSON.stringify({ report, fights }, null, 2)}</code>;
}

export const getStaticPaths: GetStaticPaths<{ reportID: string }> =
  async () => {
    const reports = await ReportRepo.loadFinishedReports();

    // eslint-disable-next-line no-console
    console.info(`[Report/getStaticPaths] found ${reports.length} reports`);

    return {
      fallback: true,
      paths: reports.map((report) => {
        return {
          params: {
            reportID: report,
          },
        };
      }),
    };
  };

export const getStaticProps: GetStaticProps<ReportProps, { reportID: string }> =
  async ({ params }) => {
    if (
      !params?.reportID ||
      Array.isArray(params.reportID) ||
      params.reportID.includes(".")
    ) {
      throw new Error("invalid or missing params.id");
    }

    const { reportID } = params;

    try {
      // eslint-disable-next-line no-console
      console.info(`[Report/getStaticProps] loading report "${reportID}"`);

      const report = await ReportRepo.load(reportID);

      if (!report) {
        return {
          props: {
            cache: {
              fights: [],
              report: null,
            },
          },
        };
      }

      const { id: dbId, fights: reportFights, ...rest } = report;

      // eslint-disable-next-line no-console
      console.info(
        `[Report/getStaticProps] loading fights "${reportFights.join(",")}"`
      );
      const fights = await FightRepo.loadFull(reportID, reportFights);

      return {
        props: {
          cache: {
            fights,
            report: {
              ...rest,
              reportID,
              fights: reportFights,
              endTime: rest.endTime,
              region: report.region.slug,
              startTime: report.startTime,
            },
          },
        },
      };
    } catch {
      return {
        props: {
          cache: {
            fights: [],
            report: null,
          },
        },
      };
    }
  };