---
sidebar_position: 3
---

# Configuration

## How to configure the Bitbucket app?

There are 2 methods to configure the Bitbucket app:

1. For a `single repository`: Create a `port-app-config.yml` file in it.
2. For `all repositories` in the organization: Create a `.bitbucket-private` repository in the organization and create a `port-app-config.yml` file in it.

### Example `port-app-config.yml`

```yaml showLineNumbers
resources:
  - kind: pull-request
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".destination.repository.name + (.id|tostring)"
          title: ".title"
          blueprint: '"pull-request"'
          properties:
            creator: ".author.display_name"
            assignees: "[.participants[].user.display_name]"
            reviewers: "[.reviewers[].user.display_name]"
            status: ".state"
            createdAt: ".created_on"
            updatedAt: ".updated_on"
            description: ".description"
            link: ".links.html.href"
```
