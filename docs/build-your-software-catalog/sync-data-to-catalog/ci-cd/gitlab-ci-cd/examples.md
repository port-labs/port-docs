import ExampleMSBuildBlueprint from "../\_ci_example_microservice_build_blueprint.mdx";
import ExamplePackageBlueprint from "../\_ci_example_package_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code that uses Python to create a new entity in Port every time the Gitlab Ci-CD pipeline is triggered:

<ExampleMSBuildBlueprint />

After creating the blueprint, you can add/create a Python Script for creating/updating a Port entity:

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
  "identifier": "new-ms-build",
  "team": [],
  "properties": {
    "buildNumber": 1,
    "buildVersion": "1.1.0",
    "imageTag": "new-ms-build:latest"
  },
  "relations": {},
  "icon": "Microservice"
}

create_response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities?upsert=true', json=entity_json, headers=headers)
```

:::tip
For security reasons it is recommended to save the `CLIENT_ID` and `CLIENT_SECRET` as [GitLab Variables](https://docs.gitlab.com/ee/ci/variables/#gitlab-cicd-variables), and access them as shown in the example above.
:::

After adding your new Python script to your repository, add the following code to your GitLab CI `yml` file to call your script and update/create a new `microserviceBuild` entity:

```yaml showLineNumbers
run_port:
  stage: deploy
  image: python:3.9
  script:
    - pip install -r port_requirements.txt
    - python create_entity.py


    - PORT_CLIENT_ID=$PORT_CLIENT_ID PORT_CLIENT_SECRET=$PORT_CLIENT_SECRET QUEUED_BY=$CI_PIPELINE_USER_LOGIN GIT_SHA=$CI_COMMIT_SHORT_SHA JOB_NAME=$CI_PIPELINE_ID COLLECTION_URL=$CI_SERVER_URL TEAM_PROJECT=$CI_PROJECT_NAME BUILD_ID=$CI_PIPELINE_ID python port.py

```
## Basic get example

The following example gets the `new-ms-build` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of it's data (for example, the image tag when deploying the latest version of your service).

Add the following snippet to your Python code:

```python showLineNumbers
entity_id = "new-ms-build"
blueprint_id = "microserviceBuild"

get_response = requests.get(f"{API_URL}/blueprints/{blueprint_id}/entities/{entity_id}",
                        headers=headers)
entity = get_response.json()['entity']
print(f"Image tag is: {entity['properties']['imageTag']}")

```

```yaml showLineNumbers
create_entity:
  stage: port_push
  image: python:3.8
  script:
    - pip install -r port_requirements.txt
    - python create_entity.py
  dependencies:
    - docker_push

update_entity:
  stage: port_push
  image: python:3.8
  script:
    - pip install -r port_requirements.txt
    - python update_entity.py
  dependencies:
    - docker_push
    - create_entity
```
The first job `create_entity`, uses the Python Script action to get the `new-ms-build` entity.
The second job `update_entity`, uses the output from the first job, and prints the `imageTag` property of the entity.

## Relation example

The following example adds a `package` entity, in addition to the `microserviceBuild` entity shown in the previous example. In addition, it also adds a `microserviceBuild` relation. The build action will create or update the relation between the 2 existing entities, allowing you to map the package to the microservice build that uses it, Gitlab already has A list of Predefined Variables that you can use https://docs.gitlab.com/ee/ci/variables/predefined_variables.html for some other entity you can get them from GitLab Api https://docs.gitlab.com/ee/api/pipelines.html :

<ExamplePackageBlueprint />

Add the following snippet to your Python code:

```python showLineNumbers
import datetime
...

package_entity_json = {
  "identifier": "example-package",
  "team": [],
  "properties": {
    "version": "v1",
    "committedBy": os.environ['GITLAB_USER_NAME'],
    "commitHash": os.environ['CI_COMMIT_SHA'],
    "actionJob": os.environ['CI_JOB_STATUS'],
    "repoPushedAt": os.environ['CI_JOB_STARTED_AT'],
    "runLink": os.environ['CI_JOB_URL']
  },
  "relations": {
    "microserviceBuild": "new-ms-build"
  },
  "icon": "Package"
}

create_package_response = requests.post(f'{API_URL}/blueprints/package/entities?upsert=true', json=package_entity_json, headers=headers)
print(create_package_response.json())

```

That's it! The entity is created or updated and is visible in the UI.