// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, Identity, OpenIDConfiguration, OAuth2AuthzRequestParams } from '../@types/identify';
import cryptoRandomString from 'crypto-random-string';
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url'

export interface LoginFormProps {
}

/**
 * LoginForm
 * 
 * @param props 
 * @returns 
 */
const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { config, applicationState, setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  const [state, setState] = React.useState<{ openidConfiguration: OpenIDConfiguration, stateKey: string, codeVerifier: string, codeChallenge: string } | null>(null)
  React.useEffect(() => {
    const openidConfigurationURL = new URL(`/d/${config.domainID}/s/${config.serverID}/.well-known/openid-configuration`,
      process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
    fetch(openidConfigurationURL)
      .then((response: Response) => response.json())
      .then((openidConfiguration: OpenIDConfiguration) => {
        const codeVerifier = cryptoRandomString({
          length: 64,
          characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
        })
        const stateKey = cryptoRandomString({ length: 12 })
        window.sessionStorage.setItem(`__state_${stateKey}`, JSON.stringify({ applicationState, codeVerifier }))
        const codeChallenge = Base64url.stringify(sha256(codeVerifier))
        setState({ openidConfiguration, stateKey, codeVerifier, codeChallenge })
      }).catch((reason) => {
        console.error(reason)
      })
    const eventListener = ((event: CustomEvent) => {
      setIdentity(event.detail as Identity)
    }) as EventListener
    window.addEventListener("identify.oauth2load", eventListener)
    return () => {
      window.removeEventListener("identify.oauth2load", eventListener)
    }
  }, [])
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
      const authEndpointURL = new URL('?' + new URLSearchParams(Object.entries(requestParams)), state.openidConfiguration.authorization_endpoint);
      return authEndpointURL.toString();
    }
  }, [state]) as string
  return (
    <iframe src={authorizeEndpointSrc} width="500" height="700" {...props} />
  );
};

export default LoginForm;