---
sidebar_position: 5
description: Ingest Bitbucket Server projects, repositories and pull requests into your catalog
---

import BitbucketProjectBlueprint from "../../webhook/examples/resources/bitbucket-server/\_example_bitbucket_project_blueprint.mdx";
import BitbucketPullrequestBlueprint from "../../webhook/examples/resources/bitbucket-server/\_example_bitbucket_pull_request_blueprint.mdx";
import BitbucketRepositoryBlueprint from "../../webhook/examples/resources/bitbucket-server/\_example_bitbucket_repository_blueprint.mdx";
import BitbucketWebhookConfiguration from "../../webhook/examples/resources/bitbucket-server/\_example_bitbucket_webhook_config.mdx";
import BitbucketServerPythonScript from "../../webhook/examples/resources/bitbucket-server/\_example_bitbucket_python_script.mdx";

# Bitbucket (Self-Hosted)

In this example you are going to create a webhook integration between your Bitbucket Server and Port. The integration will facilitate the ingestion of Bitbucket project, repository and pull request entities into Port.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Bitbucket project blueprint</summary>

<BitbucketProjectBlueprint/>

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

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Bitbucket webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Bitbucket Server Mapper`;
   2. Identifier : `bitbucket_server_mapper`;
   3. Description : `A webhook configuration to map Bitbucket projects, repositories and pull requests to Port`;
   4. Icon : `BitBucket`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <BitbucketWebhookConfiguration/>
    :::note
    Take note of, and copy the Webhook URL that is provided in this tab
    :::

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Bitbucket

1. From your Bitbucket account, open the project where you want to add the webhook;
2. Click **Project settings** or the gear icon on the left sidebar;
3. On the Workflow section, select **Webhooks** on the left sidebar;
4. Click the **Add webhook** button to create a webhook for the repository;
5. Input the following details:
   1. `Title` - use a meaningful name such as Port Webhook;
   2. `URL` - enter the value of the webhook `URL` you received after creating the webhook configuration in Port;
   3. `Secret` - enter the value of the secret you provided when configuring the webhook in Port;
   4. `Triggers` -
      1. Under **Project** select `modified`;
      2. Under **Repository** select `modified`;
      3. Under **Pull request** select any event based on your use case.
6. Click **Save** to save the webhook;

:::tip
Follow [this documentation](https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html) to learn more about webhook events payload in Bitbucket.
:::

Done! any change that happens to your project, repository or pull requests in Bitbucket will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

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

### Mapping Result

```json showLineNumbers
{
  "identifier": "2",
  "title": "lint code",
  "blueprint": "bitbucketPullrequest",
  "properties": {
    "created_on": "2023-11-16T10:58:00Z",
    "updated_on": "2023-11-16T11:03:42Z",
    "merge_commit": "9e08604e14fa72265d65696608725c2b8f7850f2",
    "state": "MERGED",
    "owner": "Test User",
    "link": "http://myhost:7990/projects/MOPP/repos/data-analyses/pull-requests/2",
    "destination": "main",
    "source": "dev",
    "participants": [],
    "reviewers": []
  },
  "relations": {
    "repository": "data-analyses"
  },
  "filter": true
}
```

## Import Bitbucket Historical Issues

In this example you are going to use the provided Python script to fetch data from the Bitbucket Server API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint and webhook](#port-configuration) definition from the previous section.

In addition, provide the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `BITBUCKET_HOST` - Bitbucket server host such as `http://localhost:7990`
- `BITBUCKET_USERNAME` - Bitbucket username to use when accessing the Bitbucket resources
- `BITBUCKET_PASSWORD` - Bitbucket account password

:::info
Find your Port credentials using this [guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)
:::

Use the following Python script to ingest historical Bitbucket projects, repositories and pull requests into port:

<details>
<summary>Bitbucket Python script</summary>

<BitbucketServerPythonScript/>

</details>

Done! you are now able to import historical projects, repositories and pull requests from Bitbucket server into Port. Port will parse the objects according to the mapping and update the catalog entities accordingly.
