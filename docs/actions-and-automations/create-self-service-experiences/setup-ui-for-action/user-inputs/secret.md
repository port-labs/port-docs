---
sidebar_position: 7
description: A secret input encrypts its value before sending it to your backend and never stores or logs it. Choose Port-managed encryption or your own public key.
sidebar_class_name: "custom-sidebar-item sidebar-property-secret"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Secret

Use secret inputs to pass sensitive data to action backends. An extra processing layer encrypts the values, ensuring Port never logs or stores them.

Port offers two encryption options:

- **Port-managed encryption** - Uses your organization's client secret as the encryption key.
- **Client-side encryption** - Gives you full control over key management by using your own RSA key pair.

## Common secret usage

The secret input type can be used for sensitive information, such as:

- Cloud secrets
- Passwords
- API keys
- Secret tokens
- SSL/TLS certificates
- Private keys

## Secret input structure

A secret input is defined as a regular input with the additional `encryption` field that specifies the encryption method.

### Encryption options

<Tabs groupId="encryption-type" queryString defaultValue="port-managed" values={[
{label: "Port-managed encryption", value: "port-managed"},
{label: "Client-side encryption", value: "client-key"}
]}>

<TabItem value="port-managed">

Port-managed encryption uses the [AES-256-GCM](https://www.nist.gov/publications/advanced-encryption-standard-aes) algorithm with your organization's client secret as the encryption key.

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "string",
    // highlight-start
    "encryption": "aes256-gcm",
    // highlight-end
    "description": "My secret input"
  }
}
```

The encrypted value is formatted as: `[IV (16 bytes)][ciphertext][MAC (16 bytes)]`, encoded in base64. The encryption key is the first 32 bytes of your organization's [client secret](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).

</TabItem>

<TabItem value="client-key">

Client-side encryption gives you full control over key management by allowing you to use your own RSA key pair. This is ideal for organizations that prefer to manage their own encryption keys.

:::info API execution guardrails
You can provide secret input values through the API, but Port includes guardrails to prevent doing so unintentionally in plaintext. If you need API execution for an action with a client-side encryption secret input, contact [Port support](https://www.getport.io/community).
:::

#### Example configuration

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "string",
    // highlight-start
    "encryption": {
      "algorithm": "client-side",
      "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
    },
    // highlight-end
    "description": "My secret input"
  }
}
```

#### How it works

Client-side encryption uses a hybrid approach that combines RSA and AES encryption:

1. A random AES-256 key is generated in the browser
2. Your data is encrypted using AES-256-GCM with this random key
3. The AES key is then encrypted (wrapped) using your RSA public key with OAEP padding and SHA-256

This approach allows encrypting data of any size while leveraging the security benefits of asymmetric encryption.

#### Payload format

The encrypted payload is base64-encoded with the following structure:

| Component | Size | Description |
|-----------|------|-------------|
| IV | 12 bytes | Initialization vector for AES-GCM |
| Wrapped key | 256 bytes | The AES key encrypted with your RSA public key |
| Ciphertext | Variable | Your data encrypted with AES-256-GCM (includes 16-byte auth tag) |

#### Key requirements

- **Algorithm**: RSA with OAEP padding and SHA-256 hash
- **Key size**: 2048-bit RSA key (minimum recommended)
- **Format**: PEM-encoded public key with `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` markers

:::tip When to use client-side encryption
Use client-side encryption when you need complete control over key management, or when you want to ensure that only your backend (which holds the private key) can decrypt the values.
:::

</TabItem>
</Tabs>

### Supported types

Secret inputs support both `string` and `object` types. You can use either encryption method with both types.

<Tabs groupId="supported-types" queryString defaultValue="string" values={[
{label: "String Secret", value: "string"},
{label: "Object Secret", value: "object"}
]}>
<TabItem value="string">

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "string",
    "encryption": "aes256-gcm",
    "description": "My secret input"
  }
}
```

</TabItem>
<TabItem value="object">

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "object",
    "encryption": "aes256-gcm",
    "description": "My secret input"
  }
}
```

