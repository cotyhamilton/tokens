export async function decryptDataWithPassword(
  password: string,
  encryptedString: string,
  salt: number[],
  iv: number[],
) {
  // Convert encrypted string to Uint8Array
  const encryptedData = Uint8Array.from(
    atob(encryptedString),
    (c) => c.charCodeAt(0),
  );

  // Convert the password to Uint8Array
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import the salt and IV
  const saltBuffer = new Uint8Array(salt);
  const ivBuffer = new Uint8Array(iv);

  // Derive the key from the password using PBKDF2
  const keyMaterial = await _internals.importKey(passwordBuffer);
  const key = await _internals.deriveKey(saltBuffer, keyMaterial);

  // Decrypt the data
  const decryptedData = await _internals.decrypt(ivBuffer, key, encryptedData);

  // Return the decrypted data as a string
  return new TextDecoder().decode(decryptedData);
}

export async function decryptDataWithKey(
  key: CryptoKey,
  encryptedString: string,
  iv: number[],
) {
  // Convert encrypted string to Uint8Array
  const encryptedData = Uint8Array.from(
    atob(encryptedString),
    (c) => c.charCodeAt(0),
  );

  // Convert the IV to Uint8Array
  const ivBuffer = new Uint8Array(iv);

  // Decrypt the data
  const decryptedData = await _internals.decrypt(ivBuffer, key, encryptedData);

  // Return the decrypted data as a string
  return new TextDecoder().decode(decryptedData);
}

export const _internals = {
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
  deriveKey: async (saltBuffer: ArrayBuffer, keyMaterial: CryptoKey) => {
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    return key;
  },
  decrypt: async (
    ivBuffer: ArrayBuffer,
    key: CryptoKey,
    encryptedData: ArrayBuffer,
  ) => {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      key,
      encryptedData,
    );
    return decryptedData;
  },
};
