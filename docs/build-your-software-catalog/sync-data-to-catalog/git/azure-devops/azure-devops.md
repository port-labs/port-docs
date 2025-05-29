import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'


# Azure DevOps

Port's Azure DevOps integration allows you to model Azure DevOps resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and orgaize your desired Azure DevOps resources and their metadata in Port (see supported resources below).
- Watch for Azure DevOps object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.


### Supported Resources

The resources that can be ingested from Azure DevOps into Port are listed below.

  <AzureDevopsResources/>


## Setup

To install Port's Azure DevOps integration, see the [installation](./installation.md#setup) page.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: project
  selector:
    query: 'true'
    defaultTeam: 'false'
  port:
    entity:
      mappings:
        identifier: .id | gsub(" "; "")
        blueprint: '"azureDevopsProject"'
        title: .name
        properties:
          state: .state
          revision: .revision
          visibility: .visibility
          defaultTeam: .defaultTeam.name
          link: .url | gsub("_apis/projects/"; "")
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .project.name + "/" + .name | gsub(" "; "")
        title: .name
        blueprint: '"azureDevopsRepository"'
        properties:
          url: .url
          readme: file://README.md
          id: .id
          last_activity: .project.lastUpdateTime
        relations:
          project: .project.id | gsub(" "; "")
- kind: repository-policy
  selector:
    query: .type.displayName=="Minimum number of reviewers"
  port:
    entity:
      mappings:
        identifier: .__repository.project.name + "/" + .__repository.name | gsub(" "; "")
        blueprint: '"azureDevopsRepository"'
        properties:
          minimumApproverCount: .settings.minimumApproverCount
- kind: repository-policy
  selector:
    query: .type.displayName=="Work item linking"
  port:
    entity:
      mappings:
        identifier: .__repository.project.name + "/" + .__repository.name | gsub(" "; "")
        blueprint: '"azureDevopsRepository"'
        properties:
          workItemLinking: .isEnabled and .isBlocking
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .user.displayName
        blueprint: '"azureDevopsMember"'
        properties:
          url: .user.url
          email: .user.mailAddress
