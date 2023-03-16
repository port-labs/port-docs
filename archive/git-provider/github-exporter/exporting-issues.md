---
sidebar_position: 7
title: Exporting issues
---

:::note Prerequisites

[Please install our GitHub app](../../git/github/installation.md).
:::

In this tutorial, we will export issues from GitHub and create matching Port Entities!

1. Create an `issue` Blueprint and `port-app-config.yml` configuration file.

To export your GitHub `Issues` to Port, you can use the following Port Blueprint definition, and `port-app-config.yml`:

<details>
<summary> Issue Blueprint </summary>

```json showLineNumbers
{
  "identifier": "issue",
  "title": "Issue",
  "icon": "Github",
  "schema": {
    "properties": {
      "creator": {
        "title": "Creator",
        "type": "string"
      },
      "assignees": {
        "title": "Assignees",
        "type": "array"
      },
      "labels": {
        "title": "Labels",
        "type": "array"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": ["open", "closed"],
        "enumColors": {
          "open": "green",
          "closed": "purple"
        }
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "closedAt": {
        "title": "Closed At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "description": {
        "title": "Description",
        "type": "string",
        "format": "markdown"
      },
      "issueNumber": {
        "title": "Issue Number",
        "type": "number"
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

You have to place the `port-app-config.yml` inside the `.github` folder or within the `.github-private` repository in the root directory to apply it for the whole organization:

<details>

<summary> Port port-app-config.yml </summary>

```yaml showLineNumbers
resources:
  - kind: issue
    selector:
      query: ".pull_request == null" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".repo + (.id|tostring)"
          title: ".title"
          blueprint: '"issue"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            labels: "[.labels[].name]"
            status: ".state" # open, closed
            createdAt: ".created_at"
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            description: ".body"
            issueNumber: ".number"
            link: ".html_url"
```

</details>

:::info

- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue) for the GitHub issue object structure.

You might have noticed that the `repo` field is not provided by GitHub's API, that's because it is a custom property we added to simplify things.
:::

2. push `port-app-config.yml` to your default branch.

Done! after the push is complete, the exporter will begin creating all the `open` issues in the repository or organization, and update on every change to existing or creation of new `issues`.

Now you can view and query all of your Issues as Port Entities!

![Developer Portal GitHub Issues](../../../../../static/img/integrations/github-app/GitHubIssues.png)

You can also see the description in markdown format inside the [specific entity page](../../../../customize-pages-dashboards-and-plugins/page/entity-page.md).

![Developer Portal GitHub Issue Description](../../../../../static/img/integrations/github-app/IssueDescription.png)
