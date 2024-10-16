// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity, AuthorizationConfig, OAuth2TokenResponse } from '../@types/identify';
import { jwtDecode } from 'jwt-decode';
import secureStorage from '../secureStorage';

const identityContext = React.createContext<IdentityContextType | null>(null);
export default identityContext

export const IdentityProvider: React.FC<{ config: AuthorizationConfig, children: React.ReactNode }> = ({ config, children }) => {
  const [token, setToken] = React.useState<OAuth2TokenResponse | undefined | null>(undefined);
  const [identity, setIdentity] = React.useState<Identity | undefined | null>(undefined);
  React.useEffect(() => {
    try {
      const token: OAuth2TokenResponse = JSON.parse(secureStorage.getItem('_identify_token') as string)
      setToken(token)
      setIdentity(jwtDecode(token.id_token as string))
    } catch {
      setToken(null)
      setIdentity(null)
    }
  }, [])
  return (
    <identityContext.Provider
      value={{ config, token, setToken, identity, setIdentity }}
    >
      {children}
    </identityContext.Provider>
  );
};

export const useIdentity = () => {
  const { identity } = React.useContext(identityContext) as IdentityContextType;
  return identity;
};

export const useToken = () => {
  const { token } = React.useContext(identityContext) as IdentityContextType;
  return token;
};