export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "agency";
  agencyId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
