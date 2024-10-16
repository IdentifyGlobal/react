// components/LoginCallback.tsx
import * as React from 'react';
import identityContext from '../context/identityContext';
import { IdentityContextType, OpenIDConfiguration, OAuth2TokenRequest, OAuth2TokenResponse } from '../@types/identify';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import secureStorage from '../secureStorage';

export interface LoginCallbackProps { }

const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  const { config } = React.useContext(identityContext) as IdentityContextType;
  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const authResponseParams = new URLSearchParams(locationURL.hash.substring(1))

    if (authResponseParams.has("code")) {
      try {
        const loginState = JSON.parse(secureStorage.getItem('_identify_loginstate') as string)
        const hashVerifier = authResponseParams.get("state") as string

        if (loginState.hashChallenge === Base64url.stringify(sha256(hashVerifier))) {
          const openidConfigurationURL = new URL(`/d/${config.domainID}/s/${config.serverID}/.well-known/openid-configuration`, process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
          fetch(openidConfigurationURL)
            .then((response: Response) => response.json())
            .then((openidConfiguration: OpenIDConfiguration) => {
              const tokenRequestParams: OAuth2TokenRequest = {
                grant_type: 'authorization_code',
                code: authResponseParams.get('code'),
                code_verifier: loginState.codeVerifier
              };
              const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequestParams)), openidConfiguration.token_endpoint)
              fetch(tokenEndpointURL)
                .then((response: Response) => response.json())
                .then((tokenResponse: OAuth2TokenResponse) => {
                  const event = new CustomEvent('_identify_oauth2callback', { detail: tokenResponse })
                  window.parent.dispatchEvent(event)
                })
            })
        }
      } finally {
        secureStorage.removeItem('_identify_loginstate')
      }
    }
  }, [])
  return null;
};

export default LoginCallback;