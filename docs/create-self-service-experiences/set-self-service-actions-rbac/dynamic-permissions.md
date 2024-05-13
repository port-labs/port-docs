import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Dynamic permissions

Port allows setting dynamic permissions for executing and/or approving execution of self-service actions. This is done using a set of queries and/or conditions that can be defined in the action's JSON configuration.  

This is a powerful feature that allows you to define you own logic based on any piece of data in your software catalog.

## Potential use-cases

Examples of useful applications of dynamic permissions:

- Ensure that action executions requested by a team member can only be approved by his/her direct manager.
- Perform validations/manipulations on inputs that depend on data from related entities.
- Ensure that only those who are on-call can perform rollbacks of a service with issues.

## Configuring permissions

To define dynamic permissions for an action:

- Go to the [`self-service`](https://app.getport.io/self-serve) page of your portal.

- Hover over the desired action, click on the `...` icon in its top-right corner, and choose `Edit`.

  <img src='/img/self-service-actions/rbac/actionEditPermissions.png' width='50%' border='1px' />

- Click on the `Edit JSON` button in the top-right corner of the configuration modal, then choose the `Permissions` tab.

This is the action's permission configuration in JSON format. Every action in Port has the following two keys under it:

- `"execute"` - any logic defined here pertains to the execution of the action. Here you can define who can **run** the action.
- `"approve"` - any logic defined here pertains to the approval of the action's execution. If [manual approval](/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions) is not enabled for this action, this key is irrelevant since no approval is needed to execute the action.

Under each of these two keys, you can add a `policy` key, which allows you to use more complex logic using two keys:

1. ["queries"](/search-and-query/) - a collection of [rules](/search-and-query/#rules) you can use to fetch and filter the data you need from your software catalog.
2. "conditions" - an array of strings, where each string is a `jq` query with access to the `"queries"` data.

<details>
<summary><b>Example snippet (click to expand)</b></summary>

```json showLineNumbers
{
  "execute": {
    #highlight-start
    "policy": {
      "queries": {
        "query_name": {
          "rules": [
              # Your rule/s logic here
            ],
            "combinator": "and"
        }
      },
      "conditions": [
        # A jq query resulting in a boolean value (allowed/not-allowed to execute)
      ]
    }
    #highlight-end
  },
  "approve": {
    "roles": [
      "Admin"
    ],
    "users": [],
    "teams": [],
    #highlight-start
    "policy": {
      "queries": {
        "query_name": {
          "rules": [
              # Your rule/s logic here
            ],
            "combinator": "and"
        }
      },
      "conditions": [
        # A jq query resulting in an array of strings (a list of users who can approve the action)
      ]
    }
    #highlight-end
  }
}
```

</details>

### Guidelines

- You can define any number of queries you wish for execution/approve policies.
- For `execution` policies, the condition must return a `boolean` value (determining whether the requester is allowed to execute the action or not).
- For `approve` policies, the condition must return an array of strings (the users who can approve the execution of the action).
- In both the `rules` and `conditions` values, you can access the following metadata:
  - `blueprint` - the blueprint tied to the action (if any).
  - `action` - the action object.
  - `inputs` - the values provided to the action inputs by the user who executed the action.
  - `user` - the user who executed/wants to approve the action (according to the policy type).
  - `entity` - for day-2 actions, this will hold the entity the action was executed on.
  - `trigger` - information about the triggered action:
    - `at` - the date of the action execution.
    - `user` - the user who executed the action.
- Any query that fails to evaluate will be ignored.
- Each query can return up to 1000 entities, so make sure you make them as precise as possible.

## Complete example

Here is an example of a permissions JSON belonging to a "Scaffold a new service" action.  
In this example we create rules that state that execution of the action can be **approved** only by the team leader of the user that asked to execute the action.

Note that this example assumes that you have:
- A `user` blueprint in your catalog representing a user in the organization.
- A `team` blueprint in your catalog representing a team in the organization.
- A [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between the `user` and `team` blueprints.

The example contains two queries:
1. `executingUser` - fetches the user who executed the action.
2. `approvingUsers` - fetches the users who are allowed to approve the action.

The `condition` checks if the approver is the executor's team leader, via the relation between `user` and `team`.

<details>
<summary><b>Service permissions JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "execute": {
    "roles": ["Member", "Admin"],
    "users": [],
    "teams": [],
    "ownedByTeam": false
  },
  "approve": {
    "roles": ["Admin"],
    "users": [],
    "teams": [],
    "policy": {
      "queries": {
        "executingUser": {
          "rules": [
            {
              "value": "user",
              "operator": "=",
              "property": "$blueprint"
            },
            {
              "value": "{{.trigger.user.email}}",
              "operator": "=",
              "property": "$identifier"
            }
          ],
          "combinator": "and"
        },
        "approvingUsers": {
          "rules": [
            {
              "value": "user",
              "operator": "=",
              "property": "$blueprint"
            },
            {
              "value": "Approver",
              "operator": "=",
              "property": "role"
            }
          ],
          "combinator": "and"
        }
      },
      "conditions": [
        "(.results.executingUser.entities | first | .relations.team) as $executerTeam | [.results.approvingUsers.entities[] | select(.relations.team == $executerTeam) | .identifier]"
      ]
    }
  }
}
```

</details>