</TabItem>
</Tabs>

## Multi-line secret inputs

For sensitive information that contains line breaks, such as SSL/TLS certificates, private keys, or configuration files, you can combine the multi-line text format with encryption.

Multi-line secret inputs provide a larger text area for input and support both encryption methods. You can decrypt them using the same methods shown in the [handling the payload](#handling-the-payload) section.

This is particularly useful when you need to send certificates to your backend workflows. For example, when configuring SSL certificates for cloud resources or setting up authentication with certificate-based credentials.

:::info Multiline secrets are not masked
Unlike single-line secret inputs which are masked with asterisks, multi-line secret inputs display the actual text as you type. The value is still encrypted when sent to your backend and is never logged or saved by Port.
:::

```json showLineNumbers
{
  "certificateInput": {
    "title": "SSL certificate",
    "icon": "Lock",
    "type": "string",
    // highlight-start
    "format": "multi-line",
    "encryption": "aes256-gcm",
    // highlight-end
    "description": "Paste your SSL certificate"
  }
}
```

This configuration creates a multi-line text area where users can paste certificates or other multiline secrets. The value will be encrypted before being sent to your backend.

### Common use cases

Multi-line secret inputs are ideal for:

- SSL/TLS certificates and certificate chains.
- Private keys (RSA, EC, etc.).
- JSON or YAML configuration files containing secrets.
- Multi-line API keys or tokens.
- SSH keys.

## Handling the payload

The payload sent to your infrastructure will contain the encrypted value of your secret property inputs. To make use of your secret inputs, you will need to decrypt them.

### Examples

<Tabs groupId="algorithm" queryString defaultValue="aes256-gcm" values={[
{label: "Port-managed (AES-256-GCM)", value: "aes256-gcm"},
{label: "Client-side (RSA-OAEP-SHA256 + AES-256-GCM)", value: "client-side"},
]}>

<TabItem value="aes256-gcm">

Examples for decrypting properties encrypted with Port-managed `aes256-gcm` encryption.

<Tabs groupId="language" queryString defaultValue="aes256-gcm-python" values={[
{label: "Python Webhook", value: "aes256-gcm-python"},
{label: "Node.js Webhook", value: "aes256-gcm-node-js"}
]}>

<TabItem value="aes256-gcm-python">

The following example uses the `flask` and `pycryptodome` packages:

```python showLineNumbers
import base64
import json
import os

from flask import Flask, request
from Crypto.Cipher import AES

PORT_CLIENT_SECRET = 'YOUR PORT CLIENT SECRET'
PROPERTY_IS_JSON = False # whether the property is defined as json or not (string otherwise)

app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    # initialize the aes cipher
    key = PORT_CLIENT_SECRET[:32].encode()

    req = request.get_json(silent=True, force=True)
    encrypted_property_value = base64.b64decode(req.get('payload').get('properties').get('secret-property'))

    iv = encrypted_property_value[:16]
    ciphertext = encrypted_property_value[16:-16]
    mac = encrypted_property_value[-16:]

    cipher = AES.new(key, AES.MODE_GCM, iv)

    # decrypt the property
    decrypted_property_value = cipher.decrypt_and_verify(ciphertext, mac)
    property_value = json.loads(decrypted_property_value) if PROPERTY_IS_JSON else decrypted_property_value

    return property_value # this is the original value the user sent

if __name__ == '__main__':
    port = int(os.getenv('PORT', 80))

    print("Starting app on port %d" % port)

    app.run(debug=False, port=port, host='0.0.0.0')
```

</TabItem>
<TabItem value="aes256-gcm-node-js">

The following example uses the `express` package and node's built-in crypto module:

```js showLineNumbers
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("node:crypto");

const PORT_CLIENT_SECRET = "YOUR PORT CLIENT SECRET";
const PROPERTY_IS_JSON = false; // whether the property is defined as json or not (string otherwise)

const port = 80;

const ENCODING = "utf8";
const ALGORITHM_NAME = "aes-256-gcm";
const ALGORITHM_IV_SIZE = 16;
const ALGORITHM_TAG_SIZE = 16;

const app = express();

app.post("/", bodyParser.json(), (req, res) => {
  // deconstruct the property
  const raw_property_value = req.body.payload.properties["secret-property"];
  const property_value_buffer = Buffer.from(raw_property_value, "base64");

  const iv = property_value_buffer.subarray(0, ALGORITHM_IV_SIZE);
  const data = property_value_buffer.subarray(
    ALGORITHM_IV_SIZE,
    property_value_buffer.length - ALGORITHM_TAG_SIZE
  );
  const authTag = property_value_buffer.subarray(
    property_value_buffer.length - ALGORITHM_TAG_SIZE
  );

  // initialize the aes decipher
  const encodedSecret = Buffer.from(PORT_CLIENT_SECRET.substring(0, 32));
  const decipher = crypto.createDecipheriv(ALGORITHM_NAME, encodedSecret, iv);
  decipher.setAuthTag(authTag);

  // decrypt the property
  const decrypted_property_buffer = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);

  // encode the value
  const decrypted_property_value = decrypted_property_buffer.toString(ENCODING);
  const property_value = PROPERTY_IS_JSON
    ? JSON.parse(decrypted_property_value)
    : decrypted_property_value;

  return property_value; // this is the original value the user sent
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

</TabItem>
</Tabs>

</TabItem>

<TabItem value="client-side">

Examples for decrypting properties encrypted with `client-side` hybrid encryption.

The decryption process involves two steps:

1. Decrypt (unwrap) the AES key using your RSA private key.
2. Decrypt the data using the unwrapped AES key.

<Tabs groupId="language" queryString defaultValue="client-side-python" values={[
{label: "Python Webhook", value: "client-side-python"},
{label: "Node.js Webhook", value: "client-side-node-js"}
]}>

<TabItem value="client-side-python">

The following example uses the `flask` and `pycryptodome` packages:

```python showLineNumbers
import os
import json
from base64 import b64decode

from flask import Flask, request, jsonify
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Hash import SHA256

# Config
PROPERTY_KEY = "secret-property"
PROPERTY_IS_JSON = False

PORT = int(os.getenv("PORT", "80"))

IV_LENGTH = 12          # AES-GCM recommended IV size
GCM_TAG_LENGTH = 16     # GCM auth tag length

# Load RSA private key + derive wrapped AES key length (bytes)
with open("private.pem", "rb") as f:
    PRIVATE_KEY = RSA.import_key(f.read())
RSA_KEY_BYTES = PRIVATE_KEY.size_in_bytes()  # modulus length in bytes

app = Flask(__name__)

def decrypt(encrypted_base64: str) -> str:
    if not isinstance(encrypted_base64, str) or not encrypted_base64:
        raise ValueError(f"Missing '{PROPERTY_KEY}'")

    payload = b64decode(encrypted_base64)

    min_len = IV_LENGTH + RSA_KEY_BYTES + GCM_TAG_LENGTH + 1
    if len(payload) < min_len:
        raise ValueError(f"Encrypted payload too short (min {min_len} bytes)")

    iv = payload[:IV_LENGTH]
    encrypted_aes_key = payload[IV_LENGTH : IV_LENGTH + RSA_KEY_BYTES]
    ciphertext = payload[IV_LENGTH + RSA_KEY_BYTES :]

    if len(ciphertext) <= GCM_TAG_LENGTH:
        raise ValueError("Ciphertext too short")

    encrypted_data = ciphertext[:-GCM_TAG_LENGTH]
    auth_tag = ciphertext[-GCM_TAG_LENGTH:]

    # RSA-OAEP unwrap AES key (SHA-256)
    oaep = PKCS1_OAEP.new(PRIVATE_KEY, hashAlgo=SHA256)
    aes_key = oaep.decrypt(encrypted_aes_key)

    # AES-256-GCM decrypt
    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=iv)
    plaintext = cipher.decrypt_and_verify(encrypted_data, auth_tag)

    return plaintext.decode("utf-8")