- kind: team
  selector:
    query: 'true'
    includeMembers: true
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"azureDevopsTeam"'
        properties:
          url: .url
          description: .description
        relations:
          project: .projectId | gsub(" "; "")
          members: .__members | map(.identity.id)
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .repository.project.name + "/" + .repository.name + (.pullRequestId | tostring) | gsub(" "; "")
        blueprint: '"azureDevopsPullRequest"'
        properties:
          status: .status
          createdAt: .creationDate
          leadTimeHours: (.creationDate as $createdAt | .status as $status | .closedDate as $closedAt | ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | ($closedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $closedTimestamp | if $status == "completed" and $closedTimestamp != null then (((($closedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) else null end)
        relations:
          repository: .repository.project.name + "/" + .repository.name | gsub(" "; "")
          service:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"ado_repository_id"'
              value: .repository.id
          creator:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"$identifier"'
              value: .createdBy.uniqueName
          reviewers:
            combinator: '"and"'
            rules:
            - operator: '"in"'
              property: '"$identifier"'
              value: '[.reviewers[].uniqueName]'
          azure_devops_reviewers: '[.reviewers[].id]'
          azure_devops_creator: .createdBy.id





```

</details>




## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.


## Let's Test It

This section includes a sample response data from Azure DevOps. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Azure DevOps:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
  "name": "Port Integration",
  "description": "Ocean integration project",
  "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c",
  "state": "wellFormed",
  "revision": 21,
  "_links": {
    "self": {
      "href": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c"
    },
    "collection": {
      "href": "[REDACTED]/_apis/projectCollections/a7db27e5-15a1-4e84-aca5-3de8874e5466"
    },
    "web": {
      "href": "[REDACTED]/Port Integration"
    }
  },
  "visibility": "private",
  "defaultTeam": {
    "id": "da84d6cf-fc6f-4a3a-b9f1-eccaf320589c",
    "name": "Port Integration Team",
    "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c/teams/da84d6cf-fc6f-4a3a-b9f1-eccaf320589c"
  },
  "lastUpdateTime": "2023-11-14T07:24:17.213Z"
}

```

</details>

<details>
<summary> Repository response data</summary>

```json showLineNumbers
{
  "id": "43c319c8-5adc-41f8-8486-745fe2130cd6",
  "name": "final_project_to_project_test",
  "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/git/repositories/43c319c8-5adc-41f8-8486-745fe2130cd6",
  "project": {
    "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "name": "Port Integration",
    "description": "Ocean integration project",
    "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c",
    "state": "wellFormed",
    "revision": 21,
    "visibility": "private",
    "lastUpdateTime": "2023-11-14T07:24:17.213Z"
  },
  "defaultBranch": "refs/heads/main",
  "size": 724,
  "remoteUrl": "https://isaacpcoffie@dev.azure.com/isaacpcoffie/Port%20Integration/_git/final_project_to_project_test",
  "sshUrl": "git@ssh.dev.azure.com:v3/isaacpcoffie/Port%20Integration/final_project_to_project_test",
  "webUrl": "[REDACTED]/Port%20Integration/_git/final_project_to_project_test",
  "isDisabled": false,
  "isInMaintenance": false
}
```
</details>

<details>
<summary> Work-item response data</summary>

```json showLineNumbers
{
  "id": 1,
  "rev": 2,
  "fields": {
    "System.AreaPath": "Test Project",
    "System.TeamProject": "Test Project",
    "System.IterationPath": "Test Project\\Sprint 1",
    "System.WorkItemType": "Issue",
    "System.State": "To Do",
    "System.Reason": "Added to backlog",
    "System.AssignedTo": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.CreatedDate": "2023-11-14T06:58:16.353Z",
    "System.CreatedBy": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.ChangedDate": "2023-11-14T06:58:32.69Z",
    "System.ChangedBy": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.CommentCount": 0,
    "System.Title": "setup backend infra",
    "System.BoardColumn": "To Do",
    "System.BoardColumnDone": false,
    "Microsoft.VSTS.Common.StateChangeDate": "2023-11-14T06:58:16.353Z",
    "Microsoft.VSTS.Common.Priority": 2,
    "WEF_88F4173AE02645C58988F456A7D828AB_Kanban.Column": "To Do",
    "WEF_88F4173AE02645C58988F456A7D828AB_Kanban.Column.Done": false
  },
  "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/wit/workItems/1",
  "__projectId": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
  "__project": {
    "id": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
    "name": "Test Project",
    "description": "This is a project for Port",
    "url": "[REDACTED]/_apis/projects/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
    "state": "wellFormed",
    "revision": 13,
    "visibility": "private",
    "lastUpdateTime": "2023-11-14T06:56:02.157Z"
  }
}
```
</details>

<details>
<summary> Pipeline response data</summary>

```json showLineNumbers
{
  "_links": {
    "self": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1"
    },
    "web": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_build/definition?definitionId=7"
    }
  },
  "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1",
  "id": 7,
  "revision": 1,
  "name": "health-catalist",
  "folder": "\\",
  "__projectId": "fd029361-7854-4cdd-8ace-bb033fca399c"
}
```
</details>

<details>
<summary> Pull request response data</summary>

```json showLineNumbers
{
  "repository": {
    "id": "075e1870-9a1a-4e3d-a219-6403c2004298",
    "name": "data-analysis",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298",
    "project": {
      "id": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
      "name": "Test Project",
      "state": "unchanged",
      "visibility": "unchanged",
      "lastUpdateTime": "0001-01-01T00:00:00"
    }
  },
  "pullRequestId": 1,
  "codeReviewId": 1,
  "status": "active",
  "createdBy": {
    "displayName": "Jaden Kodjo Miles",
    "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "_links": {
      "avatar": {
        "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
      }
    },
    "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "uniqueName": "doe@gmail.com",
    "imageUrl": "[REDACTED]/_api/_common/identityImage?id=40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
  },
  "creationDate": "2023-11-14T06:53:58.355547Z",
  "title": "First Pull Request",
  "description": "some description",
  "sourceRefName": "refs/heads/master",
  "targetRefName": "refs/heads/main",
  "mergeStatus": "conflicts",
  "isDraft": false,
  "mergeId": "6c00586e-ebda-40a3-a09b-66454e4c352d",
  "lastMergeSourceCommit": {
    "commitId": "00ce7ec80fd8ce6cde516432dc9aadf190d5c977",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/commits/00ce7ec80fd8ce6cde516432dc9aadf190d5c977"
  },
  "lastMergeTargetCommit": {
    "commitId": "a5c15f13af7d5f97369163fd76a63502600ada55",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/commits/a5c15f13af7d5f97369163fd76a63502600ada55"
  },
  "reviewers": [
    {
      "reviewerUrl": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/pullRequests/1/reviewers/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "vote": 10,
      "hasDeclined": false,
      "isFlagged": false,
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_api/_common/identityImage?id=40bee502-30c1-6eb5-9750-f9d35fa66e6f"
    }
  ],
  "labels": [
    {
      "id": "68e1d7ae-1784-49fe-8865-2742c25b1993",
      "name": "bitbucket",
      "active": true
    },
    {
      "id": "b11e1538-a984-440c-b756-ddc72e0e786c",
      "name": "auth",
      "active": true
    }
  ],
  "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/pullRequests/1",
  "supportsIterations": true
}
```
</details>





### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "fd029361-7854-4cdd-8ace-bb033fca399c",
  "title": "Port Integration",
  "blueprint": "project",
  "properties": {
    "state": "wellFormed",
    "revision": 21,
    "visibility": "private",
    "defaultTeam": "Port Integration Team",
    "link": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c"
}
  
```

</details>

<details>
<summary> Repository entity in Port </summary>

```json showLineNumbers
{
  "identifier": "PortIntegration/final_project_to_project_test",
  "title": "final_project_to_project_test",
  "blueprint": "azureDevopsRepository",
  "properties": {
    "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/git/repositories/43c319c8-5adc-41f8-8486-745fe2130cd6",
    "readme": "<README.md Content>",
    "defaultBranch": "refs/heads/main"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>

<details>
<summary> Work-item entity in Port </summary>

```json showLineNumbers
{
  "identifier": "1",
  "title": "setup backend infra",
  "blueprint": "workItem",
  "properties": {
    "type": "Issue",
    "state": "To Do",
    "effort": null,
    "description": null,
    "link": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/wit/workItems/1",
    "reason": "Added to backlog",
    "createdBy": "Jaden Kodjo Miles",
    "changedBy": "Jaden Kodjo Miles",
    "createdDate": "2023-11-14T06:58:16.353Z",
    "changedDate": "2023-11-14T06:58:32.69Z"
  },
  "relations": {
    "project": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2"
  }
}
```

</details>

<details>
<summary> Pipeline entity in Port </summary>

```json showLineNumbers
{
  "identifier": "7",
  "title": "health-catalist",
  "blueprint": "azureDevopsPipeline",
  "properties": {
    "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1",
    "revision": 1,
    "folder": "\\"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>

<details>
<summary> Pull request entity in Port </summary>

```json showLineNumbers
{
  "identifier": "TestProject/data-analysis1",
  "blueprint": "azureDevopsPullRequest",
  "properties": {
    "creator": "doe@gmail.com",
    "status": "active",
    "reviewers": [
      "doe@gmail.com"
    ],
    "createdAt": "2023-11-14T06:53:58.355547Z",
    "leadTimeHours": null
  },
  "relations": {
    "repository": "TestProject/data-analysis"
  }
}
```

</details>



## Relevant Guides
For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=AzureDevops).

## GitOps

Port's Azure DevOps integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
