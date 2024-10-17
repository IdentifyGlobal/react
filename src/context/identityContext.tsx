// context/IdentityContext.tsx
import * as React from 'react';
import { jwtDecode } from 'jwt-decode';
import { secureLocalStorage } from '../secureStorage';
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
  const [token, setToken] = React.useState<OAuth2TokenResponse | undefined | null>(undefined);
  const [identity, setIdentity] = React.useState<Identity | undefined | null>(undefined);
  const [openidConfiguration, setOpenidConfiguration] = React.useState<OpenIDConfiguration | undefined>(undefined);

  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const { serverId, domainOrigin } = configSettings
    const discoveryEndpointURL = new URL(`/s/${serverId}/.well-known/openid-configuration`, `${locationURL.protocol}//${domainOrigin}`)
    fetch(discoveryEndpointURL, {
      mode: 'cors',
    })
      .then((response: Response) => response.json())
      .then((openidConfiguration: OpenIDConfiguration) => {
        setOpenidConfiguration(openidConfiguration)

        try {
          const token: OAuth2TokenResponse = JSON.parse(secureLocalStorage.getItem('_identify_token') as string)
          setToken(token)
          setIdentity(jwtDecode(token.id_token as string))
        } catch {
          setToken(null)
          setIdentity(null)
        }
      })
  }, [])
  return (
    <IdentityContext.Provider
      value={{
        configSettings,
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