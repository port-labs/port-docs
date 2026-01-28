import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Dynamic permissions

Dynamic permissions allow you to control who can execute or approve self-service actions based on data in your software catalog. Unlike static permissions, where you explicitly list roles, users, or teams, dynamic permissions let you define logic that evaluates at runtime.

This enables access control patterns such as requiring manager approval, restricting actions based on entity ownership, or enforcing separation of duties.

## Common use cases

- Ensure that action executions requested by a team member can only be approved by his/her direct manager.
- Perform validations/manipulations on inputs that depend on data from related entities.
- Ensure that only those who are on-call can perform rollbacks of a service with issues.
- Allow service owners to modify their own infrastructure freely, but also enforce approval when they seek to make changes to infrastructure shared by multiple services.

## How it works

Dynamic permissions are configured using a `policy` object in the action's permissions JSON.  
The policy requires two keys:

- `queries` - Fetch entities from your software catalog based on rules you define.
- `conditions` - JQ expressions that evaluate the query results.

Both keys must be present in the policy object.

**When a `policy` is defined:**
- The `roles`, `users`, and `teams` keys control who can **see** the action.
- The `policy` exclusively controls who can **execute** or **approve** the action.

**When no `policy` is defined:**
- The `roles`, `users`, and `teams` keys control both visibility and execution/approval.

### Evaluation order

Dynamic permissions are evaluated **after** [blueprint permissions](/sso-rbac/rbac-overview/). This means:

1. Port first checks if the user has the required permissions on the underlying blueprint.
2. Only if the blueprint permissions allow access, the dynamic permission policy is evaluated.

Dynamic permissions can only **further restrict** who can execute or approve an action, or **dynamically determine approvers**. They cannot bypass blueprint-level restrictions.

## Configuration

Dynamic permissions are defined in the action's permissions JSON. This section covers how to access and structure the configuration.

### Accessing the permissions JSON

To define dynamic permissions for an action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Hover over the desired action, click on the `...` icon in its top-right corner, and choose `Edit`.
3. Click on the `Edit JSON` button in the top-right corner of the configuration modal, then choose the `Permissions` tab.


### The policy object structure

The permissions JSON contains two top-level keys:

- `"execute"` - defines who can **run** the action.
- `"approve"` - defines who can **approve** the action (only relevant if [manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions) is enabled).

Under each of these keys, you can define:

