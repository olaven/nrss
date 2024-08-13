import { getHostName, validateEmail } from "../../../lib/utils.ts";
import { createAgreement } from "../../../lib/vipps/vipps.ts";

export const handler = async function (req: Request): Promise<Response> {
  const email = new URLSearchParams(req.url.split("?")[1] || "").get("email");
  const errorPage = `${getHostName()}/donations-error`;

  if (!email) {
    console.error("Missing email in query params", req.url);
    return Response.redirect(errorPage);
  }

  const valid = validateEmail(email);
  if (!valid) {
    console.error("Invalid email server side", email);
    return Response.redirect(errorPage);
  }

  const agreement = await createAgreement(email);
  if (agreement instanceof Error) {
    console.error("Failed to create Vipps agreement", agreement);
    return Response.redirect(errorPage);
  }

  return Response.redirect(agreement.vippsConfirmationUrl);
};
