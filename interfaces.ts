export interface EncryptedWithPasswordData {
  encryptedString: string;
  salt: number[];
  iv: number[];
}

export interface EncryptedWithKeyData {
  encryptedString: string;
  iv: number[];
}
