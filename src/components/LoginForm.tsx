// components/LoginForm.tsx
import * as React from 'react';
import { IdentityContext } from '../context/identityContext';
import { IdentityContextType, Identity } from '../@types/identify';
import {
  AuthorizationSettings,
  OpenIDConfiguration,
  OAuth2AuthorizationRequestParameters,
} from '../@types/identify';

export interface LoginFormProps {
  settings: AuthorizationSettings;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  const [openidConfiguration, setOpenIDConfiguration] = React.useState<OpenIDConfiguration>();
  React.useEffect(() => {
    const { settings } = props
    const openidConfigurationURL = new URL(`http://localhost:8788/d/${settings.domainID}/s/${settings.serverID}/.well-known/openid-configuration`);
    fetch(openidConfigurationURL)
      .then((response: Response) => response.json())
      .then((json: OpenIDConfiguration) => {
        setOpenIDConfiguration(json)
      })
    window.addEventListener("oauth2load", ((event: CustomEvent) => {
      setIdentity(event.detail as Identity)
    }) as EventListener)
  }, [])
  const iframeSrc = React.useMemo(() => {
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
  }, [openidConfiguration])
  return (
    <iframe src={iframeSrc} width="500" height="700" />
  );
};

export default LoginForm;