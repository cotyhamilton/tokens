export async function createKey() {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
  return key;
}

export async function importKeyFromEncodedString(encodedKey: string) {
  // Convert encoded key to Uint8Array
  const rawKey = Uint8Array.from(
    atob(encodedKey),
    (c) => c.charCodeAt(0),
  );
  // Import key
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
  return key;
}

export async function exportKeyAsEncodedString(key: CryptoKey) {
  // Export key
  const rawKey = await crypto.subtle.exportKey("raw", key);
  // Encode key as string
  const encodedKey = btoa(
    String.fromCharCode(...new Uint8Array(rawKey)),
  );
  return encodedKey;
}
