// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity, AuthorizationConfig } from '../@types/identify';
import { JSX } from 'react/jsx-runtime';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

/**
 * IdentityProvider
 * 
 * @param param0 
 * @returns 
 */
export const IdentityProvider: React.FC<{ config: AuthorizationConfig, children: React.ReactNode }> = ({ config, children }) => {
  const [identity, setIdentity] = React.useState<Identity>();
  const [state, setState] = React.useState<any>();
  return (
    <IdentityContext.Provider
      value={{ config, state, setState, identity, setIdentity }}
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
export const withIdentity = (Component: React.FC<{ identity: Identity | undefined }>) => {
  return (props: JSX.IntrinsicAttributes) => {
    const { identity } = React.useContext(IdentityContext) as IdentityContextType;
    return <Component {...props} identity={identity} />
  };
};