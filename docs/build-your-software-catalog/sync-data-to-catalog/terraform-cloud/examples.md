---
sidebar_position: 2
---

# Examples
To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

## Organization

<details>
<summary>Organization blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudOrganization",
    "description": "This blueprint represents an organization in Terraform Cloud",
    "title": "Terraform Cloud Organization",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "externalId": {
          "type": "string",
          "title": "External ID",
          "description": "The external ID of the organization"
        },
        "ownerEmail": {
          "type": "string",
          "title": "Owner Email",
          "description": "The email associated with the organization"
        },
        "collaboratorAuthPolicy": {
          "type": "string",
          "title": "Collaborator Authentication Policy",
          "description": "Policy for collaborator authentication"
        },
        "planExpired": {
          "type": "string",
          "title": "Plan Expired",
          "description": "Indicates if plan is expired"
        },
        "planExpiresAt": {
          "type": "string",
          "format": "date-time",
          "title": "Plan Expiry Date",
          "description": "The data and time which the plan expires"
        },
        "permissions": {
          "type": "object",
          "title": "Permissions",
          "description": "Permissions associated with the organization"
        },
        "samlEnabled": {
          "type": "boolean",
          "title": "SAML Enabled",
          "description": "Indicates if SAML is enabled for the organization"
        },
        "defaultExecutionMode": {
          "type": "string",
          "title": "Default Execution Mode",
          "description": "The default execution mode for the organization"
        }
      }
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: organization
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudOrganization"'
        properties:
          externalId: .attributes."external-id"
          ownerEmail: .attributes.email
          collaboratorAuthPolicy: .attributes."collaborator-auth-policy"
          planExpired: .attributes."plan-expired"
          planExpiresAt: .attributes."plan-expires-at"
          permissions: .attributes.permissions
          samlEnabled: .attributes."saml-enabled"
          defaultExecutionMode: .attributes."default-execution-mode"
```
</details>

## Project
<details>
<summary>Project blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudProject",
    "description": "This blueprint represents a project in Terraform Cloud",
    "title": "Terraform Cloud Project",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "name": {
          "type": "string",
          "title": "Project Name",
          "description": "The name of the Terraform Cloud project"
        },
        "permissions": {
          "type": "object",
          "title": "Permissions",
          "description": "The permissions on the project"
        }
      }
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "organization": {
        "title": "Terraform Cloud Organization",
        "target": "terraformCloudOrganization",
        "required": true,
        "many": false
      }
    }
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: project
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudProject"'
        properties:
          name: .attributes.name
          permissions: .attributes.permissions
        relations:
          organization: .relationships.organization.data.id
```
</details>

## Workspace

<details>
<summary>Workspace blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudWorkspace",
    "description": "This blueprint represents a workspace in Terraform Cloud",
    "title": "Terraform Cloud Workspace",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "organization": {
          "type": "string",
          "title": "Organization",
          "description": "The organization within which the workspace belongs to"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "title": "Creation Time",
          "description": "The creation timestamp of the workspace"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "title": "Last Updated",
          "description": "The last update timestamp of the workspace"
        },
        "terraformVersion": {
          "type": "string",
          "title": "Terraform Cloud Version",
          "description": "Version of Terraform cloud used by the workspace"
        },
        "locked": {
          "type": "boolean",
          "title": "Locked Status",
          "description": "Indicates whether the workspace is locked"
        },
        "executionMode": {
          "type": "string",
          "title": "Execution Mode",
          "description": "The execution mode of the workspace"
        },
        "resourceCount": {
          "type": "number",
          "title": "Resource Count",
          "description": "Number of resources managed by the workspace"
        },
        "latestChangeAt": {
          "type": "string",
          "format": "date-time",
          "title": "Latest Change",
          "description": "Timestamp of the latest change in the workspace"
        },
        "tags": {
          "type": "array",
          "title": "Workspace Tags",
          "description": "Terraform workspace tags"
        }
      }
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "currentStateVersion": {
        "title": "Current State Version",
        "target": "terraformCloudStateVersion",
        "required": false,
        "many": false
      },
      "project": {
        "title": "Terraform Cloud Project",
        "target": "terraformCloudProject",
        "required": false,
        "many": false
      }
    }
  }
