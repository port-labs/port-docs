---
sidebar_position: 9
description: Ingest Snyk vulnerabilities into your catalog
---

import SnykBlueprint from "./resources/snyk/\_example_snyk_vulnerability_blueprint.mdx";
import SnykConfiguration from "./resources/snyk/\_example_snyk_vulnerability_webhook_configuration.mdx";

# Snyk

In this example you are going to create a webhook integration between [Snyk](https://snyk.io/) and Port, which will ingest Snyk code and infrastructure vulnerability entities into Port.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Snyk vulnerability blueprint</summary>

<SnykBlueprint/>

</details>

<details>
<summary>Snyk vulnerability webhook configuration</summary>

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in Snyk.

<SnykConfiguration/>

</details>

## Create the Snyk webhook

1. Go to [Snyk](https://snyk.io/) and select an account you want to configure the webhook for;
2. Click on **Settings** at the left of the page and copy your organization ID under the **Organization ID** section;
3. Navigate to your [Snyk accounts page](https://snyk.io/account/) and copy your API token. You will use this value to authorize the REST API;
4. Open any REST API client such as POSTMAN and make the following API call to create your webhook:
   1. `API URL` - use https://api.snyk.io/v1/org/<YOUR_ORG_ID>/webhooks;
   2. `Method` - select POST
   3. `Authorization` - The API token should be supplied in an Authorization header as `Authorization: token YOUR_API_KEY`;
   4. `Request Body` - The body of your request should be in a JSON format. Past the following information in the body text
   ```json
   {
     "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
     "secret": "WEBHOOK_SECRET"
   }
   ```
5. Click **Send** to create your Snyk webhook;

:::note
You can also create the Snyk webhook using the `curl` command below:

```curl showLineNumbers
curl -X POST \
     -H "Authorization: token YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>", "secret": "WEBHOOK_SECRET"}' \
     https://api.snyk.io/v1/org/<YOUR_ORG_ID>/webhooks
```

:::

Done! Any vulnerability detected on your source code will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Test the webhook

This section includes a sample webhook event sent from Snyk when a code vulnerability is added or removed. In addition, it also includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a code vulnerability is detected:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "project": {
    "id": "5bf68752-b4c2-4397-861a-7a9e82cab8da",
    "name": "Username/Project:package.json",
    "created": "2023-04-24T10:58:59.156Z",
    "origin": "github",
    "type": "npm",
    "readOnly": false,
    "testFrequency": "daily",
    "totalDependencies": 5,
    "issueCountsBySeverity": {
      "low": 0,
      "high": 2,
      "medium": 1,
      "critical": 0
    },
    "imageTag": "1.0.0",
    "lastTestedDate": "2023-04-24T10:58:59.511Z",
    "browseUrl": "https://app.snyk.io/org/org_id/project/5bf68752-b4c2-4397-861a-7a9e82cab8da",
    "importingUser": "None",
    "owner": "None",
    "tags": [],
    "isMonitored": true,
    "attributes": {
      "criticality": [],
      "lifecycle": [],
      "environment": []
    },
    "branch": "master"
  },
  "org": {
    "id": "9bca4505-7ae7-46bf-bcaf-2c5dc0b8d571",
    "name": "Organization Name",
    "slug": "Organization Slug",
    "url": "https://app.snyk.io/org/org_id",
    "group": "None",
    "created": "2023-04-24T10:43:23.625Z"
  },
  "removedIssues": [],
  "newIssues": [
    {
      "id": "SNYK-JS-BCRYPT-572911",
      "issueType": "vuln",
      "pkgName": "bcrypt",
      "pkgVersions": ["1.0.3"],
      "priorityScore": 589,
      "priority": {
        "score": 589,
        "factors": [
          {
            "name": "isFixable",
            "description": "Has a fix available"
          },
          {
            "name": "cvssScore",
            "description": "CVSS 7.5"
          }
        ]
      },
      "issueData": {
        "id": "SNYK-JS-BCRYPT-572911",
        "title": "Insecure Encryption",
        "severity": "high",
        "url": "https://snyk.io/vuln/SNYK-JS-BCRYPT-572911",
        "description": "Overview\n[bcrypt](https://www.npmjs.com/package/bcrypt) is an A library to help you hash passwords.\nAffected versions of this package are vulnerable to Insecure Encryption.",
        "identifiers": {
          "CVE": ["CVE-2020-7689"],
          "CWE": ["CWE-326"],
          "NSP": ["1553"],
          "GHSA": ["GHSA-5wg4-74h6-q47v"]
        },
        "credit": ["pool683"],
        "exploitMaturity": "no-known-exploit",
        "semver": {
          "vulnerable": ["<5.0.0"]
        },
        "publicationTime": "2020-07-01T15:32:37Z",
        "disclosureTime": "2020-06-21T13:43:00Z",
        "CVSSv3": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N",
        "cvssScore": 7.5,
        "cvssDetails": [
          {
            "assigner": "NVD",
            "severity": "high",
            "cvssV3Vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N",
            "cvssV3BaseScore": 7.5,
            "modificationTime": "2022-01-03T18:09:42.168356Z"
          }
        ],
        "functions": [],
        "language": "js",
        "patches": [],
        "nearestFixedInVersion": "",
        "isMaliciousPackage": false
      },
      "isPatched": false,
      "isIgnored": false,
      "fixInfo": {
        "isUpgradable": true,
        "isPinnable": false,
        "isPatchable": false,
        "isFixable": true,
        "isPartiallyFixable": true,
        "nearestFixedInVersion": "",
        "fixedIn": ["5.0.0"]
      }
    },
    {
      "id": "SNYK-JS-BCRYPT-575033",
      "issueType": "vuln",
      "pkgName": "bcrypt",
      "pkgVersions": ["1.0.3"],
      "priorityScore": 616,
      "priority": {
        "score": 616,
        "factors": [
          {
            "name": "exploitMaturity",
            "description": "Proof of Concept exploit"
          },
          {
            "name": "isFixable",
            "description": "Has a fix available"
          },
          {
            "name": "cvssScore",
            "description": "CVSS 5.9"
          }
        ]
      },
      "issueData": {
        "id": "SNYK-JS-BCRYPT-575033",
        "title": "Cryptographic Issues",
        "severity": "medium",
        "url": "https://snyk.io/vuln/SNYK-JS-BCRYPT-575033",
        "description": "Overview\n[bcrypt](https://www.npmjs.com/package/bcrypt) is an A library to help you hash passwords.\nAffected versions of this package are vulnerable to Cryptographic Issues. When hashing a password containing an ASCII NUL character, that character acts as the string terminator.",
        "identifiers": {
          "CVE": [],
          "CWE": ["CWE-310"]
        },
        "credit": ["Felix"],
        "exploitMaturity": "proof-of-concept",
        "semver": {
          "vulnerable": ["<5.0.0"]
        },
        "publicationTime": "2020-07-01T15:32:37.471739Z",
        "disclosureTime": "2020-01-13T13:45:13Z",
        "CVSSv3": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N/E:P/RL:O/RC:R",
        "cvssScore": 5.9,
        "cvssDetails": [],
        "functions": [],
        "language": "js",
        "patches": [],
        "nearestFixedInVersion": "",
        "isMaliciousPackage": false
      },
      "isPatched": false,
      "isIgnored": false,
      "fixInfo": {
        "isUpgradable": true,
        "isPinnable": false,
        "isPatchable": false,
        "isFixable": true,
        "isPartiallyFixable": true,
        "nearestFixedInVersion": "",
        "fixedIn": ["5.0.0"]
      }
    }
  ]
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generate the following Port entities (in the sample above, multiple entities will be generated because the `newIssues` array contains multiple objects):

```json showLineNumbers
{
  "identifier": "SNYK-JS-BCRYPT-575033",
  "title": "Cryptographic Issues",
  "blueprint": "snykVulnerability",
  "team": [],
  "properties": {
    "organizationUrl": "https://app.snyk.io/org/org_id",
    "organizationName": "Organization Name",
    "projectName": "Username/Project:package.json",
    "projectOrigin": "github",
    "branchName": "master",
    "issueType": "vuln",
    "pkgName": "bcrypt",
    "issueSeverity": "medium",
    "issueURL": "https://snyk.io/vuln/SNYK-JS-BCRYPT-575033",
    "issueStatus": "added"
  },
  "relations": {}
}
```
