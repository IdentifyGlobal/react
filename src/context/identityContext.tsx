// context/IdentityContext.tsx
import * as React from 'react';
import { jwtDecode } from 'jwt-decode';
import { EncryptStorage } from 'encrypt-storage';
import {
  IdentityContextType,
  Identity,
  IdentityProviderConfigurationSettings,
  OAuth2TokenResponse,
  OpenIDConfiguration,
} from '../@types/identify';

export const IdentityContext = React.createContext<IdentityContextType | undefined | null>(undefined);

export interface IdentityProviderProps {
  configSettings: IdentityProviderConfigurationSettings;
  children: React.ReactNode;
}

export const IdentityProvider: React.FC<IdentityProviderProps> = ({ configSettings, children }) => {
  const [secureStorage, setSecureStorage] = React.useState<EncryptStorage | undefined>(undefined);
  const [secureSession, setSecureSession] = React.useState<EncryptStorage | undefined>(undefined);
  const [openidConfiguration, setOpenidConfiguration] = React.useState<OpenIDConfiguration | undefined>(undefined);
  const [token, setToken] = React.useState<OAuth2TokenResponse | undefined | null>(undefined);
  const [identity, setIdentity] = React.useState<Identity | undefined | null>(undefined);

  React.useEffect(() => {
    const { encryptionKey, domainOrigin, serverId } = configSettings
    const secureStorage = new EncryptStorage(encryptionKey, {
      stateManagementUse: true,
    })
    setSecureStorage(secureStorage)
    const secureSession = new EncryptStorage(encryptionKey, {
      stateManagementUse: true,
      storageType: 'sessionStorage',
    })
    setSecureSession(secureSession)
    const locationURL = new URL(location.href)
    const discoveryEndpointURL = new URL(`/s/${serverId}/.well-known/openid-configuration`, `${locationURL.protocol}//${domainOrigin}`)
    fetch(discoveryEndpointURL, {
      mode: 'cors',
    })
      .then(async (response: Response) => {
        if (response.status === 200) {
          const openidConfiguration: OpenIDConfiguration = await response.json()
          setOpenidConfiguration(openidConfiguration)

          try {
            const token: OAuth2TokenResponse = JSON.parse(secureStorage.getItem('_identify_token') as string)
            setToken(token)
            setIdentity(jwtDecode(token.id_token as string))
          } catch {
            setToken(null)
            setIdentity(null)
          }
        }
      })
  }, [])
  return (
    <IdentityContext.Provider
      value={{
        configSettings,
        secureStorage,
        secureSession,
        openidConfiguration,
        token,
        setToken,
        identity,
        setIdentity
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const { identity } = React.useContext(IdentityContext) as IdentityContextType;
  return identity;
};

export const useToken = () => {
  const { token } = React.useContext(IdentityContext) as IdentityContextType;
  return token;
};