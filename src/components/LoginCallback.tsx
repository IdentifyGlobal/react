// components/LoginCallback.tsx
import * as React from 'react';
import { IdentityContext } from '../context';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import {
  IdentityContextType,
  OAuth2TokenRequest,
  OAuth2TokenResponse,
  LoginState
} from '../@types/identify';

export interface LoginCallbackProps { }

const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  const { secureSession, openidConfiguration } = React.useContext(IdentityContext) as IdentityContextType;

  React.useEffect(() => {
    if (secureSession === undefined || openidConfiguration === undefined)
      return

    const locationURL = new URL(location.href)
    const authzResponse = Object.fromEntries(new URLSearchParams(locationURL.hash.substring(1)).entries())
    const state: LoginState = JSON.parse(secureSession.getItem('_identify_loginstate') as string)
    const hashVerifier = authzResponse.state

    if (state.keyChallenge === Base64url.stringify(sha256(hashVerifier))) {
      const tokenRequest: OAuth2TokenRequest = {
        grant_type: 'authorization_code',
        code: authzResponse.code,
        code_verifier: state.codeVerifier,
      };
      const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequest)), openidConfiguration.token_endpoint)
      fetch(tokenEndpointURL)
        .then(async (response: Response) => {
          if (response.status === 200) {
            const tokenResponse: OAuth2TokenResponse = await response.json()
            const event = new CustomEvent('_identify_oauth2callback', { detail: tokenResponse })
            window.parent.dispatchEvent(event)
          } else {
            const event = new CustomEvent('_identify_oauth2callbackerror', { detail: response.status })
            window.parent.dispatchEvent(event)
          }
        })
    }
  }, [secureSession, openidConfiguration])

  return null;
};

export default LoginCallback;