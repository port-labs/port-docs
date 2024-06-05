# Create/update entity

In some cases, we don't want to run complex logic via a workflow or pipeline, but rather want our backend to simply create or update an entity in our software catalog.  
This backend type does exactly that, simplifying the process and avoiding unnecessary complexity.

## Define the backend

To use this backend type, you will need to define the following fields:

<img src='/img/self-service-actions/setup-backend/upsert-entity/upsertUiExample.png' width='75%' border='1px' />

* The `blueprint` from which the entity will be created or updated.
* The mapping of the created/updated entity:

    ```json showLineNumbers
    {
      "identifier": "some_identifier",
      "title": "Some Title",
      "team": [],
      "icon": "DefaultBlueprint",
      "properties": {},
      "relations": {}
    }
    ```
    <br/>

    The table below describes the fields in the JSON structure (fields in **bold** are required):

    | Field | Description |
    | --- | --- |
    | **`identifier`** | Used to identify the entity in your software catalog. If it already exists, the entity will be **updated**, otherwise it will be **created**. |
    | `title` | The title of the entity. |
    | `team` | The team/s this entity will belong to. |
    | `icon` | The icon of the entity. |
    | `properties` | The properties of the entity, in `"key":"value"` pairs where the key is the property's identifier, and the value is its value. |
    | `relations` | The relations of the entity, in `"key":"value"` pairs where the key is the relation's identifier, and the value is the related entity's identifier. |

### Use jq to map the entity

All fields in the `mapping` object can be mapped using `jq` expressions, by wrapping the value in double curly braces `{{ }}`.  

For example, say we want to assign the initiator of the action to a new entity when it is created, we can take his email from the action run object and assign it to a property named `assignee`:

```json
{
  "identifier": "someTaskEntity",
  "title": "Some Task",
  "team": ["team1"],
  "icon": "DefaultBlueprint",
  "properties": { "assignee": "{{ .trigger.by.user.email }}" },
  "relations": {}
}
```

:::tip Test your mapping
You can use the `Test JQ` button in the bottom-left corner to test your mapping against the action's schema.
:::
