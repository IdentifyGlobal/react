import { EncryptStorage } from "encrypt-storage";

// @types.identify.ts
export type Identity = {
  username: string;
}

export interface IdentityProviderConfigurationSettings {
  encryptionKey: string;
  domainOrigin: string;
  serverId: string;
  clientId: string;
  redirectUri: string;
  accessScope: string;
}

export interface OAuth2AuthorizationRequest {
  response_type: string;
  response_mode: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface OAuth2AuthorizationResponse {
  code: string;
  state: string;
}

export interface OAuth2TokenRequest {
  grant_type: string;
  code?: string | null;
  refresh_token?: string | null | undefined;
  code_verifier?: string | null | undefined;
}

export type OAuth2TokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string | undefined;
  refresh_token?: string | undefined;
  token_type?: String | undefined;
}

export interface OpenIDConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
}

export interface LoginState {
  keyChallenge: string;
  codeVerifier: string;
}

export type IdentityContextType = {
  configSettings: IdentityProviderConfigurationSettings;
  secureStorage: EncryptStorage | undefined;
  secureSession: EncryptStorage | undefined;
  openidConfiguration: OpenIDConfiguration | undefined;
  token: OAuth2TokenResponse | undefined | null;
  setToken: (token: OAuth2TokenResponse | undefined | null) => void;
  identity: Identity | undefined | null;
  setIdentity: (identity: Identity | undefined | null) => void;
}