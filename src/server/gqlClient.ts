import { GraphQLClient } from "graphql-request";

import {
  WCL_CLIENT_ID,
  WCL_CLIENT_SECRET,
  WCL_GQL_ENDPOINT,
  WCL_OAUTH_ENDPOINT,
} from "../constants";
import { WCLAuthRepo } from "./db/wclAuth";

type ClientCache = {
  client: GraphQLClient | null;
  expiresAt: number;
};

const clientCache: ClientCache = {
  client: null,
  expiresAt: -1,
};

export type WCLOAuthResponse = {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
};

export const getGqlClient = async (): Promise<GraphQLClient> => {
  if (clientCache.client && clientCache.expiresAt > Date.now() + 60 * 1000) {
    console.log("cached client");
    return clientCache.client;
  }

  const cache = await WCLAuthRepo.load();

  if (cache?.token && cache?.expiresAt) {
    console.log("auth cache hit");
    const { token, expiresAt } = cache;

    // eslint-disable-next-line require-atomic-updates
    clientCache.client = new GraphQLClient(WCL_GQL_ENDPOINT, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        authorization: `Bearer ${token}`,
      },
    });

    // eslint-disable-next-line require-atomic-updates
    clientCache.expiresAt = expiresAt * 1000;

    return clientCache.client;
  }

  console.log("no auth cache hit");

  try {
    const body = new URLSearchParams({
      client_id: WCL_CLIENT_ID,
      client_secret: WCL_CLIENT_SECRET,
      grant_type: "client_credentials",
    }).toString();

    const response = await fetch(WCL_OAUTH_ENDPOINT, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.ok) {
      const json: WCLOAuthResponse = await response.json();

      await WCLAuthRepo.upsert(json);

      // eslint-disable-next-line require-atomic-updates
      clientCache.client = new GraphQLClient(WCL_GQL_ENDPOINT, {
        headers: {
          authorization: `Bearer ${json.access_token}`,
        },
      });

      // eslint-disable-next-line require-atomic-updates
      clientCache.expiresAt = Date.now() + json.expires_in;

      return clientCache.client;
    }

    throw new Error("unable to authenticate with WCL");
  } catch {
    throw new Error("unable to authenticate with WCL");
  }
};
