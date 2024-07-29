import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Dynamic permissions

Port allows users to set dynamic permissions for both executing and approving execution of self-service actions. To support these dynamic permission, Port offers the following to users within the JSON configuration of any given self-service action:
- The organization's full software catalog as defined in Port (to provide necessary context to the self-service action).
- The ability to query the software catalog.
- The ability to set conditions based on queries of the software catalog.

This is a powerful feature that allows you to define your own logic based on any piece of data in your software catalog. Prior to defining dynamic permissions for a self-service action, we recommend:
- Clearly defining which users should be allowed to perform this action.
- Clearly defining which users should be allowed to approve this action.
- Ensuring that your software catalog contains the necessary blueprints and properties to support the dynamic permissions.

## Potential use-cases

Examples of useful applications of dynamic permissions:

- Ensure that action executions requested by a team member can only be approved by his/her direct manager.
- Perform validations/manipulations on inputs that depend on data from related entities.
- Ensure that only those who are on-call can perform rollbacks of a service with issues.
- Allow service owners to modify their own infrastructure freely, but also enforce approval when they seek to make changes to infrastructure shared by multiple services.

## Configuring permissions

### Guidelines

- There is no limit to the number of queries you may define for execution and approve policies.
- For `execution` policies, the condition **must** return a `boolean` value (determining whether or not the requester is allowed to execute the action).
- For `approve` policies, the condition **must** return an array of strings, which **must** be the email addresses of users who can approve the execution of the action.
- In both the `rules` and `conditions` values, you can access the following metadata:
  - `blueprint` - the blueprint tied to the action (if any).
  - `action` - the action object.
  - `inputs` - the values provided to the action inputs by the user who executed the action.
  - `user` - the user who executed/wants to approve the action.
  - `entity` - for day-2 actions, this will hold the entity the action was executed on.
  - `trigger` - information about the triggered action:
    - `at` - the date of the action execution.
    - `user` - the user who executed the action.
- Any query that fails to evaluate will be ignored.
- Each query can return up to 1000 entities, so be sure to make them as precise as possible.

### Instructions

To define dynamic permissions for an action:

- Go to the [`self-service`](https://app.getport.io/self-serve) page of your portal.

- Hover over the desired action, click on the `...` icon in its top-right corner, and choose `Edit`.

  <img src='/img/self-service-actions/rbac/actionEditPermissions.png' width='50%' border='1px' />

- Click on the `Edit JSON` button in the top-right corner of the configuration modal, then choose the `Permissions` tab.

  <img src='/img/self-service-actions/rbac/actionEditJsonButton.png' width='100%' border='1px' />

This is the action's permission configuration in JSON format. Every action in Port has the following two keys under it:

- `"execute"` - any logic defined here pertains to the execution of the action. Here you can define who can **run** the action.
- `"approve"` - any logic defined here pertains to the approval of the action's execution. If [manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions) is not enabled for this action, this key is irrelevant since no approval is needed to execute the action.

Under each of these two keys, you can add one or more of the following keys:

- A `roles` key, which allows you to specify which **roles** can execute/approve the action.
- A `users` key, which allows you to specify which **users** can execute/approve the action.
- A `teams` key, which allows you to specify which **teams** can execute/approve the action.
- A `policy` key, which allows you to use more complex logic using two keys:
  - [`"queries"`](/search-and-query/) - a collection of [rules](/search-and-query/#rules) you can use to fetch and filter the data you need from your software catalog.
  - `"conditions"` - an array of strings, where each string is a `jq` query with access to the `"queries"` data.

There is an implicit `'OR'` between the `roles`, `users`, `teams`, and `policy` keys, meaning that if any of them evaluate to `true`, the action will be allowed.  
For example, the following configuration will allow the action to be executed by any user who is either an `Admin` **or** a member of the `Engineering` team:

```json
"execute": {
    "roles": ["Admin"],
    "users": [],
    "teams": ["Engineering"]
```

Here is an example of using the policy key in a permissions JSON:
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
              // Your rule/s logic here
            ],
            "combinator": "and"
        }
      },
      "conditions": [
        // A jq query resulting in a boolean value (allowed/not-allowed to execute)
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
              // Your rule/s logic here
            ],
            "combinator": "and"
        }
      },
      "conditions": [
        // A jq query resulting in an array of strings (a list of users who can approve the action)
      ]
    }
    #highlight-end
  }
}
```

</details>

## Examples

### Forbid execution if entity exists

Let's take a look at the following scenario:  
Say we have an action that scaffolds a new microservice, and as a result creates an entity in our software catalog representing that service.  
Now say we want to ensure that execution of this action will be blocked if the provided service name already exists in our catalog.  

Here is an example of a permissions JSON that achieves this:

<details>
<summary><b>Full permissions JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "execute": {
    // the next three keys allow users to specify roles, specific users, and specific teams that may execute this action
    "roles": ["Member", "Admin"],
    "users": [],
    "teams": [],
    "ownedByTeam": false, // declares ownership of the action by a team, if desired
    "policy": {
      "queries": {
        "search_entity": {
          "rules": [
            // fetch all entities created from the "service" blueprint
            {
              "value": "service",
              "operator": "=",
              "property": "$blueprint"
            },
            // fetch all entities whose identifier is equal to the name provided as an input in the action execution
            {
              "value": "{{ .inputs.name }}",
              "operator": "=",
              "property": "$identifier"
            }
          ],
          "combinator": "and"
        }
      },
      // if our rule results produced no entities, that means that a service with our desired name does not exist, so we can execute the action
      "conditions": [
        ".results.search_entity.entities | length == 0"
      ]
    }
  },
  "approve": {
    "roles": [
      "Admin"
    ],
    "users": [],
    "teams": []
  }
}
```

