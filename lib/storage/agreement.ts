import { query } from "./database.ts";

export type VippsAgreement = {
  // the user identifier / email
  id: string;
  // the agreement id from Vipps
  agreementId: string;
  createdAt: Date;
  validAt: Date | null;
  revokedAt: Date | null;
};

type VippsAgreementRow = {
  id: string;
  agreement_id: string;
  created_at: Date;
  valid_at: Date | null;
  revoked_at: Date | null;
};

function rowToAgreement(row: VippsAgreementRow): VippsAgreement {
  return {
    id: row.id,
    agreementId: row.agreement_id,
    createdAt: new Date(row.created_at),
    validAt: row.valid_at ? new Date(row.valid_at) : null,
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
  };
}

export async function readVippsAgreement(agreement: { id: string }): Promise<VippsAgreement | null> {
  const result = await query<VippsAgreementRow>(
    `select id, agreement_id, created_at, valid_at, revoked_at
     from vipps_agreements
     where id = $1`,
    [agreement.id],
  );

  const row = result.rows[0];
  return row ? rowToAgreement(row) : null;
}

export async function writeVippsAgreement(agreement: VippsAgreement): Promise<boolean> {
  const result = await query(
    `insert into vipps_agreements (id, agreement_id, created_at, valid_at, revoked_at)
     values ($1, $2, $3, $4, $5)
     on conflict (id) do update set
       agreement_id = excluded.agreement_id,
       created_at = excluded.created_at,
       valid_at = excluded.valid_at,
       revoked_at = excluded.revoked_at`,
    [agreement.id, agreement.agreementId, agreement.createdAt, agreement.validAt, agreement.revokedAt],
  );

  return result.rowCount === 1;
}
