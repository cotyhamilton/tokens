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
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive a key from the password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
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

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const dataBuffer = encoder.encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    dataBuffer,
  );

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
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    dataBuffer,
  );

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
