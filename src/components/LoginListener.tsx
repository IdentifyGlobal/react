// components/LoginListener.tsx
import * as React from 'react';
import {
  AuthorizationSettings,
  OpenIDConfiguration,
  OAuth2TokenRequestParameters,
  OAuth2TokenResponse,
} from '../@types/identify';

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
          const tokenRequestParams: OAuth2TokenRequestParameters = {
            grant_type: 'authorization_code',
            code: authResponseParams.get('code')
          };
          const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequestParams)), openidConfiguration.token_endpoint)
          fetch(tokenEndpointURL)
            .then((response: Response) => response.json())
            .then((tokenResponse: OAuth2TokenResponse) => {
              const event = new CustomEvent('oauth2load', { detail: tokenResponse })
              window.parent.dispatchEvent(event)
            })
        })
    }
  }, [])
  return null;
};

export default LoginListener;