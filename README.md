# @identifyglobal/react

## Requirements:

- Node.js
- npm (Node.js package manager)

```bash
npm install @identifyglobal/react
```

### Usage

```javascript
// ...
import { IdentityProvider, LoginForm, LoginCallback } from "@identifyglobal/react";

// ...

const router = createBrowserRouter([
  // ...
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/oauth2/callback",
    element: <LoginCallback />,
  },
]);

const identityProviderConfigSettings = {
  encryptionKey: "<random-crypto-string>",
  domainOrigin: "auth.example.com",
  serverId: "<Server-UUID>",
  clientId: "<Client-ID>",
  redirectUri: "https://www.example.com/oauth2/callback",
  accessScope: "custom1 custom2 etc",
};
return (
  <IdentityProvider configSettings={identityProviderConfigSettings}>
    <RouterProvider router={router} />
  </IdentityProvider>
);
```
