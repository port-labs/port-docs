---
sidebar_position: 14
description: Secret is an input whose value is encrypted with your client secret when sent to your backend and is never saved or logged in its transit.
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Secret

Secret input is an input type used to pass secrets and sensitive information to action backends, the values sent via the secret input go through an additional layer of encryption using your private key. In addition, the values sent via the secret input are not logged or saved by Port.

## 💡 Common Secret Usage

The secret input type can be used for sensitive information, such as:

- Cloud secrets;
- Passwords;
- API keys;
- Secret tokens
- etc.

## Secret Input Structure

A secret input is defined as a regular input, but with the additional `encryption` field which specifies the encryption algorithm to use:

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

- [fernet](https://cryptography.io/en/latest/fernet/) - when using Fernet for symmetric encryption the encryption key will be the first 32 bytes of your organization's [Client Secret](../../../build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

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
    "encryption": "fernet",
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
    "encryption": "fernet",
    "description": "My entity input"
  }
}
```

</TabItem>
</Tabs>

## Handling the Payload

The payload sent to your infrastructure will contain the encrypted value of your secret property inputs. To make use of your secret inputs, you will need to decrypt them:

### Examples

<Tabs groupId="examples" queryString defaultValue="python" values={[
{label: "Python Webhook", value: "python"},
{label: "NodeJs Webhook", value: "nodeJs"}
]}>

<TabItem value="python">

The following examples use the `flask` and `cryptography` packages:

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
    key = base64.urlsafe_b64encode(PORT_CLIENT_SECRET[:32].encode())
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
    key = base64.urlsafe_b64encode(PORT_CLIENT_SECRET[:32].encode())
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

</TabItem>
<TabItem value="nodeJs">

The following examples use the `express` and `fernet` packages:

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
  const encodedSecret = Buffer.from(
    PORT_CLIENT_SECRET.substring(0, 32)
  ).toString("base64");
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
  const encodedSecret = Buffer.from(
    PORT_CLIENT_SECRET.substring(0, 32)
  ).toString("base64");
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

</TabItem>
</Tabs>
