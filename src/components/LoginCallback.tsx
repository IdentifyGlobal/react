// components/LoginCallback.tsx
import * as React from 'react';
import identityContext from '../context/identityContext';
import {
  IdentityContextType,
  OpenIDConfiguration,
  OAuth2TokenRequest,
  OAuth2TokenResponse
} from '../@types/identify';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import secureStorage from '../secureStorage';

export interface LoginCallbackProps { }

const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  const { config, openidConfigurationURL } = React.useContext(identityContext) as IdentityContextType;
  React.useEffect(() => {
    const locationURL = new URL(location.href)
    const authzResponse = Object.fromEntries(new URLSearchParams(locationURL.hash.substring(1)).entries())

    try {
      const state = JSON.parse(secureStorage.getItem('_identify_loginstate') as string)
      const hashVerifier = authzResponse.state

      if (state.hashChallenge === Base64url.stringify(sha256(hashVerifier))) {
        fetch(openidConfigurationURL as URL)
          .then((response: Response) => response.json())
          .then((openidConfiguration: OpenIDConfiguration) => {
            const tokenRequest: OAuth2TokenRequest = {
              grant_type: 'authorization_code',
              code: authzResponse.code,
              code_verifier: state.codeVerifier
            };
            const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequest)), openidConfiguration.token_endpoint)
            fetch(tokenEndpointURL)
              .then((response: Response) => response.json())
              .then((tokenResponse: OAuth2TokenResponse) => {
                const event = new CustomEvent('_identify_oauth2callback', { detail: tokenResponse })
                window.parent.dispatchEvent(event)
              })
          })
      }
    } catch {
      console.info('Login callback invoked with missing login state.')
    } finally {
      secureStorage.removeItem('_identify_loginstate')
    }
  }, [])
  return null;
};

export default LoginCallback;