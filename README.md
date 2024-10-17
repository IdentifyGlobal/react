# react-identify

## Requirements:

- Node.js
- npm (Node.js package manager)

```bash
npm install @identify/react
```

### Usage

```javascript
import { IdentityProvider, LoginCallback } from "@identify/react";

// ...
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
