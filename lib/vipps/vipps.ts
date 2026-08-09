// deno-lint-ignore-file ban-ts-comment
import { STATUS_CODE } from "$fresh/server.ts";
import "jsr:@std/dotenv/load";
import { encodeHex } from "jsr:@std/encoding/hex";
import { getHostUrl } from "../utils.ts";

const VIPPS_ENV_KEYS = {
  clientId: "VIPPS_CLIENT_ID",
  clientSecret: "VIPPS_CLIENT_SECRET",
  ocpApimSubscriptionKeyPrimary: "VIPPS_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY",
  ocpApimSubscriptionKeySecondary: "VIPPS_OCM_APIM_SUBSCRIPTION_KEY_SECONDARY",
  msn: "VIPPS_MSN",
  baseUrl: "VIPPS_API_BASE_URL",
} as const;

type VippsConfig = {
  clientId: string;
  clientSecret: string;
  ocpApimSubscriptionKeyPrimary: string;
  ocpApimSubscriptionKeySecondary: string;
  msn: string;
  baseUrl: string;
};

export function isVippsEnabled(): boolean {
  return Object.values(VIPPS_ENV_KEYS).every((key) => !!Deno.env.get(key));
}

function getVippsConfig(): VippsConfig {
  const config = {
    clientId: Deno.env.get(VIPPS_ENV_KEYS.clientId),
    clientSecret: Deno.env.get(VIPPS_ENV_KEYS.clientSecret),
    ocpApimSubscriptionKeyPrimary: Deno.env.get(
      VIPPS_ENV_KEYS.ocpApimSubscriptionKeyPrimary,
    ),
    ocpApimSubscriptionKeySecondary: Deno.env.get(
      VIPPS_ENV_KEYS.ocpApimSubscriptionKeySecondary,
    ),
    msn: Deno.env.get(VIPPS_ENV_KEYS.msn),
    baseUrl: Deno.env.get(VIPPS_ENV_KEYS.baseUrl),
  };

  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  return config as VippsConfig;
}

function getStandardVippsHeaders(config: VippsConfig) {
  return {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": config.ocpApimSubscriptionKeyPrimary,
    "Merchant-Serial-Number": config.msn,
    "Vipps-System-Name": "Krets AS",
  } as const;
}

const getAccessToken = async function () {
  const config = getVippsConfig();
  const standardVippsHeaders = getStandardVippsHeaders(config);

  console.log(`Fetching ${`${config.baseUrl}/accesstoken/get`}`);
  const response = await fetch(`${config.baseUrl}/accesstoken/get`, {
    method: "POST",
    // @ts-ignore
    headers: {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      ...standardVippsHeaders,
    },
  });

  const data = await response.json();
  return data.access_token as string;
};

export const createAgreement = async function (
  email: string,
  request?: Request,
) {
  try {
    const config = getVippsConfig();
    const token = await getAccessToken();
    const standardVippsHeaders = getStandardVippsHeaders(config);
    const amount = 5000; // 50 NOK

    // in case of special characters, like sub-addresses added
    // with +, e.g. "name+subscriptions@domain.com"
    const urlEncodedEmail = encodeURIComponent(email);
    const hostUrl = getHostUrl(request);
    const redirectUrl = `${hostUrl}/donations-success?urlEncodedEmail=${urlEncodedEmail}`;
    const response = await fetch(`${config.baseUrl}/recurring/v3/agreements/`, {
      method: "POST",
      // @ts-ignore
      headers: {
        authorization: `Bearer ${token}`,
        // anonymized and trimmed to not be too long (then it fails)
        "Idempotency-Key": `${encodeHex(email).slice(0, 10)}-${Date.now()}`,
        ...standardVippsHeaders,
      },
      body: JSON.stringify({
        interval: {
          unit: "MONTH",
          count: 1,
        },
        initialCharge: {
          amount: amount,
          description: "Initial charge",
          transactionType: "DIRECT_CAPTURE",
        },
        pricing: {
          amount: amount,
          currency: "NOK",
        },
        // email is used to identify the user in the success page
        merchantRedirectUrl: redirectUrl,
        merchantAgreementUrl: hostUrl,
        productName: "Månedlig støtte til NRSS",
      }),
    });

    if (response.status === STATUS_CODE.Created) {
      const body = response.json();
      return body as unknown as {
        vippsConfirmationUrl: string;
        agreementId: string;
      };
    } else {
      const errorMessage = `Failed to create Vipps agreement ${response.status} ${await response.text()}`;
      console.error(errorMessage);
      return new Error(errorMessage);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(message);
  }
};

export const getAgreement = async function (agreementId: string): Promise<
  | {
    status: "PENDING" | "ACTIVE" | "STOPPED" | "EXPIRED";
  }
  | Error
> {
  try {
    const config = getVippsConfig();
    const token = await getAccessToken();
    const standardVippsHeaders = getStandardVippsHeaders(config);
    const response = await fetch(
      `${config.baseUrl}/recurring/v3/agreements/${agreementId}`,
      {
        // @ts-ignore
        headers: {
          authorization: `Bearer ${token}`,
          ...standardVippsHeaders,
        },
      },
    );

    if (response.status === STATUS_CODE.OK) {
      return response.json();
    } else {
      const errorMessage = `Failed to get Vipps agreement ${response.status} ${await response.text()}`;
      console.error(errorMessage);
      return new Error(errorMessage);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(message);
  }
};

export const cancelAgreement = async function (agreementId: string) {
  try {
    const config = getVippsConfig();
    const token = await getAccessToken();
    const standardVippsHeaders = getStandardVippsHeaders(config);
    const response = await fetch(
      `${config.baseUrl}/recurring/v3/agreements/${agreementId}`,
      {
        method: "PATCH",
        // @ts-ignore
        headers: {
          authorization: `Bearer ${token}`,
          "Idempotency-Key": `${agreementId}-${Date.now()}`,
          ...standardVippsHeaders,
        },
        body: JSON.stringify({
          status: "STOPPED",
        }),
      },
    );

    if (response.status === STATUS_CODE.NoContent) {
      return true;
    } else {
      const errorMessage = `Failed to cancel Vipps agreement ${response.status} ${await response.text()}`;
      console.error(errorMessage);
      return new Error(errorMessage);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(message);
  }
};
