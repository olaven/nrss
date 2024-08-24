import "jsr:@std/dotenv/load";
import { getHostUrl } from "../utils.ts";
import { STATUS_CODE } from "$fresh/server.ts";

const config = {
  clientId: Deno.env.get("VIPPS_CLIENT_ID"),
  clientSecret: Deno.env.get("VIPPS_CLIENT_SECRET"),
  ocpApimSubscriptionKeyPrimary: Deno.env.get("VIPPS_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY"),
  ocpApimSubscriptionKeySecondary: Deno.env.get("VIPPS_OCM_APIM_SUBSCRIPTION_KEY_SECONDARY"),
  testMobileNumber: Deno.env.get("VIPPS_TEST_MOBILE_NUMBER"),
  msn: Deno.env.get("VIPPS_MSN"),
  baseUrl: Deno.env.get("VIPPS_API_BASE_URL"),
};

// ensure all environment variables are set
for (const [key, value] of Object.entries(config)) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const standardVippsHeaders = {
  "Content-Type": "application/json",
  "Ocp-Apim-Subscription-Key": config.ocpApimSubscriptionKeyPrimary,
  "Merchant-Serial-Number": config.msn,
  "Vipps-System-Name": "Krets AS",
} as const;

const getAccessToken = async function () {
  console.log(`Fetching ${`${config.baseUrl}/accesstoken/get`}`);
  const response = await fetch(`${config.baseUrl}/accesstoken/get`, {
    method: "POST",
    headers: {
      "client_id": config.clientId,
      "client_secret": config.clientSecret,
      ...standardVippsHeaders,
    },
  });

  const data = await response.json();
  return data.access_token as string;
};

export const createAgreement = async function (email: string) {
  const token = await getAccessToken();
  const response = await fetch(`${config.baseUrl}/recurring/v3/agreements/`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Idempotency-Key": `${email}-${Date.now()}`,
      ...standardVippsHeaders,
    },
    body: JSON.stringify({
      "interval": {
        "unit": "MONTH",
        "count": 1,
      },
      "pricing": {
        "suggestedMaxAmount": 5000, // 50,- NOK
        "currency": "NOK",
        "type": "VARIABLE",
      },
      // email is used to identify the user in the success page
      "merchantRedirectUrl": `${getHostUrl()}/donations-success?email=${email}`,
      "merchantAgreementUrl": `${getHostUrl()}`,
      "productName": "Månedlig støtte til NRSS",
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
};

export const getAgreement = async function (agreementId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${config.baseUrl}/recurring/v3/agreements/${agreementId}`, {
    headers: {
      authorization: `Bearer ${token}`,
      ...standardVippsHeaders,
    },
  });

  if (response.status === STATUS_CODE.OK) {
    return response.json();
  } else {
    const errorMessage = `Failed to get Vipps agreement ${response.status} ${await response.text()}`;
    console.error(errorMessage);
    return new Error(errorMessage);
  }
};

export const cancelAgreement = async function (agreementId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${config.baseUrl}/recurring/v3/agreements/${agreementId}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "Idempotency-Key": `${agreementId}-${Date.now()}`,
      ...standardVippsHeaders,
    },
    body: JSON.stringify({
      "status": "STOPPED",
    }),
  });

  if (response.status === STATUS_CODE.NoContent) {
    return true;
  } else {
    const errorMessage = `Failed to cancel Vipps agreement ${response.status} ${await response.text()}`;
    console.error(errorMessage);
    return new Error(errorMessage);
  }
};
