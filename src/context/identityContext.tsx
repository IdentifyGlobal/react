// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity, AuthorizationSettings } from '../@types/identify';
import { JSX } from 'react/jsx-runtime';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

export const IdentityProvider: React.FC<{
  settings: AuthorizationSettings,
  children: React.ReactNode
}> = ({ settings, children }) => {
  const [identity, setIdentity] = React.useState<Identity>();
  return (
    <IdentityContext.Provider
      value={{ settings, identity, setIdentity }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const withIdentity = (Component: React.FC<{ identity: Identity | undefined }>) => {
  return (props: JSX.IntrinsicAttributes) => {
    const { identity } = React.useContext(IdentityContext) as IdentityContextType;
    return <Component {...props} identity={identity} />
  };
};