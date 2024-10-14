// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity } from '../@types/identify';
import { JSX } from 'react/jsx-runtime';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = React.useState<Identity>();
  return (
    <IdentityContext.Provider value={{ identity, setIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const withIdentity = (Component: React.FC<{ identity: Identity }>) => {
  return (props: JSX.IntrinsicAttributes) => {
    <IdentityContext.Consumer>
      {value => <Component {...props} identity={value}></Component>}
    </IdentityContext.Consumer>
  };
};