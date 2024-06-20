import ExampleImageBlueprint from "../\_ci_example_image_blueprint.mdx";
import ExampleCiJobBlueprint from "../\_ci_example_ci_job_blueprint.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Examples

## Basic create/update example

In this example you will create blueprints for `ciJob` and `image` entities, and a relation between them. Then you will add some Python code to create new entities in Port every time the Azure Pipeline is triggered:

<ExampleImageBlueprint />

<ExampleCiJobBlueprint />

After creating the blueprints, you can add a Python script for creating/updating a Port entity:

```python showLineNumber
import os
import requests
import json

# Env vars passed by the pipeline variables
# highlight-start
CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']
# highlight-end
API_URL = 'https://api.getport.io/v1'

credentials = {
    'clientId': CLIENT_ID,
    'clientSecret': CLIENT_SECRET
}
token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)
# use this access token + header for all http requests to Port
# highlight-start
access_token = token_response.json()['accessToken']
headers = {
	'Authorization': f'Bearer {access_token}'
}
# highlight-end

entity_json = {
  "identifier": "new-cijob-run",
  "properties": {
    "triggeredBy": os.environ['QUEUED_BY'],
    "commitHash": os.environ['GIT_SHA'],
    "actionJob": os.environ['JOB_NAME'],
    "jobLink": os.environ['JOB_URL']
  },
  "relations": {
      "image": ["example-image"]
  }
}

create_response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities?upsert=true&create_missing_related_entities=true', json=entity_json, headers=headers)
```

<PortApiRegionTip/>

:::note
Please notice that you have also created the `image` relation, and added a related image entity called `example-image`. This is the artifact of the ciJob, and you will update it later.
The creation was done using the `create_missing_related_entities=true` flag in the API url, allowing the relation to be created even though the `example-image` entity doesn't exist yet.
:::

After adding your new Python script to your repository, add the following code to your Azure pipeline `yml` file to call your script and update/create a new `ciJob` entity:

```yaml showLineNumbers
steps:
  # ... other tasks and steps
  - script: |
      pip install -r port_requirements.txt
  - task: PythonScript@0
    env:
      PORT_CLIENT_ID: $(PORT_CLIENT_ID)
      PORT_CLIENT_SECRET: $(PORT_CLIENT_SECRET)
      QUEUED_BY: $(Build.QueuedBy)
      GIT_SHA: $(Build.SourceVersion)
      JOB_NAME: $(Build.DefinitionName)
      JOB_URL: "$(System.TeamFoundationCollectionUri)$(System.TeamProject)/_build/results?buildId=$(Build.BuildId)"
    inputs:
      scriptSource: "filePath"
      scriptPath: "main.py"
```

## Basic get example

The following example gets the `new-cijob-run` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of its data (for example, the run link of the latest `ciJob`).

Add the following snippet to your Python code:

```python showLineNumbers
entity_id = "new-cijob-run"
blueprint_id = "ciJob"

get_response = requests.get(f"{API_URL}/blueprints/{blueprint_id}/entities/{entity_id}",
                        headers=headers)
entity = get_response.json()['entity']
print(f"Image tag is: {entity['properties']['runLink']}")

```

## Relation example

In the following example you will update the `example-image` entity that was automatically created when creating the `ciJob` entity shown in the previous example.

Add the following snippet to your Python code:

```python showLineNumbers
image_entity_json = {
  "identifier": "example-image",
  "team": [],
  "properties": {
    "imageTag": "v1",
    "synkHighVulnerabilities": "0",
    "synkMediumVulnerabilities": "0",
    "gitRepoUrl": "https://github.com/my-org/my-cool-repo",
    "imageRegistry": "docker.io/cool-image",
    "size": "0.71",
    "unitTestCoverage": "20",
    "unitTestCoverage": "50"
  },
  "relations": {}
}

create_image_response = requests.post(f'{API_URL}/blueprints/image/entities?upsert=true', json=image_entity_json, headers=headers)

```

That's it! The entity is created or updated and is visible in the UI.
