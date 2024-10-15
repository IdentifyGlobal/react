// components/LoginCallback.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, OpenIDConfiguration, OAuth2TokenRequestParams, OAuth2TokenResponse } from '../@types/identify';
import { jwtDecode } from 'jwt-decode';
export interface LoginCallbackProps {
}

/**
 * 
 * @param props 
 * @returns 
 */
const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  const { config } = React.useContext(IdentityContext) as IdentityContextType;
  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const authResponseParams = new URLSearchParams(locationURL.hash.substring(1))

    if (authResponseParams.has("code")) {
      const storageKey = `__state_${authResponseParams.get("state")}`
      const state = JSON.parse(window.sessionStorage.getItem(storageKey) || "")
      window.sessionStorage.removeItem(storageKey)
      const openidConfigurationURL = new URL(`/d/${config.domainID}/s/${config.serverID}/.well-known/openid-configuration`,
        process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
      fetch(openidConfigurationURL)
        .then((response: Response) => response.json())
        .then((openidConfiguration: OpenIDConfiguration) => {
          const tokenRequestParams: OAuth2TokenRequestParams = {
            grant_type: 'authorization_code',
            code: authResponseParams.get('code'),
            code_verifier: state.codeVerifier
          };
          const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequestParams)), openidConfiguration.token_endpoint)
          fetch(tokenEndpointURL)
            .then((response: Response) => response.json())
            .then((tokenResponse: OAuth2TokenResponse) => {
              const identity = jwtDecode(tokenResponse.id_token as string)
              const event = new CustomEvent('identify.oauth2load', { detail: identity })
              window.parent.dispatchEvent(event)
            })
        })
    }
  }, [])
  return null;
};

export default LoginCallback;