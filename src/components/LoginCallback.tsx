// components/LoginCallback.tsx
import * as React from 'react';
import { IdentityContext } from '../context';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import secureStorage from '../secureStorage';
import {
  IdentityContextType,
  OAuth2TokenRequest,
  OAuth2TokenResponse,
  LoginState
} from '../@types/identify';

export interface LoginCallbackProps { }

const LoginCallback: React.FC<LoginCallbackProps> = (props) => {
  const { openidConfiguration } = React.useContext(IdentityContext) as IdentityContextType;

  React.useEffect(() => {
    if (openidConfiguration === undefined)
      return

    const locationURL = new URL(location.href)
    const authzResponse = Object.fromEntries(new URLSearchParams(locationURL.hash.substring(1)).entries())
    const state: LoginState = JSON.parse(secureStorage.getItem('_identify_loginstate') as string)
    const hashVerifier = authzResponse.state

    if (state.keyChallenge === Base64url.stringify(sha256(hashVerifier))) {
      const tokenRequest: OAuth2TokenRequest = {
        grant_type: 'authorization_code',
        code: authzResponse.code,
        code_verifier: state.codeVerifier,
      };
      const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequest)), openidConfiguration.token_endpoint)
      fetch(tokenEndpointURL)
        .then((response: Response) => response.json())
        .then((tokenResponse: OAuth2TokenResponse) => {
          const event = new CustomEvent('_identify_oauth2callback', { detail: tokenResponse })
          window.parent.dispatchEvent(event)
        })
    }
  }, [openidConfiguration])

  return null;
};

export default LoginCallback;