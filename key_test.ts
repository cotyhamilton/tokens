import {
  createKey,
  exportKeyAsEncodedString,
  importKeyFromEncodedString,
} from "./key.ts";

Deno.test("key functions don't error", async () => {
  const key = await createKey();
  const encodedKey = await exportKeyAsEncodedString(key);
  await importKeyFromEncodedString(encodedKey);
});
