// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity, AuthorizationConfig, OAuth2TokenResponse } from '../@types/identify';
import { JSX } from 'react/jsx-runtime';
import { jwtDecode } from 'jwt-decode';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

/**
 * IdentityProvider
 * 
 * @param param0 
 * @returns 
 */
export const IdentityProvider: React.FC<{ config: AuthorizationConfig, children: React.ReactNode }> = ({ config, children }) => {
  const [token, setToken] = React.useState<OAuth2TokenResponse | undefined | null>(undefined);
  const [identity, setIdentity] = React.useState<Identity | undefined | null>(undefined);
  React.useEffect(() => {
    const token: OAuth2TokenResponse = JSON.parse(window.localStorage.getItem("identifyToken") as string)

    if (token) {
      setToken(token)
      setIdentity(jwtDecode(token.id_token as string))
    } else {
      setToken(null)
      setIdentity(null)
    }
  }, [])
  return (
    <IdentityContext.Provider
      value={{
        config,
        token,
        setToken,
        identity,
        setIdentity,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

/**
 * useIdentity
 * 
 * @returns 
 */
export const useIdentity = () => {
  const { identity } = React.useContext(IdentityContext) as IdentityContextType;
  return identity
};

/**
 * useToken
 * 
 * @returns 
 */
export const useToken = () => {
  const { token } = React.useContext(IdentityContext) as IdentityContextType;
  return token
};