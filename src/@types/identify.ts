// @types.identify.ts
export type Identity = {
  access_token: string;
  expires_in: number;
  id_token: string | undefined;
  refresh_token: string | undefined;
  token_type: String | undefined;
}

export interface AuthorizationConfig {
  domainID: string;
  serverID: string;
  type: string;
  mode: string;
  clientID: string;
  redirectURI: string;
  scope: string;
}

export type IdentityContextType = {
  config: AuthorizationConfig,
  state: any | undefined,
  setState: (state: any) => void,
  identity: Identity | undefined,
  setIdentity: (identity: Identity) => void;
}

export interface OAuth2AuthzRequestParams {
  response_type: string;
  response_mode: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface OAuth2TokenRequestParams {
  grant_type: string;
  code: string | null;
}

export type OAuth2TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string | undefined;
  refresh_token: string | undefined;
  token_type: String | undefined;
}

export interface OpenIDConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
}