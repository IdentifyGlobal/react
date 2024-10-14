// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, Identity } from '../@types/identify';
import { OpenIDConfiguration, OAuth2AuthzRequestParams } from '../@types/identify';

export interface LoginFormProps {
}

/**
 * LoginForm
 * 
 * @param props 
 * @returns 
 */
const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { config, state, setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  const [openidConfiguration, setOpenIDConfiguration] = React.useState<OpenIDConfiguration>();
  React.useEffect(() => {
    // "Discovery"
    const openidConfigurationURL = new URL(`/d/${config.domainID}/s/${config.serverID}/.well-known/openid-configuration`,
      process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
    fetch(openidConfigurationURL)
      .then((response: Response) => response.json())
      .then((json: OpenIDConfiguration) => {
        setOpenIDConfiguration(json)
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
    if (openidConfiguration) {
      const requestParams: OAuth2AuthzRequestParams = {
        response_type: config.type,
        response_mode: config.mode,
        client_id: config.clientID,
        redirect_uri: config.redirectURI,
        scope: config.scope,
        state: state,
        code_challenge: 'abc',
        code_challenge_method: 'S256'
      };
      const authEndpointURL = new URL('?' + new URLSearchParams(Object.entries(requestParams)), openidConfiguration.authorization_endpoint);
      return authEndpointURL.toString();
    }
  }, [openidConfiguration]) as string
  return (
    <iframe src={authorizeEndpointSrc} width="500" height="700" {...props} />
  );
};

export default LoginForm;