</details>

#### Explanation

The two rules that we defined fetch all `service` entities whose name is the same as the one provided to the action during execution. These rules will return an array of entities that comply with them. If no entities comply with the rules, the array will be empty.  
The `conditions` query checks if the resulting array is empty or not, and returns `true` or `false`, respectively. If the array is empty, that means that an entity with the provided name does not exist in our software catalog, so we can return `true` and allow the action execution.

---

### Team leader approval

In this example we create rules that state that execution of an action can be **approved** only by the team leader of the user that asked to execute the action.

Note that this example assumes that you have:
- A `user` blueprint in your catalog representing a user in the organization.
- A `team` blueprint in your catalog representing a team in the organization.
- A [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between the `user` and `team` blueprints.

The example contains two queries:
1. `executingUser` - fetches the user who executed the action.
2. `approvingUsers` - fetches the users who are allowed to approve the action.

The `condition` checks if the approver is the executer's team leader, via the relation between `user` and `team`.

<details>
<summary><b>Full permissions JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "execute": {
    // the next three keys allow users to specify roles, specific users, and specific teams that may execute this action
    "roles": ["Member", "Admin"],
    "users": [],
    "teams": [],
    "ownedByTeam": false // declares ownership of the action by a team, if desired
    // a policy key may be added here, with queries and conditions within it
  },
  "approve": {
    "roles": ["Admin"], // all admins may approve this action
    "users": [],
    "teams": [],
    "policy": {
      "queries": {
        // executingUser is a custom query that returns an array of entities
        "executingUser": {
          "rules": [
            // fetches all users from user blueprint
            {
              "value": "user",
              "operator": "=",
              "property": "$blueprint"
            },
            // filters all users from immediately previous query
            // to find only the user who executed the action
            {
              "value": "{{.trigger.user.email}}",
              "operator": "=",
              "property": "$identifier"
            }
          ],
          "combinator": "and" // both of the conditions above must be true
        },
        // approvingUsers is a custom query that returns an array of entities
        "approvingUsers": {
          "rules": [
            // fetches all users from user blueprint
            {
              "value": "user",
              "operator": "=",
              "property": "$blueprint"
            },
            // filters all users from immediately previous query
            // to find all users who are approvers
            {
              "value": "Approver",
              "operator": "=",
              "property": "role"
            }
          ],
          "combinator": "and" // both of the conditions above must be true
        }
      },
      // see next section for description of what occurs in the jq query below
      "conditions": [
        "(.results.executingUser.entities | first | .relations.team) as $executerTeam | [.results.approvingUsers.entities[] | select(.relations.team == $executerTeam) | .identifier]"
      ]
    }
  }
}
```

</details>

#### Explanation

The `conditions` query uses the two arrays produced as a result of the `executingUser` and `approvingUsers` queries and returns an array of users who may approve the self-service action. While the Port public documentation site does not provide exhaustive guidance on how to use the [JQ JSON processor](https://jqlang.github.io/jq/manual/), the following explanation is provided to ensure users can craft their own JQ queries when configuring dynamic permissions.

The query below filters the array produced by the `executingUser` query down to only the first element in the array, then further filters this array to show only the contents of the `.relations.team` key. This newly filtered array is saved as a variable (`$`) called `executerTeam`.

```json
"(.results.executingUser.entities | first | .relations.team) as $executerTeam"
```

The next query (`.results.approvingUsers.entities[]`) takes the *entire* array from the `approvingUsers` query, then applies a filter to include *only* the approving users from that array who are on the same team as the executing user (`select(.relations.team == $executerTeam)`). Finally, the array is filtered to yield only an array of the `.identifier` property of all approvers, which Port then uses to *dynamically* evaluate who may approve this self-service action.

