import "jsr:@std/dotenv/load";
import { getHostName } from "../utils.ts";
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

/**
 curl -X POST https://apitest.vipps.no/recurring/v3/agreements/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
-H "Ocp-Apim-Subscription-Key: YOUR-SUBSCRIPTION-KEY" \
-H "Merchant-Serial-Number: YOUR-MSN" \
-H 'Idempotency-Key: YOUR-IDEMPOTENCY-KEY' \
-H "Vipps-System-Name: acme" \
-H "Vipps-System-Version: 3.1.2" \
-H "Vipps-System-Plugin-Name: acme-webshop" \
-H "Vipps-System-Plugin-Version: 4.5.6" \
-d '{
   "interval": {
      "unit" : "WEEK",
      "count": 2
   },
   "pricing": {
      "amount": 1000,
      "currency": "NOK"
   },
   "merchantRedirectUrl": "https://example.com/redirect-url",
   "merchantAgreementUrl": "https://example.com/agreement-url",
   "phoneNumber": "12345678",
   "productName": "Test product"
}'
 */

export const createAgreement = async function () {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const response = await fetch(`${config.baseUrl}/recurring/v3/agreements/`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey,
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
      "merchantRedirectUrl": `${getHostName()}/donations-success`,
      "merchantAgreementUrl": `${getHostName()}/donations`,
      "productName": "Månedlig støtte til NRSS",
    }),
  });

  if (response.status === STATUS_CODE.Created) {
    const body = response.json();
    return body as unknown as {
      vippsConfirmationUrl: string;
    };
  } else {
    const errorMessage = `Failed to create Vipps agreement ${response.status} ${await response.text()}`;
    console.error(errorMessage);
    return new Error(errorMessage);
  }
};
