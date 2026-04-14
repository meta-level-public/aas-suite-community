export enum OrgaSubentry {
  DETAILS = 'DETAILS',
  USERS = 'USERS',
  INVITATIONS = 'INVITATIONS',
  ECLASS = 'ECLASS',
  TOKEN = 'TOKEN',
  AAS_INFRASTRUCTURE = 'AAS_INFRASTRUCTURE',
  PAYMENT_MODEL = 'PAYMENT_MODEL',
  SSO = 'SSO',
}

export type OrgaSubentryType = keyof typeof OrgaSubentry;
