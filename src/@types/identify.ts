// @types.identify.ts
export interface Identity {
  username: string;
}

export interface AuthorizationSettings {
  domainID: string;
  serverID: string;
}

export type IdentityContextType = {
  identity: Identity | undefined,
  setIdentity: (identity: Identity) => void;
}

export interface OAuth2AuthorizationRequestParameters {
  response_type: string;
  response_mode: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface OpenIDConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
}