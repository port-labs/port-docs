import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Importing Actions From The Old Routes To The New One

Not long ago there was only a single route for creating actions (`/blueprints/:blueprint_identifier/actions`). This route though is older and not in par with the Port vision.

Thats why we have created a new and improved route (`/actions`), which supports all the features which were supported in the old route, as well as some new ones 😉.

The edit and delete and get action routes have gone through the same process.


In this document we'll go over some of the differences between the different routes.

## Compatibility
Since the new routes supports all the features provided by the older ones, they are fully compatible with actions which were created with the old ones. This means:
* All actions created via the old route are accessible via the new route GET.
* All actions created via the old route can be editted via the new route.

Since not all feature available in the new route are available in the old one, actions which use the newly available features are not accessible via the old routes. This means:
* Actions without blueprints won't return from the old GET route.
* Actions' payload will not be available to edit via the old route PATCH route. This is true about a plethora of attributes which are available in the new route.

## What changed?
In this section, we'll go over changes between the old action route's body and the new one:

### Everything Can Be JQ
For every field (key, value or both) you could use JQ to calculate it's value to fit your needs.
This is done by writing double brackets in the string.
For example a hello-world action could look like:
```json
{
    "identifier": "hello",
    "title": "Say Hello",
    "trigger": {
        "operation": "CREATE",
        "userInputs": { 
            "name": {
                "title": "Name",
                "type": "string",
                "default": "world"
            }
        }
    },
    "payload": {
        "message": "Hello {{ .inputs.name }}"
    }
    ...
}
```

### User inputs and trigger changes
* The `trigger` is now an object detailing how the action should be triggered. The definition of the execution type (`CREATE`/`DAY-2`/`DELETE`) renamed from `trigger` to `operation` and is now a sub-property of the `trigger` object.
* The `userInputs` field remains unchanged, except that it is now under the `trigger` object.

For example for the old action:
```json
{
    "identifier": "myAction",
    "title": "My Action",
    "trigger": "CREATE",
    "userInputs": { ... }
    ...
}
```
The new structure will be:
```json
{
    "identifier": "myAction",
    "title": "My Action",
    "trigger": {
        "operation": "CREATE",
        "userInputs": { ... }
    }
    ...
}
```

### Blueprint is no longer required
The blueprint fields (previously set in the URL path) are no longer required, and are now part of the action creation request's body (as a sub-property of the new trigger objcet).
For example for the old action:
POST `/blueprints/myBlueprint/actions`
```json
{
    "identifier": "myAction",
    "title": "My Action",
    ...
}
```

Will now be:
POST `/actions`
```json
{
    "identifier": "myAction",
    "title": "My Action",
    "trigger": {
        "blueprintIdentifier": "myBlueprint"
    }
    ...
}
```

### Invocation method changes
The `invocationMethod` property remains nearly unchanged:
* The properties `omitUserInputs` and `omitPayload` are no longer available, and are instead replaced with the following:
* There is a new property `workflowInputs` or `payload` (deending on the `invocationMethod`'s `type`)

The `workflowInputs`/`payload` defines the data that would be sent to the target backend. Instead of it being auto-generated in a set structure, you can now define what data you want to send to your triggered server, and how to structure it.

For example if you always want to send to the backend the action's name as a static field, and all the user inputs unchanged:
```json
{
    "identifier": "myAction",
    "title": "My Action",
    "payload": {
        "PORT_ACTION": "My Action",
        "USER_INPUTS": "{{ .inputs }}"
    }
    ...
}
```

## Specific examples


<Tabs
groupId="specific-examples"
queryString
defaultValue="github"
values={[
{label: 'Github', value: 'github'},
]}>

<TabItem value="github">

Instead of accepting a `omitUserInputs` you define by yourself what user inputs to send to github and how.
For example to keep the behaviour of `"omitUserInputs": false` as it was in the old route you could define something like this:
```json
...
"invocationMethod": {
    "workflowInputs": {
        // for each input you want to send to the backend write the following line, and change <INPUT_IDENTIFIER> with you user-input's identifier
        "{{if (.inputs | has(\"<INPUT_IDENTIFIER>\")) then \"<INPUT_IDENTIFIER>\" else null end}}": "{{.inputs.\"<INPUT_IDENTIFIER>\"}}",
    }
    ...
}
```

Instead of accepting a `omitPayload` you define by yourself what user inputs to send to github and how.
For example to keep the behaviour of `"omitPayload": false` as it was in the old route you could define something like this:
```json
"invocationMethod": {
    "workflowInputs": {
        "port_payload": {
        "action": "{{ .action.identifier[(\"servicenowIncident_\" | length):] }}",
        "resourceType": "run",
        "status": "TRIGGERED",
        "trigger": "{{ .trigger | {by, origin, at} }}",
        "context": {
            "entity": "{{.entity.identifier}}",
            "blueprint": "{{.action.blueprint}}",
            "runId": "{{.run.id}}"
        },
        "payload": {
            "entity": "{{ (if .entity == {} then null else .entity end) }}",
            "action": {
                "invocationMethod": {
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "<YOUR WORKFLOW>",
                "reportWorkflowStatus": "<YOUR REPORT WORKFLOW STATUS>"
                },
                "trigger": "{{.trigger.operation}}"
            },
            "properties": {
                // copy into here the value from `workflowInputs`
            }
        },
    }
    ...
}
```


</TabItem>

</Tabs>