def parse_maybe_json(value: str, is_json: bool):
    try:
        return json.loads(value) if is_json else value
    except Exception:
        raise ValueError("Decrypted value is not valid JSON")

@app.post("/")
def handler():
    try:
        body = request.get_json(silent=True) or {}
        decrypted_str = decrypt(body.get(PROPERTY_KEY))
        value = parse_maybe_json(decrypted_str, PROPERTY_IS_JSON)
        return jsonify(value=value)
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
```

</TabItem>
<TabItem value="client-side-node-js">

The following example uses the `fastify` package and node's built-in `crypto` module:

```js showLineNumbers
"use strict";

const fastify = require("fastify")({ logger: true });
const crypto = require("node:crypto");
const fs = require("node:fs")

const privateKeyPem = fs.readFileSync("private.pem", "utf8");

const PROPERTY_KEY = "secret-property";
const PROPERTY_IS_JSON = false;

const PORT = Number(process.env.PORT || 80);

// Hybrid encryption constants
const IV_LENGTH = 12; // AES-GCM recommended IV size
const GCM_TAG_LENGTH = 16;

function decrypt(encryptedBase64) {
	const payload = Buffer.from(encryptedBase64, "base64");

	// Determine RSA key size to know encrypted AES key length
	const privateKey = crypto.createPrivateKey(privateKeyPem);
	const keyDetails = privateKey.asymmetricKeyDetails;
	const rsaKeyBytes = keyDetails.modulusLength / 8; // e.g., 2048 bits = 256 bytes

	const iv = payload.subarray(0, IV_LENGTH);
	const encryptedAesKey = payload.subarray(IV_LENGTH, IV_LENGTH + rsaKeyBytes);
	const ciphertext = payload.subarray(IV_LENGTH + rsaKeyBytes);

	// Decrypt AES key using RSA-OAEP
	const aesKey = crypto.privateDecrypt(
		{
			key: privateKey,
			oaepHash: "sha256",
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		},
		encryptedAesKey,
	);

	// Decrypt ciphertext using AES-256-GCM
	const encryptedData = ciphertext.subarray(0, ciphertext.length - GCM_TAG_LENGTH);
	const authTag = ciphertext.subarray(ciphertext.length - GCM_TAG_LENGTH);

	const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

	return decrypted.toString("utf8");
}

function parseMaybeJson(value, isJson) {
  try {
    return isJson ? JSON.parse(value) : value;
  } catch {
    throw new Error("Decrypted value is not valid JSON");
  }
}

fastify.post(
  "/",
  async (request, reply) => {
    try {
      const decryptedStr = decrypt(request.body?.[PROPERTY_KEY]).toString("utf8");

      const value = parseMaybeJson(decryptedStr, PROPERTY_IS_JSON);

      // Return the original value the user sent (decrypted)
      return reply.send({ value });
    } catch (err) {
      request.log.error({ err }, "Failed to decrypt secret input");
      return reply.code(400).send({ error: err.message });
    }
  }
);

fastify.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
```

</TabItem>
</Tabs>

#### Generating an RSA key pair

To use client-side encryption, you need to generate an RSA key pair. Here's how to generate one using OpenSSL:

```bash
# Generate a 2048-bit RSA private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Extract the public key from the private key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

Use the contents of `public_key.pem` in your action's user input configuration. Keep `private_key.pem` secure in your backend for decryption.

:::warning Keep your private key secure
The private key should never be shared or exposed. Store it securely in your backend infrastructure, such as in a secrets manager.
:::

</TabItem>
</Tabs>
