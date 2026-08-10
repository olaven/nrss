export function getSupportEmail() {
  return Deno.env.get("SUPPORT_EMAIL") ?? "olav@sundfoer.com";
}

export function getVippsSystemName() {
  return Deno.env.get("VIPPS_SYSTEM_NAME") ?? "Krets AS";
}
