import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

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
    | `relations` | The relations of the entity, in `"key":"value"` pairs where the key is the relation's identifier, and the value is the related entity's identifier (for single relations) or an array of identifiers (for "many" relations). |

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

## Mapping entity relations

When creating or updating entities, you often need to establish relations with other entities. The mapping approach depends on whether you're dealing with single or multiple entity inputs.


<Tabs groupId="relation-mapping" defaultValue="single" values={[
{label: "Single Entity", value: "single"},
{label: "Array Entity", value: "array"},
{label: "Flexible Mapping", value: "flexible"}
]}>

<TabItem value="single">

For a single entity relation, map the entity identifier directly:

```json
{
  "identifier": "myServiceEntity",
  "title": "My Service",
  "properties": {},
  "relations": {
    "domain": "{{ .inputs.domain }}"
  }
}
```

</TabItem>

<TabItem value="array">

When your action accepts [array entity inputs](/docs/actions-and-automations/create-self-service-experiences/setup-ui-for-action/user-inputs/entity.md#array), you need to extract the identifiers from the array using the `map(.identifier)` pattern:

```json
{
  "identifier": "myUserEntity", 
  "title": "My User",
  "properties": {},
  "relations": {
    "skills": "{{ .inputs.skills | map(.identifier) }}"
  }
}
```

:::info Array entity inputs
When users select multiple entities from an [entity array input](/docs/actions-and-automations/create-self-service-experiences/setup-ui-for-action/user-inputs/entity.md#array), the input contains an array of entity objects. Each object includes both `identifier` and `title` properties, but relations can only reference entity identifiers.
:::

</TabItem>

<TabItem value="flexible">

For maximum flexibility, you can create a conditional mapping that handles both single entity and array entity inputs:

```json
{
  "identifier": "myProjectEntity",
  "title": "My Project", 
  "properties": {},
  "relations": {
    "dependencies": "{{ .inputs.dependencies | if type == \"array\" then map(.identifier) else .identifier end }}"
  }
}
```

This pattern automatically:
- Extracts identifiers from arrays when multiple entities are selected
- Uses the identifier directly when a single entity is selected

</TabItem>

</Tabs>


## Common use cases

Here are some typical scenarios for mapping array relations:

**Mapping skills to a user:**
```json
"relations": {
  "skills": "{{ .inputs.selectedSkills | map(.identifier) }}"
}
```

**Mapping team members to a project:**
```json  
"relations": {
  "members": "{{ .inputs.teamMembers | map(.identifier) }}"
}
```

**Mapping dependencies between services:**
```json
"relations": {
  "dependsOn": "{{ .inputs.dependencies | map(.identifier) }}"
}
```


:::info Entity titles in relations
Relations can only reference entity **identifiers**, not titles. Even though entity objects contain both `identifier` and `title` properties, you must always use `.identifier` when mapping to relations.
:::
