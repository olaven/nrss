import { getHostUrl, validateEmail } from "../../../lib/utils.ts";
import { storage } from "../../../lib/storage.ts";
import { createAgreement } from "../../../lib/vipps/vipps.ts";

export const handler = async function (req: Request): Promise<Response> {
  const email = new URLSearchParams(req.url.split("?")[1] || "").get("email");
  const errorPage = `${getHostUrl()}/donations-error`;

  if (!email) {
    console.error("Missing email in query params", req.url);
    return Response.redirect(errorPage);
  }

  const valid = validateEmail(email);
  if (!valid) {
    console.error("Invalid email server side", email);
    return Response.redirect(errorPage);
  }

  const existingAgreement = await storage.readVippsAgreement({ id: email });
  if (existingAgreement && existingAgreement.revokedAt === null) {
    console.error("Agreement already exists", email);
    return Response.redirect(errorPage);
  }

  const agreement = await createAgreement(email);
  if (agreement instanceof Error) {
    console.error("Failed to create Vipps agreement", agreement);
    return Response.redirect(errorPage);
  }

  // associate the agreement with the user here
  // so it can be updated in the success page
  await storage.writeVippsAgreement({
    id: email,
    agreementId: agreement.agreementId,
    createdAt: new Date(),
    validAt: null,
    revokedAt: null,
  });

  return Response.redirect(agreement.vippsConfirmationUrl);
};
