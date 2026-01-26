import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Dynamic permissions

Port allows users to set dynamic permissions for both executing and approving execution of self-service actions.   
To support dynamic permissions, the following items are available to you via the JSON configuration of any given self-service action:
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

:::info Email notifications
When approvers are defined dynamically using a `policy`, they will only be notified via the Port UI. Email notifications are **not** sent to dynamically resolved approvers. To send email notifications, define approvers statically using the `users`, `roles`, or `teams` keys.
:::

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
  - [`"queries"`](/search-and-query/structure-and-syntax) - a collection of [rules](/search-and-query/structure-and-syntax#rules) you can use to fetch and filter the data you need from your software catalog.
  - `"conditions"` - an array of strings, where each string is a `jq` query with access to the `"queries"` data. There is an implicit `"OR"` between each condition.

If there is **no** `policy` object defined, then `roles`, `users`, and `teams` control who can **view**, **approve**, or **execute** the action.  
If the `policy` object **is** defined, then `roles`, `users`, and `teams` only control who can **view** the action, while `policy` exclusively controls who can **execute** and **approve** the action.

:::tip Removing a policy
To remove an existing policy, set `"policy": null` in the JSON configuration. Simply deleting the policy content via backspace will not remove it.
:::

For example, the following configuration (note that no `policy` is defined) will allow the action to be **both visible and executed** by any user who is either an `Admin` or a member of the `Engineering` team:

```json
  "execute": {
    "roles": ["Admin"],
    "users": [],
    "teams": ["engineering"]
  }
  ```
Using the same configuration, but this time with a `policy` object defined, these `roles` and `teams` only determine who can view the action, while the `policy` exclusively controls who can **execute** or **approve** it.

In the following example, the action will be visible to `Admin` and `Engineering` team members, but its execution permissions depend only on whether the `policy` conditions evaluate to `true`:
```json 
"execute": {
  "roles": ["Admin"],
  "users": [],
  "teams": ["engineering"],
  "policy": {
    "queries": {
      "example_query": {
        "rules": [
          // Your rule logic here
        ],
        "combinator": "and"
      }
    },
    "conditions": [
      // A jq query returning a boolean (allowed/not-allowed to execute)
    ]
  }
}
```


### Condition return types

The `conditions` array in a policy behaves differently depending on whether it's used for **execute** or **approve** permissions:

<Tabs groupId="condition-types" queryString="condition-type">

<TabItem value="execute" label="Execute conditions" default>

Execute conditions must return a **boolean** value (`true` or `false`).

- `true` → the user **can** execute the action.
- `false` → the user **cannot** execute the action.

**Example condition:**

```json
"conditions": [
  ".results.search_entity.entities | length == 0"
]
```

This condition checks if the query returned zero entities. Execution is allowed only in that case.

</TabItem>

<TabItem value="approve" label="Approve conditions">

Approve conditions must return an **array of strings** containing the **email addresses** of users who can approve the action.

- The array should contain user identifiers (email addresses).
- An empty array means no one can approve.
- Any user whose email is in the returned array can approve the action.

**Example condition:**

```json
"conditions": [
  "[.results.approvingUsers.entities[] | select(.relations.team == $executerTeam) | .identifier]"
]
```

This condition returns an array of user emails who are on the same team as the executor.

</TabItem>

</Tabs>

:::info Execute vs. Approve
- **Execute permissions** return a boolean indicating whether a specific user can execute the action.
- **Approve permissions** return an array of user email addresses allowed to approve the action.
:::


### Understanding queries and conditions

The `policy` object uses two keys that work together:

**`queries`** - Fetch data from your software catalog using [Port's search syntax](/search-and-query/structure-and-syntax). Each query:
- Has a name (e.g., `executingUser`, `serviceOwners`) that you choose.
- Contains `rules` that filter entities (similar to catalog search).
- Supports `{{ .inputs.fieldName }}` and `{{ .trigger.user.email }}` templating.
- Results are stored in `.results.<query_name>.entities` for use in conditions.

**`conditions`** - Evaluate the fetched data using JQ expressions to make the final decision. Each condition:
- Has access to query results via `.results.<query_name>.entities`.
- Has access to metadata like `.trigger.user`, `.inputs`, `.entity`, etc.
- Must return a boolean (for execute) or array of email strings (for approve).
- Multiple conditions have an implicit OR between them.

**How they work together:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. QUERIES run first                                               │
│     → Fetch entities from catalog based on rules                    │
│     → Results stored in .results.<query_name>.entities              │
├─────────────────────────────────────────────────────────────────────┤
│  2. CONDITIONS evaluate the results                                 │
│     → JQ expressions process .results + metadata                    │
│     → Return boolean (execute) or email array (approve)             │
└─────────────────────────────────────────────────────────────────────┘
```

**Example breakdown:**

```json showLineNumbers
"policy": {
  "queries": {
    // highlight-next-line
    "serviceOwners": {                    // Query name (you choose this)
      "rules": [
        {
          "property": "$blueprint",
          "operator": "=",
          "value": "_user"                // Fetch from _user blueprint
        },
        {
          "property": "teams",
          "operator": "contains",
          "value": "{{ .entity.relations.owning_team }}"  // Template: team from entity
        }
      ],
      "combinator": "and"
    }
  },
  // highlight-next-line
  "conditions": [                         // JQ expressions using query results
    ".trigger.user.email as $user | .results.serviceOwners.entities | map(.identifier) | any(. == $user)"
  ]
}
```

This example:
1. **Query** fetches all users who belong to the entity's owning team.
2. **Condition** checks if the executing user's email is in that list (returns `true`/`false`).

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

**Note** that this example assumes that the relevant team leader has the `Moderator` role, as you can see in the `approvingUsers` section of the permissions JSON below.

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
    "roles": [],
    "users": [],
    "teams": [],
    "policy": {
      "queries": {
        // executingUser is a custom query that returns an array of entities
        "executingUser": {
          "rules": [
            // fetches all users from user blueprint
            {
              "value": "_user",
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
              "value": "_user",
              "operator": "=",
              "property": "$blueprint"
            },
            // fetches all users with the `Moderator` role
            {
              "value": "Moderator",
              "operator": "=",
              "property": "port_role"
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

The `conditions` query uses the two arrays produced as a result of the `executingUser` and `approvingUsers` queries and returns an array of users who may approve the self-service action. 

The query below filters the array produced by the `executingUser` query down to only the first element in the array, then further filters this array to show only the contents of the `.relations.team` key. This newly filtered array is saved as a variable (`$`) called `executerTeam`.

```json
"(.results.executingUser.entities | first | .relations.team) as $executerTeam"
```

The next query (`.results.approvingUsers.entities[]`) takes the *entire* array from the `approvingUsers` query, then applies a filter to include *only* the approving users from that array who are on the same team as the executing user (`select(.relations.team == $executerTeam)`). Finally, the array is filtered to yield only an array of the `.identifier` property of all approvers, which Port then uses to *dynamically* evaluate who may approve this self-service action.

---

### Prevent self-approval

In this example, we will implement a security best practice known as "segregation of duties" by ensuring that the user who executes an action cannot also approve it.  
This is particularly important for sensitive operations like production deployments, infrastructure changes, or permission modifications.

```json
{
  "execute": {
    "roles": ["Member", "Admin"],
    "users": [],
    "teams": [],
    "ownedByTeam": false
  },
  "approve": {
    "roles": [],
    "users": [],
    "teams": [],
    "policy": {
      "queries": {
        "approvingUsers": {
          "rules": [
            {
              "value": "_user",
              "operator": "=",
              "property": "$blueprint"
            },
            {
              "value": "Moderator",
              "operator": "=",
              "property": "port_role"
            }
          ],
          "combinator": "and"
        }
      },
      "conditions": [
        ".trigger.user.email as $executor | [.results.approvingUsers.entities[] | select(.identifier != $executor) | .identifier]"
      ]
    }
  }
}
```

<h4> Explanation </h4>

This configuration implements a "four-eyes principle", which requires that sensitive actions be verified by a second person before being executed.

Here's what's happening in each part:

1. **Execute Permissions**: Any user with either the `Member` or `Admin` role can execute this action.

2. **Approve Permissions**: The approval process is governed by a policy that:
   - Queries all users from the `_user` blueprint who have the `Moderator` role.
   - Uses a JQ condition to filter out the specific user who executed the action.

3. **The Key Condition**:
   ```json
   ".trigger.user.email as $executor | [.results.approvingUsers.entities[] | select(.identifier != $executor) | .identifier]"
   ```
   This JQ expression:
   - Takes all moderator users from our query results.
   - Filters out any user whose identifier matches the email of the person who triggered the action.
   - Returns only the identifiers of the remaining users.

The result is a dynamic list of all users who are authorized to approve the action, excluding the original executor.  
This ensures that no single person can both initiate and approve a sensitive change, reducing the risk of unauthorized or accidental changes.

---

### Only service owners can execute

In this example, we restrict action execution to users who are members of the team that owns the service (for day-2 actions).

```json showLineNumbers
{
  "execute": {
    "roles": ["Member", "Admin"],
    "users": [],
    "teams": [],
    "policy": {
      "queries": {
        "owningTeamMembers": {
          "rules": [
            {
              "property": "$blueprint",
              "operator": "=",
              "value": "_user"
            },
            {
              "property": "teams",
              "operator": "contains",
              "value": "{{ .entity.relations.owning_team }}"
            }
          ],
          "combinator": "and"
        }
      },
      "conditions": [
        ".trigger.user.email as $user | [.results.owningTeamMembers.entities[].identifier] | any(. == $user)"
      ]
    }
  },
  "approve": {
    "roles": ["Admin"],
    "users": [],
    "teams": []
  }
}
```

<h4> Explanation </h4>

This configuration ensures only team members who own the service can perform day-2 actions on it.

1. **Query**: Fetches all users from the `_user` blueprint whose `teams` property contains the owning team of the entity (accessed via `.entity.relations.owning_team`).

2. **Condition**: Checks if the executing user's email exists in the list of team member identifiers:
   - `.trigger.user.email as $user` - stores the executor's email.
   - `.results.owningTeamMembers.entities[].identifier` - gets all user emails from the query.
   - `any(. == $user)` - returns `true` if the executor is in the list.

:::tip Using entity data in queries
For day-2 actions, you can access the entity's properties and relations using `{{ .entity.properties.X }}` and `{{ .entity.relations.X }}` in your query rules. This allows you to create ownership-based permissions.
:::