- `roles` - which roles can execute/approve the action.
- `users` - which specific users can execute/approve the action.
- `teams` - which teams can execute/approve the action.
- `policy` - dynamic logic containing:
  - [`queries`](/search-and-query/structure-and-syntax) - [rules](/search-and-query/structure-and-syntax#rules) to fetch entities from your catalog.
  - `conditions` - JQ expressions that determine access. Multiple conditions are evaluated with an implicit "OR".

**Note** that to remove an existing policy, set `"policy": null` in the JSON configuration. Simply deleting the policy content will not remove it.

The following example shows the complete structure of a policy object:

<details>
<summary><b>Complete policy structure example (click to expand)</b></summary>

```json showLineNumbers
{
  "execute": {
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
  },
  "approve": {
    "roles": [
      "Admin"
    ],
    "users": [],
    "teams": [],
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
  }
}
```

</details>

### How policy affects visibility vs execution

When no `policy` is defined, `roles`, `users`, and `teams` control both visibility **and** execution/approval permissions.
When a `policy` is defined, `roles`, `users`, and `teams` control only **visibility**, while the `policy` exclusively controls **execution** or **approval**.

**Example without policy:**

The action is visible and executable by users with the `admin` role or members of the `engineering` team:

```json showLineNumbers
"execute": {
  "roles": ["admin"],
  "users": [],
  "teams": ["engineering"]
}
```

**Example with policy:**

Using the same configuration, but this time with a `policy` object defined, these `roles` and `teams` only determine who can view the action, while the `policy` exclusively controls who can **execute** or **approve** it.

In the following example, the action will be visible to `admin` and `engineering` team members, but its execution permissions depend only on whether the `policy` conditions evaluate to `true`:
```json 
"execute": {
  "roles": ["admin"],
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

The `conditions` array in a policy behaves differently depending on whether it's used for **execute** or **approve** permissions: execute conditions return a **boolean**, while approve conditions return an **array of email addresses**.

<Tabs groupId="condition-types" queryString="condition-type">

<TabItem value="execute" label="Execute conditions" default>

Execute conditions must return a **boolean** value (`true` or `false`).

- `true` → the user **can** execute the action.
- `false` → the user **cannot** execute the action.

**Example condition:**

```json showLineNumbers
"conditions": [
  ".results.search_entity.entities | length == 0"
]
```

This condition checks if the query returned zero entities. Execution is allowed only in that case.

</TabItem>

<TabItem value="approve" label="Approve conditions">

Approve conditions must return an **array of strings** containing the **email addresses** of users who can approve the action.

- The array must contain **email addresses**, not user IDs. Fields like `createdBy` or `updatedBy` return user IDs, which will silently fail to match any approvers.
- An empty array means no one can approve.

**Example condition:**

```json showLineNumbers
"conditions": [
  "[.results.approvingUsers.entities[] | select(.relations.team == $executerTeam) | .identifier]"
]
```

This condition returns an array of user emails who are on the same team as the executor.

</TabItem>

</Tabs>

### Available context variables

When writing JQ conditions, you have access to the action's [trigger data](/actions-and-automations/create-self-service-experiences/setup-the-backend/#trigger-data) - the same context available when defining backend payloads.

**Commonly used in conditions:**

| Variable | Description |
|----------|-------------|
| `.trigger.user.email` | Email of the user who triggered the action |
| `.inputs.<field_name>` | Values provided by the user for action inputs |
| `.entity` | The entity being acted on (DAY-2/DELETE operations) |
| `.results.<query_name>.entities` | Array of entities returned by your queries |

:::info Query results
Access query results using `.results.<query_name>.entities`. Each entity contains `.identifier`, `.title`, `.properties.*`, and `.relations.*`.
:::

## Troubleshooting

Dynamic permissions can be challenging to debug because there's limited visibility into what's happening at runtime. Here are strategies to diagnose common issues.

### Common issues

<details>
<summary><b>Policy not working at all (click to expand)</b></summary>

**Check blueprint permissions first.** Dynamic permissions are evaluated *after* blueprint permissions. If the user doesn't have the required blueprint permissions, the policy won't even be evaluated.

To verify:
1. Temporarily remove the `policy` object from the permissions JSON.
2. Test if the user can execute the action with just `roles`/`users`/`teams`.
3. If they still can't, the issue is with blueprint permissions, not your policy.

</details>

<details>
<summary><b>No approvers appear for approval policy (click to expand)</b></summary>

This usually means your condition is returning user **IDs** instead of **email addresses**. Approve conditions must return an array of email addresses.

Common culprits:
- Using `.createdBy` or `.updatedBy` (these return user IDs, not emails)
- Using `.identifier` on a user entity when the identifier is an ID rather than an email

**Fix:** If your user entities use email as the identifier, use `.identifier`. If not, you need to access the email from a property, e.g., `.properties.email`.

</details>

<details>
<summary><b>Query returning no results (click to expand)</b></summary>

Your query rules might be too restrictive or referencing non-existent data.

**Test your query using the Search API:**

```bash
curl -X POST "https://api.getport.io/v1/entities/search" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "combinator": "and",
    "rules": [
      {
        "property": "$blueprint",
        "operator": "=",
        "value": "your_blueprint"
      }
    ]
  }'
```

This lets you verify what entities your query returns before using it in a policy.

</details>

<details>
<summary><b>JQ condition syntax errors (click to expand)</b></summary>

JQ syntax errors cause conditions to fail silently. Test your JQ expressions locally before adding them to Port.

**Test JQ locally:**

1. Create a file with sample context data (e.g., `test-data.json`)
2. Run your expression: `jq '<your_expression>' test-data.json`

**Common JQ mistakes:**
- Missing quotes around strings
- Using `=` instead of `==` for comparison
- Forgetting to handle empty arrays (use `// []` for defaults)

</details>

### Testing queries with the Search API

You can test your query rules using Port's [search API](/api-reference/search-entities) before adding them to a policy. This helps verify that your rules return the expected entities.

The query structure in dynamic permissions is identical to the search API request body:

```json showLineNumebrs
// In your policy:
"queries": {
  "my_query": {
    "rules": [...],
    "combinator": "and"
  }
}

// Equivalent Search API request body:
{
  "rules": [...],
  "combinator": "and"
}
```

:::tip Template variables
When testing, remember that template variables like `{{ .inputs.name }}` won't work in the API - you will need to replace them with actual values.
:::

<!-- TODO: ask Amichai if this is accurate and is it a good approach -->

## Limitations

- Each query can return up to **1000 entities**. Make your queries as precise as possible to stay within this limit.
- Any query that fails to evaluate will be **silently ignored**.
- Dynamically resolved approvers are only notified via the Port UI. Email notifications are **not** sent to them. To send email notifications, define approvers statically using the `users`, `roles`, or `teams` keys.
- There is no limit to the number of queries you can define per policy.

## Examples

The following examples demonstrate common patterns for dynamic permissions.

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

**Explanation**

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

**Explanation**

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

<details>
<summary><b>Full permissions JSON (click to expand)</b></summary>

```json showLineNumbers
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

</details>

**Explanation**

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
