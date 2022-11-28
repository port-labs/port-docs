---
sidebar_position: 6
---

# Auto importing properties

### Introduction

With our Github app you can auto import properties from a GitHub repository, like `commitMessage`, `commitedBy`, `mainLanguage`, and much more.

### Auto importable properties

| Field           | Description                                                                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repo`          | Link to the repository that the `port.yml` file is located in. <br/><br/> \* When there are multiple `port.yml` files the link will point to each `port.yml` file's parent directory.                                 |
| `mainLanguage`  | The main language the repo is written in: `Typescript`, `Python`, etc.                                                                                                                                                |
| `openIssues`    | Number of the open issues for the repository                                                                                                                                                                          |
| `commitMessage` | Latest commit message of the repository. <br/><br/> \* When there are multiple `port.yml` files the commit message will be taken from each `port.yml` file's parent directory.                                        |
| `commitedBy`    | Who performed the latest commit (author username). <br/><br/> \* When there are multiple `port.yml` files, the committed by will be determined by who did the last commit to each `port.yml` file's parent directory. |
| `commitHash`    | The latest commit hash of the repository. <br/><br/> \* When there are multiple `port.yml` files the commit hash will be taken from each `port.yml` file's parent directory.                                          |
| `organization`  | Organization of the GitHub repository.                                                                                                                                                                                |
| `description`   | Description of the GitHub repository.                                                                                                                                                                                 |
| `visibility`    | Is the repository private or public.                                                                                                                                                                                  |
| `archived`      | Is the repository archived.                                                                                                                                                                                           |

### Using auto importable properties

In order to use auto importable properties, add the JSON below to your [Blueprint schema](../../software-catalog/blueprint.md#blueprints-properties). If you still don't have a Blueprint with GitHub integration, please refer to the [Quickstart](./quickstart) section to create one.

:::tip
You can choose to include only a subset of the auto importable properties shown above, or all of them.

:::

```json showLineNumbers
{
  "identifier": "Microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "formulaProperties": {},
  "calculationProperties": {},
  "schema": {
    "properties": {
      "repo": {
        "title": "Repo",
        "type": "string",
        "format": "url",
        "description": "Link to the service repo on GitHub"
      },
      "organization": {
        "description": "The organization responsible on the repository",
        "title": "Organization",
        "type": "string"
      },
      "committedBy": {
        "description": "The GitHub username that commited the last commit",
        "title": "Commited By",
        "type": "string"
      },
      "commitHash": {
        "title": "Commit Hash",
        "type": "string"
      },
      "mainLanguage": {
        "description": "The main language used in the repository",
        "title": "Main Language",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "visibility": {
        "description": "Is the repository Private or Public",
        "title": "Visibility",
        "type": "string"
      },
      "openIssues": {
        "description": "The number of open issues for the repository",
        "title": "Open Issues",
        "type": "number"
      },
      "archived": {
        "description": "Is the repository archived?",
        "title": "Archived",
        "type": "boolean"
      },
      "commitMessage": {
        "title": "Commit Message",
        "type": "string"
      }
    },
    "required": []
  }
}
```

:::caution
When adding these properties, make sure to add them to the set of Blueprint properties, and not to overwrite the existing properties of the Blueprint.
:::
