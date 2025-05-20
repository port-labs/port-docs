---
sidebar_position: 19
description: Ingest Bitbucket Server projects, repositories and pull requests into your catalog
---

import BitbucketProjectBlueprint from "../resources/bitbucket-server/\_example_bitbucket_project_blueprint.mdx";
import BitbucketUserBlueprint from "../resources/bitbucket-server/\_example_bitbucket_user_blueprint.mdx";
import BitbucketPullrequestBlueprint from "../resources/bitbucket-server/\_example_bitbucket_pull_request_blueprint.mdx";
import BitbucketRepositoryBlueprint from "../resources/bitbucket-server/\_example_bitbucket_repository_blueprint.mdx";
import BitbucketWebhookConfiguration from "../resources/bitbucket-server/\_example_bitbucket_webhook_config.mdx";
import BitbucketServerPythonScript from "../resources/bitbucket-server/\_example_bitbucket_python_script.mdx";

# Bitbucket (Self-Hosted)

In this example you are going to create a webhook integration between your Bitbucket Server and Port. The integration will facilitate the ingestion of Bitbucket user, project, repository and pull request entities into Port.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Bitbucket project blueprint</summary>

<BitbucketProjectBlueprint/>

</details>

<details>
<summary>Bitbucket user blueprint</summary>

<BitbucketUserBlueprint/>

</details>

<details>
<summary>Bitbucket repository blueprint</summary>

<BitbucketRepositoryBlueprint/>

</details>

<details>
<summary>Bitbucket pull request blueprint</summary>

<BitbucketPullrequestBlueprint/>

</details>

:::tip Blueprint Properties
You may modify the properties in your blueprints depending on what you want to track in your Bitbucket account.
:::

## Let's Test It

