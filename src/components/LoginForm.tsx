// components/LoginForm.tsx
import * as React from 'react';
import identityContext from '../context/identityContext';
import cryptoRandomString from 'crypto-random-string';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import { jwtDecode } from 'jwt-decode';
import secureStorage from '../secureStorage';
import {
  IdentityContextType,
  Identity,
  OpenIDConfiguration,
  OAuth2AuthorizationRequest,
  OAuth2TokenRequest,
  OAuth2TokenResponse
} from '../@types/identify';

export interface LoginFormProps {
  onSuccess: () => void
  onFailure: () => void
}

export interface LoginFormState {
  openidConfiguration: OpenIDConfiguration;
  keyVerifier: string;
  codeVerifier: string;
  codeChallenge: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onFailure, ...props }) => {
  const { config, openidConfigurationURL, token, setToken, setIdentity } = React.useContext(identityContext) as IdentityContextType;
  const [grantCount, setGrantCount] = React.useState<number>(0)
  const [state, setState] = React.useState<LoginFormState | undefined>(undefined)
  React.useEffect(() => {
    if (token === undefined || grantCount > 1) return;
    const apply = (tokenResponse: OAuth2TokenResponse) => {
      try {
        secureStorage.setItem("_identify_token", JSON.stringify(tokenResponse))
        const identity: Identity = jwtDecode(tokenResponse.id_token as string)
        setGrantCount((count) => count + 1)
        setToken(tokenResponse)
        setIdentity(identity)
        onSuccess()
      } catch {
        setToken(null)
        setIdentity(null)
        onFailure()
      }
    }
    fetch(openidConfigurationURL as URL)
      .then((response: Response) => response.json())
      .then((openidConfiguration: OpenIDConfiguration) => {
        const prompt = () => {
          const keyVerifier = cryptoRandomString({ length: 16, type: 'url-safe' }),
            keyChallenge = Base64url.stringify(sha256(keyVerifier))
          const codeVerifier = cryptoRandomString({
            length: 48,
            characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
          }), codeChallenge = Base64url.stringify(sha256(codeVerifier))
          secureStorage.setItem('_identify_loginstate', JSON.stringify({
            keyChallenge,
            codeVerifier,
          }))
          setState({
            openidConfiguration,
            keyVerifier,
            codeVerifier,
            codeChallenge,
          })
        }

        if (token === null) {
          prompt()
        } else {
          const tokenRequest: OAuth2TokenRequest = {
            grant_type: 'refresh_token',
            refresh_token: token?.refresh_token
          };
          const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequest)), openidConfiguration.token_endpoint)
          fetch(tokenEndpointURL)
            .then((response: Response) => response.json())
            .then(apply)
        }
      })
    const callbackEventListener = ((event: CustomEvent) => {
      const tokenResponse: OAuth2TokenResponse = event.detail;
      apply(tokenResponse)
    }) as EventListener
    window.addEventListener("_identify_oauth2callback", callbackEventListener)
    return () => {
      window.removeEventListener("_identify_oauth2callback", callbackEventListener)
    }
  }, [token])
  const authzEndpointURL: string = React.useMemo(() => {
    if (state) {
      const authzRequest: OAuth2AuthorizationRequest = {
        response_type: config.type,
        response_mode: config.mode,
        client_id: config.clientID,
        redirect_uri: config.redirectURI,
        scope: config.scope,
        state: state.keyVerifier,
        code_challenge: state.codeChallenge,
        code_challenge_method: 'S256'
      };
      const authzEndpointURL = new URL('?' + new URLSearchParams(Object.entries(authzRequest)),
        state.openidConfiguration.authorization_endpoint);
      return authzEndpointURL.toString();
    }
  }, [state]) as string
  return (
    authzEndpointURL && token === null ? <iframe src={authzEndpointURL} width="500" height="700" {...props} /> : null
  );
};

export default LoginForm;