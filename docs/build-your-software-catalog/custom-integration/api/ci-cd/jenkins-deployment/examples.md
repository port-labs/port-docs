import ExampleImageBlueprint from "../\_ci_example_image_blueprint.mdx";
import ExampleCiJobBlueprint from "../\_ci_example_ci_job_blueprint.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Examples

## Basic create/update example

:::note
For this example, the following plugin is a dependency:

- build user vars plugin (>=v1.9)

:::

In this example you will create blueprints for `ciJob` and `image` entities, and a relation between them. Then you will add some Groovy code to create new entities in Port every time the Jenkins pipeline is triggered:

<ExampleImageBlueprint />

<ExampleCiJobBlueprint />

:::note
The variables `token` and `API_URL` are used in the following examples.
Click [here](./jenkins-deployment.md#fetching-your-api-token) to see how they were defined.

:::

After creating the blueprint, you can add the following snippet to your Jenkins build to create the new build entity:

```js showLineNumbers
// Use the `build users` plugin to fetch the triggering user's ID
wrap([$class: 'BuildUser']) {
        def user = env.BUILD_USER_ID
    }

    def body = """
        {
            "identifier": "new-cijob-run",
            "properties": {
                "triggeredBy": "${user}",
                "runLink": "${env.BUILD_URL}",
            },
            "relations": {
                "image": ["example-image"]
            }
        }
    """

    response = httpRequest contentType: "APPLICATION_JSON", httpMode: "POST",
            url: "${API_URL}/v1/blueprints/ciJob/entities?upsert=true&merge=true&create_missing_related_entities=true",
            requestBody: body,
            customHeaders: [
                [name: "Authorization", value: "Bearer ${token}"],
            ]
```

<PortApiRegionTip/>

:::note
Please notice that you have also created the `image` relation, and added a related image entity called `example-image`. This is the artifact of the ciJob, and you will update it later.
The creation was done using the `create_missing_related_entities=true` flag in the API url, allowing the relation to be created even though the `example-image` entity doesn't exist yet.
:::

## Basic get example

The following example gets the `new-cijob-run` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of its data (for example, the run link of the latest `ciJob`).

Add the following code to your Jenkins build:

```js showLineNumbers
    response = httpRequest contentType: "APPLICATION_JSON", httpMode: "GET",
            url: "${API_URL}/v1/blueprints/ciJob/entities/new-cijob-run",
            customHeaders: [
                [name: "Authorization", value: "Bearer ${token}"],
            ]
    println(response.content)
```

## Relation example

In the following example you will update the `example-image` entity that was automatically created when creating the `ciJob` entity shown in the previous example.

Add the following snippet to your Jenkins Pipeline:

```js showLineNumbers
def body = """
        {
            "identifier": "example-image",
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
        """
response = httpRequest contentType: "APPLICATION_JSON", httpMode: "POST",
url: "${API_URL}/v1/blueprints/image/entities?upsert=true&merge=true",
    requestBody: body,
    customHeaders: [
        [name: "Authorization", value: "Bearer ${token}"],
    ]
```

That's it! The entity is created or updated and is visible in the UI.
