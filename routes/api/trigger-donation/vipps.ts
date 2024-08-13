import { getHostName } from "../../../lib/utils.ts";
import { createAgreement } from "../../../lib/vipps/vipps.ts";

export const handler = async function (_req: Request): Promise<Response> {
  const agreement = await createAgreement();
  if (agreement instanceof Error) {
    return Response.redirect(`${getHostName()}/donations-error`);
  }

  return Response.redirect(agreement.vippsConfirmationUrl);
};
