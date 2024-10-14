// components/LoginCallback.tsx
import * as React from 'react';
import {
  AuthorizationSettings,
  OpenIDConfiguration,
  OAuth2TokenRequestParameters,
  OAuth2TokenResponse,
} from '../@types/identify';

export interface LoginCallbackProps {
  settings: AuthorizationSettings;
}

/**
 * 
 * @param props 
 * @returns 
 */
const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const authResponseParams = new URLSearchParams(locationURL.hash.substring(1))

    if (authResponseParams.has("code")) {
      const { domainID, serverID } = props.settings
      const openidConfigurationURL = new URL(`/d/${domainID}/s/${serverID}/.well-known/openid-configuration`,
        process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
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
              const event = new CustomEvent('identify.oauth2load', { detail: tokenResponse })
              window.parent.dispatchEvent(event)
            })
        })
    }
  }, [])
  return null;
};

export default LoginCallback;