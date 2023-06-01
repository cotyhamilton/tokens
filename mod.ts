import { decryptDataWithKey, decryptDataWithPassword } from "./decrypt.ts";
import { encryptDataWithKey, encryptDataWithPassword } from "./encrypt.ts";
import {
  createKey,
  exportKeyAsEncodedString,
  importKeyFromEncodedString,
} from "./key.ts";
import type {
  EncryptedWithKeyData,
  EncryptedWithPasswordData,
} from "./interfaces.ts";

const kv = await Deno.openKv();

// get or create key
const { value: keyData } = await kv.get<EncryptedWithPasswordData>(["key"]);
let key: CryptoKey;

if (keyData) {
  const password = prompt("Enter the password:");

  if (password) {
    // Decrypt saved key using password
    const decryptedKeyString = await decryptDataWithPassword(
      password,
      keyData.encryptedString,
      keyData.salt,
      keyData.iv,
    );
    // Import key
    key = await importKeyFromEncodedString(decryptedKeyString);
  } else {
    kv.close();
    Deno.exit(1);
  }
} else {
  // Get password from user to encrypt key
  const password = prompt("Enter a password for encryption:");

  if (password) {
    // Create key
    key = await createKey();
    // Encode key
    const encodedKey = await exportKeyAsEncodedString(key);
    // Encrypt key
    const encryptedKey = await encryptDataWithPassword(password, encodedKey);
    // Save key in database
    kv.set(["key"], encryptedKey);
  } else {
    kv.close();
    Deno.exit(1);
  }
}

switch (Deno.args[0]) {
  case "add": {
    // Check for existing token to prevent accidental override
    const entry = await kv.get<EncryptedWithKeyData>(["tokens", Deno.args[1]]);
    if (entry.value) {
      console.log("Token exists for " + Deno.args[1] + ", use update command");
    } else {
      // Encrypt data using key
      const encryptedData = await encryptDataWithKey(key, Deno.args[2]);
      // Save data
      kv.set(["tokens", Deno.args[1]], encryptedData);
    }
    break;
  }
  case "update": {
    // Check for existing token
    const entry = await kv.get<EncryptedWithKeyData>(["tokens", Deno.args[1]]);
    if (entry.value) {
      // Encrypt data using key
      const encryptedData = await encryptDataWithKey(key, Deno.args[2]);
      // Save data
      kv.set(["tokens", Deno.args[1]], encryptedData);
    } else {
      console.log("Token not found for " + Deno.args[1]);
    }
    break;
  }
  case "delete": {
    kv.delete(["tokens", Deno.args[1]]);
    break;
  }
  case "list": {
    // Print names of token entries
    for await (const entry of kv.list({ prefix: ["tokens"] })) {
      console.log(entry.key[1]);
    }
    break;
  }
  default: {
    // Get token
    const { value: data } = await kv.get<EncryptedWithKeyData>([
      "tokens",
      Deno.args[0],
    ]);
    if (data) {
      const decryptedData = await decryptDataWithKey(
        key,
        data.encryptedString,
        data.iv,
      );
      console.log(decryptedData);
    }
    break;
  }
}

kv.close();
