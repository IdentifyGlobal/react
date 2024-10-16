
import { EncryptStorage } from 'encrypt-storage';

const secureStorage = new EncryptStorage(process.env.IDENTIFY_STORAGE_ENCRYPTION_KEY as string, {
  stateManagementUse: true,
})

export default secureStorage