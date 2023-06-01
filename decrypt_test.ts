import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { decryptDataWithPassword } from "./decrypt.ts";

Deno.test("decrypt with correct password", async () => {
  const data = await decryptDataWithPassword(
    "password",
    encryptedWithPasswordData.encryptedString,
    encryptedWithPasswordData.salt,
    encryptedWithPasswordData.iv,
  );

  assertEquals(data, "testing data");
});

// unencrypted data equals "testing data"
const encryptedWithPasswordData = {
  encryptedString: "heJpYjtar8bQ/RZ7ZWxONRGG82hOXQriPo7QHw==",
  salt: [
    51,
    96,
    194,
    166,
    122,
    150,
    100,
    124,
    65,
    207,
    185,
    245,
    69,
    110,
    251,
    69,
  ],
  iv: [
    188,
    245,
    248,
    199,
    139,
    212,
    252,
    118,
    172,
    158,
    75,
    65,
  ],
};
