---
sidebar_position: 14
description: Secret is an input whose value is encrypted and is never saved in Port's Databases.
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Secret

Secret is an input whose value is encrypted and is never saved by Port (not even after the encryption).

## 💡 Common Secret Usage

The secret input type can be used for sensitive information, such as:

- Cloud secrets;
- Passwords;
- etc.

## Secret Input Structure

A secret input is defined as regular input, but with the additional `encryption` field which specifies the encryption algorithm to use:

```json showLineNumbers
{
  "mySecretInput": {
    "title": "My secret input",
    "icon": "My icon",
    "type": "string",
    // highlight-start
    "encryption": "fernet",
    // highlight-end
    "description": "My entity input"
  }
}
```

### Supported Ecnryption Algortithms

[fernet](https://cryptography.io/en/latest/fernet/) - Your organization's [Client Secret](../../../build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials) will be used as the encryption key.

### Supported Types

[string](./text.md) - For `"type": "string"` properties the inputted value will be taken as is and encrypted. It is not supported to have both an `encryption` for a string input and `format`.

[object](./object.md) - For `"type": "object"` properties the inputted Json value will be treated as a string and encrypted without further manipulation.

## Handling the Payload

The payload sent to your infrastructure will have the secret property's value will be encrypted.
In most cases you will need to decrypt it before you could use it.

### Example Invokees

<details>
<summary> Python Webhook </summary>

These examples use the `flask` and `cryptography` packages.

<Tabs groupId="python-webhook" queryString defaultValue="string" values={[
{label: "String Secret", value: "string"},
{label: "Object Secret", value: "object"}
]}>

<TabItem value="string">

```python showLineNumbers
import base64
import json
import os

from flask import Flask, request
from cryptography.fernet import Fernet


PORT_CLIENT_SECRET = 'YOUR PORT CLIENT SECRET'

app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    # initialize the fernet decrypter
    key = base64.urlsafe_b64encode(PORT_CLIENT_SECRET.encode())
    fernet_instance = Fernet(key)

    req = request.get_json(silent=True, force=True)
    encrypted_property_value = req.get('payload').get('properties').get('secret-property')

    # decrypt the property
    decrypted_property_value = fernet_instance.decrypt(encrypted_property_value)

    return decrypted_property_value # this is the original value the user sent

if __name__ == '__main__':
    port = int(os.getenv('PORT', 80))

    print ("Starting app on port %d" % port)

    app.run(debug=False, port=port, host='0.0.0.0')
```

</TabItem>
<TabItem value="object">

```python showLineNumbers
import base64
import json
import os

from flask import Flask, request
from cryptography.fernet import Fernet


PORT_CLIENT_SECRET = 'YOUR PORT CLIENT SECRET'

app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    # initialize the fernet decrypter
    key = base64.urlsafe_b64encode(PORT_CLIENT_SECRET.encode())
    fernet_instance = Fernet(key)

    req = request.get_json(silent=True, force=True)
    encrypted_property_value = req.get('payload').get('properties').get('secret-property')

    # decrypt the property
    decrypted_property_value = fernet_instance.decrypt(encrypted_property_value)
    dict_property_value = json.loads(decrypted_property_value)


    return dict_property_value # this is the original value the user sent

if __name__ == '__main__':
    port = int(os.getenv('PORT', 80))

    print ("Starting app on port %d" % port)

    app.run(debug=False, port=port, host='0.0.0.0')
```

</TabItem>
</Tabs>

</details>

<details>
<summary> NodeJs Webhook </summary>

These examples use the `express` and `fernet` packages.

<Tabs groupId="node-webhook" queryString defaultValue="string" values={[
{label: "String Secret", value: "string"},
{label: "Object Secret", value: "object"}
]}>

<TabItem value="string">

```js showLineNumbers
const express = require("express");
const bodyParser = require("body-parser");
const fernet = require("fernet");
const port = 80;

const app = express();

const PORT_CLIENT_SECRET = "YOUR PORT CLIENT SECRET";

app.post("/", bodyParser.json(), (req, res) => {
  // initialize the fernet decrypter
  const encodedSecret = Buffer.from(PORT_CLIENT_SECRET).toString("base64");
  const fernetSecret = new fernet.Secret(encodedSecret);
  const fernetToken = new fernet.Token({
    secret: fernetSecret,
    ttl: 0,
  });

  encrypted_property_value = req.body.payload.properties["secret-property"];

  // decrypt the property
  decrypted_property_value = fernetToken.decode(encrypted_property_value);

  return decrypted_property_value; // this is the original value the user sent
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

</TabItem>
<TabItem value="object">

```js showLineNumbers
const express = require("express");
const bodyParser = require("body-parser");
const fernet = require("fernet");
const port = 80;

const app = express();

const PORT_CLIENT_SECRET = "YOUR PORT CLIENT SECRET";

app.post("/", bodyParser.json(), (req, res) => {
  // initialize the fernet decrypter
  const encodedSecret = Buffer.from(PORT_CLIENT_SECRET).toString("base64");
  const fernetSecret = new fernet.Secret(encodedSecret);
  const fernetToken = new fernet.Token({
    secret: fernetSecret,
    ttl: 0,
  });

  encrypted_property_value = req.body.payload.properties["secret-property"];

  // decrypt the property
  decrypted_property_value = fernetToken.decode(encrypted_property_value);
  object_property_value = JSON.parse(decrypted_property_value);

  return object_property_value; // this is the original value the user sent
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

</TabItem>
</Tabs>

</details>
