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
  #... your other stages
    stage('Get Port Entity') {
      steps {
          script {
            def token_response = sh(
                script: """
                    set +x
                    curl -s -X POST -H 'Content-Type: application/json' -d '{\"clientId\": \"${PORT_CLIENT_ID}\", \"clientSecret\": \"${PORT_CLIENT_SECRET}\"}' ${API_URL}/v1/auth/access_token
                """,
                returnStdout: true
            )
            def token_json = new groovy.json.JsonSlurperClassic().parseText(token_response)
            def API_TOKEN = token_json.accessToken

            def entity_response = sh(
                script: """
                    set +x
                    curl -s -X GET -H 'Authorization: Bearer ${API_TOKEN}' '${env.API_URL}/v1/blueprints/microserviceBuild/entities/new-ms-build'
                """,
                returnStdout: true,
            )
            def entity_json = new groovy.json.JsonSlurperClassic().parseText(entity_response)
            groovy.json.JsonOutput.prettyPrint(entity_response)
            println(entity_json.entity)
          }
      }
    }
  }

```

## Fetching Port API token in Jenkins

For interacting with Port, an API token is required. To acquire the token, add the following code to your stages:

```js showLineNumbers
            ...
            def token_response = sh(
                script: """
                    set +x
                    curl -s -X POST -H 'Content-Type: application/json' -d '{\"clientId\": \"${PORT_CLIENT_ID}\", \"clientSecret\": \"${PORT_CLIENT_SECRET}\"}' ${API_URL}/v1/auth/access_token
                """,
                returnStdout: true
            )
            def token_json = new groovy.json.JsonSlurperClassic().parseText(token_response)
            def API_TOKEN = token_json.accessToken // Use this token for accessing Port
            ...
```

:::note
For this example, the following plugin is a dependency:

- Plain Credentials (>=143.v1b_df8b_d3b_e48)

Also, please make sure the following methods signatures are approved:

```
new groovy.json.JsonSlurperClassic
method groovy.json.JsonSlurperClassic parseText java.lang.String
```

:::

3. Make sure you have an existing blueprint in your Port installation to create/update entities.

## Examples

Refer to the [examples](./examples.md) page for practical examples for using Port with Jenkins.
