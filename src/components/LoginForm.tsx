// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, Identity } from '../@types/identify';
import {
  OpenIDConfiguration,
  OAuth2AuthorizationRequestParameters,
} from '../@types/identify';

export interface LoginFormProps {
}

/**
 * LoginForm
 * 
 * @param props 
 * @returns 
 */
const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { settings, setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  const [openidConfiguration, setOpenIDConfiguration] = React.useState<OpenIDConfiguration>();
  React.useEffect(() => {
    const { domainID, serverID } = settings
    const openidConfigurationURL = new URL(`/d/${domainID}/s/${serverID}/.well-known/openid-configuration`,
      process.env.IDENTIFY_AUTHORIZATION_SERVER_URL_BASE);
    fetch(openidConfigurationURL)
      .then((response: Response) => response.json())
      .then((json: OpenIDConfiguration) => {
        setOpenIDConfiguration(json)
      })
    window.addEventListener("identify.oauth2load", ((event: CustomEvent) => {
      setIdentity(event.detail as Identity)
    }) as EventListener)
  }, [])
  const authEndpointSrc: string = React.useMemo(() => {
    if (openidConfiguration) {
      const requestParams: OAuth2AuthorizationRequestParameters = {
        response_type: 'code',
        response_mode: 'fragment',
        client_id: '123',
        redirect_uri: 'http://localhost:5173/oauth2/callback',
        scope: 'email',
        state: 'abc',
        code_challenge: 'abc',
        code_challenge_method: 'S256'
      };
      const authEndpointURL = new URL('?' + new URLSearchParams(Object.entries(requestParams)), openidConfiguration.authorization_endpoint);
      return authEndpointURL.toString();
    }
  }, [openidConfiguration]) as string
  return (
    <iframe src={authEndpointSrc} width="500" height="700" {...props} />
  );
};

export default LoginForm;