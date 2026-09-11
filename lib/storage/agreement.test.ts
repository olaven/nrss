import { assertEquals } from "$std/assert/mod.ts";
import { readVippsAgreement, VippsAgreement, writeVippsAgreement } from "./agreement.ts";

function generateAgreement(overrides: Partial<VippsAgreement> = {}): VippsAgreement {
  return {
    id: `${crypto.randomUUID()}@example.com`,
    agreementId: crypto.randomUUID(),
    createdAt: new Date(),
    validAt: null,
    revokedAt: null,
    ...overrides,
  };
}

Deno.test({
  name: "can store a vipps agreement",
  // A pooled pg connection is a long-lived resource shared across
  // this whole test run, which Deno's sanitizers would otherwise flag.
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const agreement = generateAgreement();
    await writeVippsAgreement(agreement);

    const stored = await readVippsAgreement(agreement);

    assertEquals(stored, agreement);
  },
});

Deno.test({
  name: "can retrieve a vipps agreement once it has been validated and revoked",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const agreement = generateAgreement({ validAt: new Date(), revokedAt: new Date() });
    await writeVippsAgreement(agreement);

    const stored = await readVippsAgreement(agreement);

    assertEquals(stored, agreement);
  },
});
