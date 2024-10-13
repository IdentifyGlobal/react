// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity } from '../@types/identify';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = React.useState<Identity>();
  return (
    <IdentityContext.Provider value={{ identity, setIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
};