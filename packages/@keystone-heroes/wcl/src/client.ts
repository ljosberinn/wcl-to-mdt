import {
  WCL_CLIENT_ID,
  WCL_CLIENT_SECRET,
  WCL_GQL_ENDPOINT,
  WCL_OAUTH_ENDPOINT,
} from "@keystone-heroes/env";
import { GraphQLClient } from "graphql-request";
import fetch from "node-fetch";

import type { WCLOAuthResponse } from "./auth";
import { getWCLAuthentication, setWCLAuthentication } from "./auth";
import { getSdk } from "./types";
import type { Sdk } from "./types";

type Cache = {
  sdk: Sdk | null;
  client: GraphQLClient | null;
  expiresAt: number | null;
  pending: boolean;
};

const cache: Cache = {
  sdk: null,
  client: null,
  expiresAt: null,
  pending: false,
};

export const getCachedSdk = async (): Promise<Sdk> => {
  if (cache.sdk) {
    return cache.sdk;
  }

  const client = await getGqlClient();
  cache.sdk = cache.sdk ?? getSdk(client);

  return cache.sdk;
};

export const getGqlClient = async (): Promise<GraphQLClient> => {
  if (cache.pending) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    return getGqlClient();
  }

  if (
    cache.client &&
    cache.expiresAt &&
    cache.expiresAt > Date.now() + 60 * 1000
  ) {
    return cache.client;
  }

  cache.pending = true;
  const persisted = await getWCLAuthentication();

  if (
    persisted?.token &&
    persisted?.expiresAt &&
    !cache.client &&
    !cache.expiresAt
  ) {
    cache.client = new GraphQLClient(WCL_GQL_ENDPOINT, {
      headers: {
        authorization: `Bearer ${persisted.token}`,
      },
      fetch: global.fetch,
    });

    cache.expiresAt = persisted.expiresAt * 1000;
    cache.pending = false;

    return cache.client;
  }

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

      await setWCLAuthentication(json);

      cache.client =
        cache.client ??
        new GraphQLClient(WCL_GQL_ENDPOINT, {
          headers: {
            authorization: `Bearer ${json.access_token}`,
          },
          fetch: global.fetch,
        });

      cache.expiresAt = cache.expiresAt ?? Date.now() + json.expires_in;

      return cache.client;
    }

    throw new Error("unable to authenticate with WCL");
  } catch {
    throw new Error("unable to authenticate with WCL");
  }
};