```
</details>


<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: workspace
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudWorkspace"'
        properties:
          organization: .relationships.organization.data.id
          createdAt: .attributes."created-at"
          updatedAt: .attributes."updated-at"
          terraformVersion: .attributes."terraform-version"
          locked: .attributes.locked
          executionMode: .attributes."execution-mode"
          resourceCount: .attributes."resource-count"
          latestChangeAt: .attributes."latest-change-at"
          tags: .__tags
        relations:
          currentStateVersion: .relationships."current-state-version".data.id
          project: .relationships.project.data.id
```

</details>

## Run

<details>
<summary>Run blueprint</summary>

```json showLineNumbers
{
  "identifier": "terraformCloudRun",
  "description": "This blueprint represents a run in Terraform cloud",
  "title": "Terraform Cloud Run",
  "icon": "Terraform",
  "schema": {
    "properties": {
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Creation Time",
        "description": "The creation timestamp of the run"
      },
      "status": {
        "type": "string",
        "title": "Run Status",
        "description": "The current status of the run"
      },
      "hasChanges": {
        "type": "boolean",
        "title": "Has Changes",
        "description": "Indicates whether the run has changes"
      },
      "isDestroy": {
        "type": "boolean",
        "title": "Is Destroy",
        "description": "Indicates whether the run is a destroy operation"
      },
      "message": {
        "type": "string",
        "title": "Run Message",
        "description": "Message associated with the run"
      },
      "terraformVersion": {
        "type": "string",
        "title": "Terraform Cloud Version",
        "description": "Version of Terraform cloud used in the run"
      },
      "appliedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Applied Time",
        "description": "Timestamp when the run was applied"
      },
      "plannedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Planned Time",
        "description": "Timestamp when the run was planned"
      },
      "source": {
        "type": "string",
        "title": "Run Source",
        "description": "The source of the run initiation"
      }
    }
  },
  "relations": {
    "terraformCloudWorkspace": {
      "title": "Terraform Cloud Workspace",
      "target": "terraformCloudWorkspace",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: run
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.message
        blueprint: '"terraformCloudRun"'
        properties:
          createdAt: .attributes."created-at"
          status: .attributes.status
          hasChanges: .attributes."has-changes"
          isDestroy: .attributes."is-destroy"
          message: .attributes.message
          terraformVersion: .attributes."terraform-version"
          appliedAt: .attributes."status-timestamps"."applied-at"
          plannedAt: .attributes."status-timestamps"."planned-at"
          source: .attributes.source
        relations:
          terraformCloudWorkspace: .relationships.workspace.data.id
```

</details>

## State Version

<details>
<summary>State Version blueprint</summary>

```json showLineNumbers
{
  "identifier": "terraformCloudStateVersion",
  "description": "This blueprint represents a version of a Terraform state version",
  "title": "Terraform Cloud State Versions",
  "icon": "Terraform",
  "schema": {
    "properties": {
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Creation Time",
        "description": "Timestamp when the state version was created"
      },
      "serial": {
        "type": "number",
        "title": "Serial Number",
        "description": "A unique identifier for this version within the workspace"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The current status of the state version (e.g., 'queued', 'finished')"
      },
      "size": {
        "type": "number",
        "title": "Size",
        "description": "The size of the resources"
      },
      "isResourcesProcessed": {
        "type": "boolean",
        "title": "Is Resources Processed",
        "description": "Whethere the resources has been processed"
      },
      "hostedStateDownloadUrl": {
        "type": "string",
        "title": "Download Url",
        "format": "url",
        "description": "Hosted state version download url "
      },
      "hostedJsonDownloadUrl": {
        "type": "string",
        "title": "Download Url",
        "format": "url",
        "description": "Url for downloading state version in json format"
      },
      "outputData": {
        "type": "array",
        "title": "Output",
        "description": "output returned from state version"
      },
      "vcsCommitUrl": {
        "type": "string",
        "title": "VCS Commit URL",
        "format": "url",
        "description": "URL of the VCS commit that triggered this state version"
      }
    }
  },
  "relations": {},
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: state-version
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .id
        blueprint: '"terraformCloudStateVersion"'
        properties:
          createdAt: .attributes."created-at"
          serial: .attributes.serial
          status: .attributes.status
          size: .attributes.size
          isResourcesProcessed: .attributes."resources-processed"
          hostedStateDownloadUrl: .attributes."hosted-state-download-url"
          hostedJsonDownloadUrl: .attributes."hosted-json-state-download-url"
          vcsCommitUrl: .attributes."vcs-commit-url"
          outputData: .__output
```

</details>