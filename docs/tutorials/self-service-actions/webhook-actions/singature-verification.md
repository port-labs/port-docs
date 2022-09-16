---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Validating webhook signature

In this guide, we will show how to validate that a message your webhook has received has been sent by port

## Code examples

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

## Why?

When exposing HTTP server to the world, anyone can just a POST request to it. In order to validate that the sender of the request is Port and not by anyone else (potentially attacker), you should validate the webhook singature.

## Headers

In each webhook call, the following headers will be provided

- `x-port-timestamp` - timestamp in `epoch`
- `x-port-signature` - `base64` encoded signature

## Signature structure

The structure of the content that Port signs is build using a `.` to seperate the body and the timestamp

```js
const toSignContent = `${timestamp}.${body}`;
```

Port take the content that needs to be signed and enforcing it via `HMAC` & `SHA-256` and then encodes it in base64. After that Port takes the output and adds the version as a prefix with a `,` for example the `x-port-signature` should look like `v1,2ehMaSsW+OTSDFERA/SmIKSSySlE3uaJELVlNIOLJ1OE=`

:::info
In order to avoid replay attacks, Port provides the timestamp singature and you can validate it as well
:::
