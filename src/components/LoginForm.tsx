// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context';
import cryptoRandomString from 'crypto-random-string';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import { jwtDecode } from 'jwt-decode';
import secureStorage from '../secureStorage';
import {
  IdentityContextType,
  Identity,
  OAuth2AuthorizationRequest,
  OAuth2TokenRequest,
  OAuth2TokenResponse,
  LoginState,
} from '../@types/identify';

export interface LoginFormState {
  keyVerifier: string;
  codeVerifier: string;
  codeChallenge: string;
}

export interface LoginFormProps {
  onSuccess: () => void
  onFailure: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onFailure, ...props }) => {
  const {
    configSettings,
    openidConfiguration,
    token,
    setToken,
    setIdentity,
  } = React.useContext(IdentityContext) as IdentityContextType;

  const [grantCount, setGrantCount] = React.useState<number>(0)

  const [state, setState] = React.useState<LoginFormState | undefined>(undefined)

  React.useEffect(() => {
    if (openidConfiguration === undefined || token === undefined || grantCount > 0)
      return

    const apply = (token: OAuth2TokenResponse) => {
      try {
        secureStorage.setItem("_identify_token", JSON.stringify(token))
        const identity: Identity = jwtDecode(token.id_token as string)
        setGrantCount((count) => count + 1)
        setToken(token)
        setIdentity(identity)
        onSuccess()
      } catch {
        setToken(null)
        setIdentity(null)
        onFailure()
      }
    }

    const prompt = () => {
      const keyVerifier = cryptoRandomString({ length: 16, type: 'url-safe' }),
        keyChallenge = Base64url.stringify(sha256(keyVerifier))
      const codeVerifier = cryptoRandomString({
        length: 48,
        characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
      }), codeChallenge = Base64url.stringify(sha256(codeVerifier))
      const loginState: LoginState = {
        keyChallenge,
        codeVerifier,
      }
      secureStorage.setItem('_identify_loginstate', JSON.stringify(loginState))
      setState({ keyVerifier, codeVerifier, codeChallenge })
    }

    if (token === null) {
      prompt()
    } else {
      const tokenRequest: OAuth2TokenRequest = {
        grant_type: 'refresh_token',
        refresh_token: token?.refresh_token,
      };
      const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequest)), openidConfiguration.token_endpoint)
      fetch(tokenEndpointURL, {
        mode: 'cors'
      })
        .then(async (response: Response) => {
          if (response.status === 200) {
            const tokenResponse = await response.json();
            apply(tokenResponse);
          } else {
            setToken(null)
            setGrantCount(0)
          }
        })
    }
    const callbackEventListener = ((event: CustomEvent) => {
      const tokenResponse: OAuth2TokenResponse = event.detail;
      apply(tokenResponse)
      secureStorage.removeItem('_identify_loginstate')
    }) as EventListener
    window.addEventListener("_identify_oauth2callback", callbackEventListener)
    return () => {
      window.removeEventListener("_identify_oauth2callback", callbackEventListener)
    }
  }, [openidConfiguration, token, grantCount])

  const authzEndpointURL: string = React.useMemo(() => {
    if (openidConfiguration === undefined || state === undefined)
      return

    const { clientId, redirectUri, accessScope } = configSettings
    let accessScopes = accessScope?.split(' ') ?? []
    accessScopes.push('openid', 'profile', 'email')
    accessScopes = accessScopes.filter((s, i) => s && accessScopes.indexOf(s) === i)
    const authzRequest: OAuth2AuthorizationRequest = {
      response_type: "code",
      response_mode: "fragment",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: accessScopes.join(' '),
      state: state.keyVerifier,
      code_challenge: state.codeChallenge,
      code_challenge_method: 'S256'
    };
    const authzEndpointURL = new URL('?' + new URLSearchParams(Object.entries(authzRequest)), openidConfiguration?.authorization_endpoint);
    return authzEndpointURL.toString();
  }, [openidConfiguration, state]) as string

  return (
    authzEndpointURL && token === null ? <iframe src={authzEndpointURL} width="500" height="700" {...props} /> : null
  );
};

export default LoginForm;