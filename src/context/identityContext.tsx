// context/identityContext.tsx
import * as React from 'react';
import { IdentityContextType, Identity } from '../@types/identify';

export const IdentityContext = React.createContext<IdentityContextType | null>(null);

const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = React.useState<Identity>();
  return <IdentityContext.Provider value={{ setIdentity }}>{children}</IdentityContext.Provider>;
};

export default IdentityProvider;