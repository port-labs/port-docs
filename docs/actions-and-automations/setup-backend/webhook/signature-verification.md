---
sidebar_position: 5
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Validating Webhook signatures

In this guide, we will show how to validate that a message your webhook has received was sent by Port.

## Signature verification security benefits

When exposing an HTTP server on the internet, anyone with the URL can send a web request to it.

Unwanted triggers of your webhook could have adverse effects such as:

- Excessive usage costs due to a high volume of unnecessary triggers;
- Executing an action that gives an attacker access to your environment, or that changes your infrastructure or causes downtime;
- And more.

Verifying the webhook request using the request headers provides the following benefits:

- Ensures that the request payload has not been tampered with
- Ensures that the sender of the message is Port
- Ensures that the received message is not a replay of an older message

## Custom headers

Each webhook request includes the following custom headers provided by Port:

- `x-port-timestamp` - timestamp in [seconds since epoch](https://en.wikipedia.org/wiki/Epoch)
- `x-port-signature` - the [Base64](https://en.wikipedia.org/wiki/Base64) encoded signature

## Signature structure

The webhook signature takes the `timestamp` the message was generated in and the request `payload` and concatenates them using a dot (`.`):

```js
const signatureContent = `${timestamp}.${payload}`;
```

Port takes the content that needs to be signed, hashes it using `HMAC-SHA-256` and then encodes it in `Base64`. Then Port takes the output and adds the version as a prefix with a comma (`,`) for example the `x-port-signature` header should look like this: `v1,2ehMaSsW+OTSDFERA/SmIKSSySlE3uaJELVlNIOLJ1OE=`

## Timestamp verification

As mentioned above, Port also sends the timestamp for the webhook request in the `x-port-timestamp` header. To prevent replay attacks you can compare the value of the timestamp with the timestamp of your systems and verify that the difference is within your allowed tolerance.

## Code examples

Here are some examples showing how to verify a webhook request signature using the request headers:

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "javascript"}
]}>

<TabItem value="python">

```python showLineNumbers
import base64
import hashlib
import hmac
import json

body = await request.body()
port_signature = request.headers.get('x-port-signature')
port_timestamp = request.headers.get('x-port-timestamp')

data = body if isinstance(body, str) else body.decode()

to_sign = f"{port_timestamp}.{data}".encode()
signature = hmac.new(settings.PORT_CLIENT_SECRET.encode(), to_sign, hashlib.sha256).digest()
expected_sig = base64.b64encode(signature).decode()

if expected_sig != port_signature.split(",")[1]:
    raise Exception('Invalid signature')

print('Success!')
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
const { createHmac } = require("crypto");

const portSignature = request.headers["x-port-signature"];
const portTimestamp = request.headers["x-port-timestamp"];
const signed = createHmac("sha256", "<CLIENT_SECRET>")
  .update(`${portTimestamp}.${JSON.stringify(request.body)}`)
  .digest("base64");

if (signed !== portSignature.split(",")[1]) {
  throw new Error("Invalid signature");
}

console.log("Success!");
```

</TabItem>

</Tabs>
