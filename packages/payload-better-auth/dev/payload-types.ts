/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * Supported timezones in IANA format.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supportedTimezones".
 */
export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    user: UserAuthOperations;
  };
  blocks: {};
  collections: {
    posts: Post;
    media: Media;
    user: User;
    session: Session;
    account: Account;
    verification: Verification;
    twoFactor: TwoFactor;
    passkey: Passkey;
    organization: Organization;
    member: Member;
    invitation: Invitation;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    posts: PostsSelect<false> | PostsSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    user: UserSelect<false> | UserSelect<true>;
    session: SessionSelect<false> | SessionSelect<true>;
    account: AccountSelect<false> | AccountSelect<true>;
    verification: VerificationSelect<false> | VerificationSelect<true>;
    twoFactor: TwoFactorSelect<false> | TwoFactorSelect<true>;
    passkey: PasskeySelect<false> | PasskeySelect<true>;
    organization: OrganizationSelect<false> | OrganizationSelect<true>;
    member: MemberSelect<false> | MemberSelect<true>;
    invitation: InvitationSelect<false> | InvitationSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: string;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'user';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "posts".
 */
export interface Post {
  id: string;
  title?: string | null;
  content?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "user".
 */
export interface User {
  id: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  twoFactorEnabled?: boolean | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
  nickname?: string | null;
  posts?: (string | Post)[] | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "session".
 */
export interface Session {
  id: string;
  expiresAt: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string | User;
  impersonatedBy?: string | null;
  activeOrganizationId?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "account".
 */
export interface Account {
  id: string;
  accountId: string | Account;
  providerId: string;
  userId: string | User;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
  scope?: string | null;
  password?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "verification".
 */
export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "twoFactor".
 */
export interface TwoFactor {
  id: string;
  secret: string;
  backupCodes: string;
  userId: string | User;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "passkey".
 */
export interface Passkey {
  id: string;
  name?: string | null;
  publicKey: string;
  userId: string | User;
  credentialID: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "organization".
 */
export interface Organization {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  metadata?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "member".
 */
export interface Member {
  id: string;
  organizationId: string | Organization;
  userId: string | User;
  role: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invitation".
 */
export interface Invitation {
  id: string;
  organizationId: string | Organization;
  role?: string | null;
  status: string;
  expiresAt: string;
  inviterId: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: string;
  document?:
    | ({
        relationTo: 'posts';
        value: string | Post;
      } | null)
    | ({
        relationTo: 'media';
        value: string | Media;
      } | null)
    | ({
        relationTo: 'user';
        value: string | User;
      } | null)
    | ({
        relationTo: 'session';
        value: string | Session;
      } | null)
    | ({
        relationTo: 'account';
        value: string | Account;
      } | null)
    | ({
        relationTo: 'verification';
        value: string | Verification;
      } | null)
    | ({
        relationTo: 'twoFactor';
        value: string | TwoFactor;
      } | null)
    | ({
        relationTo: 'passkey';
        value: string | Passkey;
      } | null)
    | ({
        relationTo: 'organization';
        value: string | Organization;
      } | null)
    | ({
        relationTo: 'member';
        value: string | Member;
      } | null)
    | ({
        relationTo: 'invitation';
        value: string | Invitation;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'user';
    value: string | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'user';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "posts_select".
 */
export interface PostsSelect<T extends boolean = true> {
  title?: T;
  content?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "user_select".
 */
export interface UserSelect<T extends boolean = true> {
  name?: T;
  emailVerified?: T;
  image?: T;
  twoFactorEnabled?: T;
  role?: T;
  banned?: T;
  banReason?: T;
  banExpires?: T;
  nickname?: T;
  posts?: T;
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "session_select".
 */
export interface SessionSelect<T extends boolean = true> {
  expiresAt?: T;
  token?: T;
  ipAddress?: T;
  userAgent?: T;
  userId?: T;
  impersonatedBy?: T;
  activeOrganizationId?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "account_select".
 */
export interface AccountSelect<T extends boolean = true> {
  accountId?: T;
  providerId?: T;
  userId?: T;
  accessToken?: T;
  refreshToken?: T;
  idToken?: T;
  accessTokenExpiresAt?: T;
  refreshTokenExpiresAt?: T;
  scope?: T;
  password?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "verification_select".
 */
export interface VerificationSelect<T extends boolean = true> {
  identifier?: T;
  value?: T;
  expiresAt?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "twoFactor_select".
 */
export interface TwoFactorSelect<T extends boolean = true> {
  secret?: T;
  backupCodes?: T;
  userId?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "passkey_select".
 */
export interface PasskeySelect<T extends boolean = true> {
  name?: T;
  publicKey?: T;
  userId?: T;
  credentialID?: T;
  counter?: T;
  deviceType?: T;
  backedUp?: T;
  transports?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "organization_select".
 */
export interface OrganizationSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  logo?: T;
  metadata?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "member_select".
 */
export interface MemberSelect<T extends boolean = true> {
  organizationId?: T;
  userId?: T;
  role?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invitation_select".
 */
export interface InvitationSelect<T extends boolean = true> {
  organizationId?: T;
  role?: T;
  status?: T;
  expiresAt?: T;
  inviterId?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}