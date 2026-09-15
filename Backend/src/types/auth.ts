export type CustomerSessionView = {
  email: string;
  firstName: string;
  lastName: string;
  signedInAt: string;
};

export type AdminSessionView = {
  email: string;
  role: string;
  signedInAt: string;
};

export type AuthSessionResponse = {
  session: CustomerSessionView;
  sessionToken: string;
};

export type AdminAuthSessionResponse = {
  session: AdminSessionView;
  sessionToken: string;
};
