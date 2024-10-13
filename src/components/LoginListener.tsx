// components/LoginListener.tsx
import * as React from 'react';
import { AuthorizationSettings, OpenIDConfiguration } from '../@types/identify';

export interface LoginListenerProps {
  settings: AuthorizationSettings;
}

const LoginListener: React.FC<LoginListenerProps> = (props) => {
  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const authResponseParams = new URLSearchParams(locationURL.hash.substring(1))

    if (authResponseParams.has("code")) {
      const { settings } = props
      const openidConfigurationURL = new URL(`http://localhost:8788/d/${settings.domainID}/s/${settings.serverID}/.well-known/openid-configuration`);
      fetch(openidConfigurationURL)
        .then((response: Response) => response.json())
        .then((openidConfiguration: OpenIDConfiguration) => {
          const tokenEndpointURL = new URL(openidConfiguration.token_endpoint)
        })
    }
  }, [])
  return null;
};

export default LoginListener;