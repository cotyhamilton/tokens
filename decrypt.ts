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
  const importedSalt = new Uint8Array(salt);
  const importedIV = new Uint8Array(iv);

  // Derive the key from the password using PBKDF2
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
      salt: importedSalt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: importedIV,
    },
    key,
    encryptedData,
  );

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
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encryptedData,
  );

  // Return the decrypted data as a string
  return new TextDecoder().decode(decryptedData);
}
