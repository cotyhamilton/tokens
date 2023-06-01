import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import * as mock from "https://deno.land/std@0.190.0/testing/mock.ts";
import {
  _internals,
  decryptDataWithKey,
  decryptDataWithPassword,
} from "./decrypt.ts";

Deno.test("decrypt with password", async () => {
  const importKeyStub = mock.stub(
    _internals,
    "importKey",
    mock.returnsNext([Promise.resolve("importedKey" as unknown as CryptoKey)]),
  );
  const deriveKeyStub = mock.stub(
    _internals,
    "deriveKey",
    mock.returnsNext([Promise.resolve("derivedKey" as unknown as CryptoKey)]),
  );
  const decryptStub = mock.stub(
    _internals,
    "decrypt",
    mock.returnsNext([Promise.resolve(new TextEncoder().encode("password"))]),
  );

  let data: string;

  try {
    data = await decryptDataWithPassword(
      "password",
      "string",
      [0],
      [1],
    );
  } finally {
    importKeyStub.restore();
    deriveKeyStub.restore();
    decryptStub.restore();
  }

  mock.assertSpyCall(importKeyStub, 0, {
    args: [new TextEncoder().encode("password")],
  });

  mock.assertSpyCall(deriveKeyStub, 0, {
    args: [
      new Uint8Array([0]),
      "importedKey" as unknown as CryptoKey,
    ],
  });

  mock.assertSpyCall(decryptStub, 0, {
    args: [
      new Uint8Array([1]),
      "derivedKey" as unknown as CryptoKey,
      Uint8Array.from(
        atob("string"),
        (c) => c.charCodeAt(0),
      ),
    ],
  });

  assertEquals(data, "password");
});

Deno.test("decrypt with key", async () => {
  const decryptStub = mock.stub(
    _internals,
    "decrypt",
    mock.returnsNext([Promise.resolve(new TextEncoder().encode("password"))]),
  );

  let data: string;

  try {
    data = await decryptDataWithKey(
      "key" as unknown as CryptoKey,
      "string",
      [0],
    );
  } finally {
    decryptStub.restore();
  }

  mock.assertSpyCall(decryptStub, 0, {
    args: [
      new Uint8Array([0]),
      "key" as unknown as CryptoKey,
      Uint8Array.from(
        atob("string"),
        (c) => c.charCodeAt(0),
      ),
    ],
  });

  assertEquals(data, "password");
});
