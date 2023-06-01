import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { encryptDataWithKey, encryptDataWithPassword } from "./encrypt.ts";
import { decryptDataWithKey, decryptDataWithPassword } from "./decrypt.ts";
import { createKey } from "./key.ts";

Deno.test("encrypt and decrypt with password", async () => {
  const encryptedData = await encryptDataWithPassword("password", "test data");
  const data = await decryptDataWithPassword(
    "password",
    encryptedData.encryptedString,
    encryptedData.salt,
    encryptedData.iv,
  );

  assertEquals(data, "test data");
});

Deno.test("encrypt and decrypt with key", async () => {
  const key = await createKey();
  const encryptedData = await encryptDataWithKey(key, "test data");
  const data = await decryptDataWithKey(
    key,
    encryptedData.encryptedString,
    encryptedData.iv,
  );

  assertEquals(data, "test data");
});
