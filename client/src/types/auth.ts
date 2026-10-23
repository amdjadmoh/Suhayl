export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "agency";
  agencyId?: string;
  /** False for accounts made with Google that never set a password. Only on /auth/me. */
  hasPassword?: boolean;
  /** Agency users: the owner, or a counsellor working for the owner's agency */
  agencyRole?: "owner" | "counsellor";
  agencyOwnerId?: string;
  /** Counsellors: the agency they work for. Only on /auth/me. */
  agencyName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
