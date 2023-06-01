import { encryptDataWithKey, encryptDataWithPassword } from "./encrypt.ts";
import { createKey } from "./key.ts";

Deno.test("encrypt with password doesn't error", async () => {
  await encryptDataWithPassword("password", "testing data");
});

Deno.test("encrypt with key doesn't error", async () => {
  await encryptDataWithKey(await createKey(), "testing data");
});