This section includes a sample webhook event sent from Bitbucket when a pull request is merged. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a Bitbucket pull request is merged:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "body": {
    "eventKey": "pr:merged",
    "date": "2023-11-16T11:03:42+0000",
    "actor": {
      "name": "admin",
      "emailAddress": "username@gmail.com",
      "active": true,
      "displayName": "Test User",
      "id": 2,
      "slug": "admin",
      "type": "NORMAL",
      "links": {
        "self": [
          {
            "href": "http://myhost:7990/users/admin"
          }
        ]
      }
    },
    "pullRequest": {
      "id": 2,
      "version": 2,
      "title": "lint code",
      "description": "here is the description",
      "state": "MERGED",
      "open": false,
      "closed": true,
      "createdDate": 1700132280533,
      "updatedDate": 1700132622026,
      "closedDate": 1700132622026,
      "fromRef": {
        "id": "refs/heads/dev",
        "displayId": "dev",
        "latestCommit": "9e08604e14fa72265d65696608725c2b8f7850f2",
        "type": "BRANCH",
        "repository": {
          "slug": "data-analyses",
          "id": 1,
          "name": "data analyses",
          "description": "This is for my repository and all the blah blah blah",
          "hierarchyId": "24cfae4b0dd7bade7edc",
          "scmId": "git",
          "state": "AVAILABLE",
          "statusMessage": "Available",
          "forkable": true,
          "project": {
            "key": "MOPP",
            "id": 1,
            "name": "My On Prem Project",
            "description": "On premise test project is sent to us for us",
            "public": false,
            "type": "NORMAL",
            "links": {
              "self": [
                {
                  "href": "http://myhost:7990/projects/MOPP"
                }
              ]
            }
          },
          "public": false,
          "archived": false,
          "links": {
            "clone": [
              {
                "href": "ssh://git@myhost:7999/mopp/data-analyses.git",
                "name": "ssh"
              },
              {
                "href": "http://myhost:7990/scm/mopp/data-analyses.git",
                "name": "http"
              }
            ],
            "self": [
              {
                "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/browse"
              }
            ]
          }
        }
      },
      "toRef": {
        "id": "refs/heads/main",
        "displayId": "main",
        "latestCommit": "e461aae894b6dc951f405dca027a3f5567ea6bee",
        "type": "BRANCH",
        "repository": {
          "slug": "data-analyses",
          "id": 1,
          "name": "data analyses",
          "description": "This is for my repository and all the blah blah blah",
          "hierarchyId": "24cfae4b0dd7bade7edc",
          "scmId": "git",
          "state": "AVAILABLE",
          "statusMessage": "Available",
          "forkable": true,
          "project": {
            "key": "MOPP",
            "id": 1,
            "name": "My On Prem Project",
            "description": "On premise test project is sent to us for us",
            "public": false,
            "type": "NORMAL",
            "links": {
              "self": [
                {
                  "href": "http://myhost:7990/projects/MOPP"
                }
              ]
            }
          },
          "public": false,
          "archived": false,
          "links": {
            "clone": [
              {
                "href": "ssh://git@myhost:7999/mopp/data-analyses.git",
                "name": "ssh"
              },
              {
                "href": "http://myhost:7990/scm/mopp/data-analyses.git",
                "name": "http"
              }
            ],
            "self": [
              {
                "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/browse"
              }
            ]
          }
        }
      },
      "locked": false,
      "author": {
        "user": {
          "name": "admin",
          "emailAddress": "username@gmail.com",
          "active": true,
          "displayName": "Test User",
          "id": 2,
          "slug": "admin",
          "type": "NORMAL",
          "links": {
            "self": [
              {
                "href": "http://myhost:7990/users/admin"
              }
            ]
          }
        },
        "role": "AUTHOR",
        "approved": false,
        "status": "UNAPPROVED"
      },
      "reviewers": [],
      "participants": [],
      "properties": {
        "mergeCommit": {
          "displayId": "1cbccf99220",
          "id": "1cbccf99220b23f89624c7c604f630663a1aaf8e"
        }
      },
      "links": {
        "self": [
          {
            "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/pull-requests/2"
          }
        ]
      }
    }
  },
  "headers": {
    "X-Forwarded-For": "10.0.148.57",
    "X-Forwarded-Proto": "https",
    "X-Forwarded-Port": "443",
    "Host": "ingest.getport.io",
    "X-Amzn-Trace-Id": "Self=1-6555f719-267a0fce1e7a4d8815de94f7;Root=1-6555f719-1906872f41621b17250bb83a",
    "Content-Length": "2784",
    "User-Agent": "Atlassian HttpClient 3.0.4 / Bitbucket-8.15.1 (8015001) / Default",
    "Content-Type": "application/json; charset=UTF-8",
    "accept": "*/*",
    "X-Event-Key": "pr:merged",
    "X-Hub-Signature": "sha256=bf366faf8d8c41a4af21d25d922b87c3d1d127b5685238b099d2f311ad46e978",
    "X-Request-Id": "d5fa6a16-bb6c-40d6-9c50-bc4363e79632",
    "via": "HTTP/1.1 AmazonAPIGateway",
    "forwarded": "for=154.160.30.235;host=ingest.getport.io;proto=https"
  },
  "queryParams": {}
}
```

</details>


<details>
<summary> Mapping Result </summary>

```json showLineNumbers
{
   "identifier":"2",
   "title":"lint code",
   "blueprint":"bitbucketPullrequest",
   "properties":{
      "created_on":"2023-11-16T10:58:00Z",
      "updated_on":"2023-11-16T11:03:42Z",
      "merge_commit":"9e08604e14fa72265d65696608725c2b8f7850f2",
      "state":"MERGED",
      "owner":"Test User",
      "link":"http://myhost:7990/projects/MOPP/repos/data-analyses/pull-requests/2",
      "destination":"main",
      "source":"dev",
      "participants":[],
      "reviewers":[]
   },
   "relations":{
      "repository":"data-analyses"
   },
   "filter":true
}
```
</details>

## Import Bitbucket Historical Issues

In this example you are going to use the provided Python script to set up webhooks and fetch data from the Bitbucket Server API and ingest it to Port.

### Prerequisites

This example utilizes the [blueprint](#port-configuration) definition from the previous section.

In addition, provide the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `BITBUCKET_HOST` - Bitbucket server host such as `http://localhost:7990`
- `BITBUCKET_USERNAME` - Bitbucket username to use when accessing the Bitbucket resources
- `BITBUCKET_PASSWORD` - Bitbucket account password
- `BITBUCKET_PROJECTS_FILTER` - An optional comma separated list of Bitbucket projects to filter. If not provided, all projects will be fetched.
- `WEBHOOK_SECRET` - An optional secret to use when creating a webhook in Port. If not provided, `bitbucket_webhook_secret` will be used.
- `PORT_API_URL` - An optional variable that defaults to the EU Port API `https://api.getport.io/v1`. For US organizations use `https://api.us.getport.io/v1` instead.
- `IS_VERSION_8_7_OR_OLDER` - An optional variable that specifies whether the Bitbucket version is older than 8.7. This setting determines if webhooks should be created at the repository level (for older versions `<=8.7`) or at the project level (for newer versions `>=8.8`).
- `PULL_REQUEST_STATE` - An optional variable to specify the state of Bitbucket pull requests to be ingested. Accepted values are `"ALL"`, `"OPEN"`, `"MERGED"`, or `"DECLINED"`. If not specified, the default value is `OPEN`.

:::tip Webhook Configuration
This app will automatically set up a webhook that allows Bitbucket to send events to Port. To understand more about how Bitbucket sends event payloads via webhooks, you can refer to [this documentation](https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html).

Ensure that the Bitbucket credentials you use have `PROJECT_ADMIN` permissions to successfully configure the webhook. For more details on the necessary permissions and setup, see the [official Bitbucket documentation](https://developer.atlassian.com/server/bitbucket/rest/v910/api-group-project/#api-api-latest-projects-projectkey-webhooks-post).
:::


:::info
Find your Port credentials using this [guide](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
:::

Use the following Python script to set up webhook and ingest historical Bitbucket users, projects, repositories and pull requests into port:

<details>
<summary>Bitbucket Python script</summary>

:::tip Latest Version
You can pull the latest version of this code by cloning this [repository](https://github.com/port-labs/bitbucket-workspace-data/)
:::

<BitbucketServerPythonScript/>

</details>

<details>
<summary>Bitbucket webhook configuration</summary>

<BitbucketWebhookConfiguration/>

</details>

Done! you are now able to import historical users, projects, repositories and pull requests from Bitbucket into Port and any change that happens to your project, repository or pull requests in Bitbucket will trigger a webhook event to the webhook URL provided by Port. Port will parse the events and objects according to the mapping and update the catalog entities accordingly.

## GitOps

Port's Bitbucket (Self-Hosted) integration also provides GitOps capabilities, refer to the [GitOps](./gitops.md) page to learn more.
