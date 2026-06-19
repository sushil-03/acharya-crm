export type LoginResponse = {
  accessToken: string;
  expiresIn: string;
  user: {
    id: string;
    email?: string;
    role: string;
    campusId: string | null;
    crmRoleId?: number | null;
  };
};

export type LoginRequest = {
  username: string;
  password: string;
};
