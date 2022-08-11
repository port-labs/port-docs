---
sidebar_position: 5
---

# Auto importing properties

### Introduction

With our github app you can auto import properties from GitHub repository, like `commitMessage` `commitedBy` `mainLanguage` and much more.


### Auto importable properties

| Field | Description 
| ----------- | ----------- |
| `repo` | A Link to the repository that the port.yml is located in. <br/><br/> * When there are multiple port.yml the link will point to the port.yml parent directory |
| `mainLanguage` | The main language the repo is written in `Typescript` `Python` etc... |
| `openIssues` | The number of open issues in the repository |
| `commitMessage` | The latest commit message of the repoistory <br/><br/> * When there are multiple port.yml the commit message will be taken from the port.yml parent directory | 
| `commitedBy` | Who did the latest commit (Author username) <br/><br/> * When there are multiple port.yml files the commited by will be determined by who did the last commit to port.yml parent directory |
| `commitHash` | The latest commit hash of the repoistory <br/><br/> * When there are multiple port.yml the commit hash will be taken from the port.yml parent directory |
| `organization` | The GitHub organization which the repository belongs to |
| `description` | The repository GitHub description |
| `visibility` | Is the repository Private or Public |
| `openIssues` | The number of the open issues for the repository |
| `archived` | Is the repository archived? |


### How do I import?

In order to do that all you have to do is to add the json below to your [blueprint schema](../../platform-overview/port-components/blueprint.md#blueprints-properties), if you still don't have a blueprint with GitHub integration please refer to the [Quickstart](./Quickstart) to create one easily.

Feel free to filter only your wanted 
```json showLineNumbers
{
    "identifier": "Microservice",
    "title": "Microservice",
    "icon": "Microservice",
    "dataSource": "Port",
    "formulaProperties": {},
    "schema": {
        "properties": {
            "repo": {
                "title": "Repo",
                "type": "string",
                "format": "url",
                "description": "Link to the service repo on GitHub"
            },
            "squad_name": {
                "title": "Squad",
                "type": "string",
                "description": "Squad ownership for the service"
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
Be sure to *add* the properties above to your blueprint instead of overwriting them
:::
