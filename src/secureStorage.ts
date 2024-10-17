import { EncryptStorage } from 'encrypt-storage';

export const secureLocalStorage = new EncryptStorage(process.env.IDENTIFY_STORAGE_ENCRYPTION_KEY as string, {
  stateManagementUse: true,
})

export const secureSessionStorage = new EncryptStorage(process.env.IDENTIFY_STORAGE_ENCRYPTION_KEY as string, {
  stateManagementUse: true,
  storageType: 'sessionStorage',
})
