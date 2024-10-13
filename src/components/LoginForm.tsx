// components/oidcframe/OIDCFrame.tsx
import * as React from 'react';
// import { IdentityContext } from '../context/identityContext';
// import { IdentityContextType, Identity } from '../@types/identity';
import { AuthorizationSettings, OpenIDConfiguration, OAuth2AuthorizationRequestParameters } from '../@types/identify';

export interface LoginFormProps {
  settings: AuthorizationSettings;
}

/**
 * LoginForm
 * 
 * @param props 
 * @returns 
 */
const LoginForm: React.FC<LoginFormProps> = (props) => {
  const [openidConfiguration, setOpenIDConfiguration] = React.useState<OpenIDConfiguration>();
  React.useEffect(() => {
    const { settings } = props
    const openidConfigurationURL = new URL(`http://localhost:8788/d/${settings.domainID}/s/${settings.serverID}/.well-known/openid-configuration`);
    fetch(openidConfigurationURL.href)
      .then((response: Response) => response.json())
      .then((json: OpenIDConfiguration) => {
        setOpenIDConfiguration(json)
      })
  }, [])
  const iframeSrc = React.useMemo(() => {
    if (openidConfiguration) {
      const authRequestParams: OAuth2AuthorizationRequestParameters = {
        response_type: 'code',
        response_mode: 'fragment',
        client_id: '123',
        redirect_uri: 'http://localhost:5173/oauth2/callback',
        scope: 'email',
        state: 'abc',
        code_challenge: 'abc',
        code_challenge_method: 'S256'
      };
      const authEndpointURL = new URL('?' + new URLSearchParams(Object.entries(authRequestParams)).toString(), openidConfiguration.authorization_endpoint);
      return authEndpointURL.toString();
    }
  }, [openidConfiguration])
  // const { setIdentity } = React.useContext(IdentityContext) as IdentityContextType;
  // const [formData, setFormData] = React.useState<Identity | {}>();
  // const handleForm = (e: React.FormEvent<HTMLInputElement>): void => {
  //   setFormData({
  //     ...formData,
  //     [e.currentTarget.id]: e.currentTarget.value,
  //   });
  // };
  // const handleSaveTodo = (e: React.FormEvent, formData: Identity | any) => {
  //   e.preventDefault();
  //   setIdentity(formData);
  // };
  return (
    <iframe src={iframeSrc} />
  );
};

export default LoginForm;