---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Jenkins Deployment

Using Jenkins build, you can easily create/update and query entities in Port.

<br></br>
<br></br>

![Github Illustration](../../../../../static/img/github-action-illustration.png)

## 💡 Common Jenkins build usage

Port's API allows for easy integration between Port and your Jenkins builds, for example:

- Report the status of a running **CI job**;
- Update the software catalog about a new **build version** for a **microservice**;
- Get existing **entities**.

## Installation

To interact with Port inside your Jenkins builds, follow these steps:

1. Add your Port `CLIENT_ID` and `CLIENT_SECRET` as [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) and pass them to your build;
   1. This step is not mandatory, but it is recommended in order to not pass the `CLIENT_ID` and `CLIENT_SECRET` in plaintext in your builds;

```js showLineNumbers
pipeline {
  agent any
  environment {
    API_URL = "https://api.getport.io"
  }
...
    withCredentials([
        string(credentialsId: 'port-client-id', variable: 'PORT_CLIENT_ID'),
        string(credentialsId: 'port-client-secret', variable: 'PORT_CLIENT_SECRET')
        ]){
          // Your stage here
        }

```

2. Add the following stage to your Jenkins build:

```js showLineNumbers
import groovy.json.JsonSlurperClassic
  #... your other stages
    stage('Get Port Entity') {
      steps {
          script {
            auth_body = """
                {
                    "clientId": "${PORT_CLIENT_ID}",
                    "clientSecret": "${PORT_CLIENT_SECRET}"
                }
                """
            token_response = httpRequest contentType: 'APPLICATION_JSON',
                httpMode: "POST",
                requestBody: auth_body,
                url: "${API_URL}/v1/auth/access_token"
            def slurped_response = new JsonSlurperClassic().parseText(token_response.content)
            def token = slurped_response.accessToken

            response = httpRequest contentType: 'APPLICATION_JSON', httpMode: "GET",
                    url: "${API_URL}/v1/blueprints/blueprint/entities/entity-example",
                    customHeaders: [
                        [name: "Authorization", value: "Bearer ${token}"],
                    ]
            println(response.content)
          }
      }
    }
  }

```

## Fetching Port API token in Jenkins

For interacting with Port, an API token is required. To acquire the token, add the following code to your stages:

```js showLineNumbers
import groovy.json.JsonSlurperClassic
...
          withCredentials([
              string(credentialsId: 'port-client-id', variable: 'PORT_CLIENT_ID'),
              string(credentialsId: 'port-client-secret', variable: 'PORT_CLIENT_SECRET')
              ]){
                    auth_body = """
                        {
                           "clientId": "${PORT_CLIENT_ID}",
                           "clientSecret": "${PORT_CLIENT_SECRET}"
                        }
                        """
                    token_response = httpRequest contentType: 'APPLICATION_JSON',
                        httpMode: "POST",
                        requestBody: auth_body,
                        url: "${API_URL}/v1/auth/access_token"
                    def slurped_response = new JsonSlurperClassic().parseText(token_response.content)
                    def token = slurped_response.accessToken // Use this token for authentication with Port
```

:::note
For this example, the following plugin is a dependency:

- Plain Credentials (>=143.v1b_df8b_d3b_e48)
- HTTP Request (>=1.16)

Also, please make sure the following methods signatures are approved:

```
new groovy.json.JsonSlurperClassic
method groovy.json.JsonSlurperClassic parseText java.lang.String
```

:::

3. Make sure you have an existing Blueprint in your Port installation to create/update entities.

## Examples

Refer to the [examples](./examples.md) page for practical examples for using Port with Jenkins.
