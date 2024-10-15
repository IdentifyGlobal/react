// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, Identity, OpenIDConfiguration, OAuth2AuthzRequestParams, OAuth2TokenResponse, OAuth2TokenRequestParams } from '../@types/identify';
import cryptoRandomString from 'crypto-random-string';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url';
import { jwtDecode } from 'jwt-decode';

export interface LoginFormProps {
  onSuccess: () => void
}

export interface LoginFormState {
  openidConfiguration: OpenIDConfiguration;
  stateKey: string;
  codeVerifier: string;
  codeChallenge: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, ...props }) => {
  const { config, token, setToken, setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  const [obtainCount, setObtainCount] = React.useState<number>(0)
  const [state, setState] = React.useState<LoginFormState | undefined>(undefined)
  React.useEffect(() => {
    if (token === undefined) return;
    const openidConfigurationURL = new URL(`/d/${config.domainID}/s/${config.serverID}/.well-known/openid-configuration`, process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
    fetch(openidConfigurationURL)
      .then((response: Response) => response.json())
      .then((openidConfiguration: OpenIDConfiguration) => {
        const prompt = () => {
          const stateKey = cryptoRandomString({ length: 12 })
          const codeVerifier = cryptoRandomString({
            length: 64,
            characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
          }), codeChallenge = Base64url.stringify(sha256(codeVerifier))
          window.sessionStorage.setItem(`__state_${stateKey}`, JSON.stringify({
            codeVerifier,
          }))
          setState({
            openidConfiguration,
            stateKey,
            codeVerifier,
            codeChallenge,
          })
        }

        if (token === null) {
          prompt()
        } else
          if (obtainCount < 1) {
            const tokenRequestParams: OAuth2TokenRequestParams = {
              grant_type: 'refresh_token',
              refresh_token: token?.refresh_token
            };
            const tokenEndpointURL = new URL('?' + new URLSearchParams(Object.entries(tokenRequestParams)), openidConfiguration.token_endpoint)
            fetch(tokenEndpointURL)
              .then((response: Response) => response.json())
              .then((tokenResponse: OAuth2TokenResponse) => {
                setObtainCount((previousCount) => previousCount + 1)
                window.localStorage.setItem("identifyToken", JSON.stringify(tokenResponse))
                setToken(tokenResponse)
                const identity: Identity = jwtDecode(tokenResponse.id_token as string)
                setIdentity(identity)
                onSuccess()
              })
          }
      })
    const eventListener = ((event: CustomEvent) => {
      setObtainCount((previousCount) => previousCount + 1)
      const token: OAuth2TokenResponse = event.detail;
      window.localStorage.setItem("identifyToken", JSON.stringify(token))
      setToken(token)
      const identity: Identity = jwtDecode(token.id_token as string)
      setIdentity(identity)
      onSuccess()
    }) as EventListener
    window.addEventListener("identify.oauth2load", eventListener)
    return () => {
      window.removeEventListener("identify.oauth2load", eventListener)
    }
  }, [token])
  const authorizeEndpointSrc: string = React.useMemo(() => {
    if (state) {
      const requestParams: OAuth2AuthzRequestParams = {
        response_type: config.type,
        response_mode: config.mode,
        client_id: config.clientID,
        redirect_uri: config.redirectURI,
        scope: config.scope,
        state: state.stateKey,
        code_challenge: state.codeChallenge,
        code_challenge_method: 'S256'
      };
      const authEndpointURL = new URL('?' + new URLSearchParams(Object.entries(requestParams)),
        state.openidConfiguration.authorization_endpoint);
      return authEndpointURL.toString();
    }
  }, [state]) as string
  return (
    authorizeEndpointSrc && token === null ? <iframe src={authorizeEndpointSrc} width="500" height="700" {...props} /> : null
  );
};

export default LoginForm;