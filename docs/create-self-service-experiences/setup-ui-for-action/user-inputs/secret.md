---
sidebar_position: 7
description: Secret is an input whose value is encrypted with your client secret when sent to your backend and is never saved or logged in its transit.
sidebar_class_name: "custom-sidebar-item sidebar-property-secret"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Secret

Secret input is an input type used to pass secrets and sensitive information to action backends, the values sent via the secret input go through an additional layer of encryption using your private key. In addition, the values sent via the secret input are not logged or saved by Port.

## 💡 Common Secret Usage

The secret input type can be used for sensitive information, such as:

- Cloud secrets
- Passwords
- API keys
- Secret tokens

## Secret Input Structure

A secret input is defined as a regular input, but with the additional `encryption` field which specifies the encryption algorithm to use:

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "string",
    // highlight-start
    "encryption": "aes256-gcm",
    // highlight-end
    "description": "My entity input"
  }
}
```

- [aes256-gcm](https://www.nist.gov/publications/advanced-encryption-standard-aes) - This will encrypt the property data using 256 bits AES in [GCM mode](https://csrc.nist.gov/glossary/term/aes_gcm). The encrypted value will be prefixed by the 16 bits IV and suffixed by the 16 bits MAC, encoded to base-64. The encryption key will be the first 32 bytes of your organization's [Client Secret](../../../build-your-software-catalog/custom-integration/api/#find-your-port-credentials).

### Supported Types

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
    // highlight-start
    "type": "string",
    // highlight-end
    "encryption": "aes256-gcm",
    "description": "My entity input"
  }
}
```

**Note:** it is unsupported to have the a `format` for secrets inputs.

</TabItem>
<TabItem value="object">

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    // highlight-start
    "type": "object",
    // highlight-end
    "encryption": "aes256-gcm",
    "description": "My entity input"
  }
}
```

</TabItem>
</Tabs>

## Handling the Payload

The payload sent to your infrastructure will contain the encrypted value of your secret property inputs. To make use of your secret inputs, you will need to decrypt them:

### Examples

<Tabs groupId="algorithm" queryString defaultValue="aes256-gcm" values={[
{label: "AES 256 GCM", value: "aes256-gcm"},
]}>

<TabItem value="aes256-gcm">

Examples for decrypting properties encrypted with the `aes256-gcm` algorithm.

<Tabs groupId="language" queryString defaultValue="aes256-gcm-python" values={[
{label: "Python Webhook", value: "aes256-gcm-python"},
{label: "NodeJs Webhook", value: "aes256-gcm-nodeJs"}
]}>

<TabItem value="aes256-gcm-python">

The following example uses the `flask` and `pycryptodome` packages:

```python showLineNumbersimport base64
import base64
import json
import os

from flask import Flask, request
from Crypto.Cipher import AES

PORT_CLIENT_SECRET = 'YOUR PORT CLIENT SECRET'
PROPERY_IS_JSON = False # whether the property is defined as json or not (string otherwise)

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
    property_value = json.loads(decrypted_property_value) if PROPERY_IS_JSON else decrypted_property_value

    return property_value # this is the original value the user sent

if __name__ == '__main__':
    port = int(os.getenv('PORT', 80))

    print("Starting app on port %d" % port)

    app.run(debug=False, port=port, host='0.0.0.0')
```

</TabItem>
<TabItem value="aes256-gcm-nodeJs">

The following example uses the `express` package and node's built-in crypto module:

```js showLineNumbers
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("node:crypto");

const PORT_CLIENT_SECRET = "YOUR PORT CLIENT SECRET";
const PROPERY_IS_JSON = false; // whether the property is defined as json or not (string otherwise)

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
  const property_value = PROPERY_IS_JSON
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
</Tabs>
