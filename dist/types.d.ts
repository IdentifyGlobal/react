import * as React from 'react';
import { EncryptStorage } from 'encrypt-storage';

interface LoginFormProps {
    onSuccess: () => void;
    onFailure: () => void;
}
declare const LoginForm: React.FC<LoginFormProps>;

interface LoginCallbackProps {
}
declare const LoginCallback: React.FC<LoginCallbackProps>;

type Identity = {
    username: string;
};
interface IdentityProviderConfigurationSettings {
    encryptionKey: string;
    domainOrigin: string;
    serverId: string;
    clientId: string;
    redirectUri: string;
    accessScope: string;
}
type OAuth2TokenResponse = {
    access_token?: string;
    expires_in?: number;
    id_token?: string | undefined;
    refresh_token?: string | undefined;
    token_type?: String | undefined;
};
interface OpenIDConfiguration {
    authorization_endpoint: string;
    token_endpoint: string;
}
type IdentityContextType = {
    configSettings: IdentityProviderConfigurationSettings;
    secureStorage: EncryptStorage | undefined;
    secureSession: EncryptStorage | undefined;
    openidConfiguration: OpenIDConfiguration | undefined;
    token: OAuth2TokenResponse | undefined | null;
    setToken: (token: OAuth2TokenResponse | undefined | null) => void;
    identity: Identity | undefined | null;
    setIdentity: (identity: Identity | undefined | null) => void;
};

declare const IdentityContext: React.Context<IdentityContextType | null | undefined>;
interface IdentityProviderProps {
    configSettings: IdentityProviderConfigurationSettings;
    children: React.ReactNode;
}
declare const IdentityProvider: React.FC<IdentityProviderProps>;
declare const useIdentity: () => Identity | null | undefined;
declare const useToken: () => OAuth2TokenResponse | null | undefined;

export { IdentityContext, IdentityProvider, type IdentityProviderProps, LoginCallback, LoginForm, useIdentity, useToken };
