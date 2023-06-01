import * as mock from "https://deno.land/std@0.190.0/testing/mock.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  _internals,
  encryptDataWithKey,
  encryptDataWithPassword,
} from "./encrypt.ts";
import {
  EncryptedWithKeyData,
  EncryptedWithPasswordData,
} from "./interfaces.ts";

Deno.test("encrypt with password", async () => {
  const getRandomValuesStub = mock.stub(
    _internals,
    "getRandomValues",
    mock.returnsNext([new Uint8Array([0]), new Uint8Array([1])]),
  );
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
  const encryptStub = mock.stub(
    _internals,
    "encrypt",
    mock.returnsNext([Promise.resolve(new TextEncoder().encode("test data"))]),
  );

  let data: EncryptedWithPasswordData;

  try {
    data = await encryptDataWithPassword("password", "test data");
  } finally {
    getRandomValuesStub.restore();
    importKeyStub.restore();
    deriveKeyStub.restore();
    encryptStub.restore();
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

  mock.assertSpyCall(encryptStub, 0, {
    args: [
      new Uint8Array([1]),
      "derivedKey" as unknown as CryptoKey,
      new TextEncoder().encode("test data"),
    ],
  });

  assertEquals(
    data.encryptedString,
    btoa(
      String.fromCharCode(
        ...new Uint8Array(new TextEncoder().encode("test data")),
      ),
    ),
  );
});

Deno.test("encrypt with key doesn't error", async () => {
  const getRandomValuesStub = mock.stub(
    _internals,
    "getRandomValues",
    mock.returnsNext([new Uint8Array([0])]),
  );
  const encryptStub = mock.stub(
    _internals,
    "encrypt",
    mock.returnsNext([Promise.resolve(new TextEncoder().encode("test data"))]),
  );

  let data: EncryptedWithKeyData;

  try {
    data = await encryptDataWithKey("key" as unknown as CryptoKey, "test data");
  } finally {
    getRandomValuesStub.restore();
    encryptStub.restore();
  }

  mock.assertSpyCall(encryptStub, 0, {
    args: [
      new Uint8Array([0]),
      "key" as unknown as CryptoKey,
      new TextEncoder().encode("test data"),
    ],
  });

  assertEquals(
    data.encryptedString,
    btoa(
      String.fromCharCode(
        ...new Uint8Array(new TextEncoder().encode("test data")),
      ),
    ),
  );
});
