import type {
  EncryptedWithKeyData,
  EncryptedWithPasswordData,
} from "./interfaces.ts";

export async function encryptDataWithPassword(
  password: string,
  data: string,
): Promise<EncryptedWithPasswordData> {
  // Convert the password to Uint8Array
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Generate a random salt
  const salt = _internals.getRandomValues(new Uint8Array(16));

  // Derive a key from the password using PBKDF2
  const keyMaterial = await _internals.importKey(passwordBuffer);
  const key = await _internals.deriveKey(salt, keyMaterial);

  // Generate a random IV
  const iv = _internals.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const dataBuffer = encoder.encode(data);
  const encryptedData = await _internals.encrypt(iv, key, dataBuffer);

  // Encode data as base64 string
  const encryptedString = btoa(
    String.fromCharCode(...new Uint8Array(encryptedData)),
  );

  // Return the encrypted data, salt, and IV as an object
  return {
    encryptedString,
    salt: Array.from(salt),
    iv: Array.from(iv),
  };
}

export async function encryptDataWithKey(
  key: CryptoKey,
  data: string,
): Promise<EncryptedWithKeyData> {
  // Convert the data to Uint8Array
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate a random IV
  const iv = _internals.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await _internals.encrypt(iv, key, dataBuffer);

  // Encode data as base64 string
  const encryptedString = btoa(
    String.fromCharCode(...new Uint8Array(encryptedData)),
  );

  // Return the encrypted data and IV as an object
  return {
    encryptedString,
    iv: Array.from(iv),
  };
}

export const _internals = {
  getRandomValues: (buffer: Uint8Array) => {
    return crypto.getRandomValues(buffer);
  },
  importKey: async (passwordBuffer: ArrayBuffer) => {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"],
    );
    return keyMaterial;
  },
  deriveKey: async (salt: ArrayBuffer, keyMaterial: CryptoKey) => {
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );
    return key;
  },
  encrypt: async (iv: ArrayBuffer, key: CryptoKey, dataBuffer: ArrayBuffer) => {
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      dataBuffer,
    );
    return encryptedData;
  },
};
