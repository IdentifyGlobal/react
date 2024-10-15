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
 * withIdentity
 * @param Component 
 * @returns 
 */
export const withIdentity = (Component: React.FC<{ identity: Identity | undefined | null }>) => {
  return (props: JSX.IntrinsicAttributes) => {
    const { identity } = React.useContext(IdentityContext) as IdentityContextType;
    return <Component {...props} identity={identity} />
  };
};

/**
 * withToken
 * @param Component 
 * @returns 
 */
export const withToken = (Component: React.FC<{ token: OAuth2TokenResponse | undefined | null }>) => {
  return (props: JSX.IntrinsicAttributes) => {
    const { token } = React.useContext(IdentityContext) as IdentityContextType;
    return <Component {...props} token={token} />
  };
};