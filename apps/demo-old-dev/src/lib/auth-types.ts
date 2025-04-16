import type { auth } from "./auth.js";
import { client } from "./auth-client.js";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Invitation = typeof client.$Infer.Invitation;
