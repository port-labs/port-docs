import ExampleMSBuildBlueprint from "../\_ci_example_microservice_build_blueprint.mdx";
import ExamplePackageBlueprint from "../\_ci_example_package_blueprint.mdx";

# Examples

## Basic create/update example

In this example we create a blueprint for `microserviceBuild` and then add code to the Jenkins build to create a new entity every build run:

<ExampleMSBuildBlueprint />

:::note
All of the examples assume that `token` is already defined in your Jenkins build as shown [here](./jenkins-deployment.md#fetching-your-api-token).
:::

After creating the blueprint, you can add the following snippet to your Jenkins build to create the new build entity:

```js showLineNumbers
    body = """
        {
            "identifier": "new-ms-build",
            "properties": {
                "buildNumber": "1",
                "buildVersion": "1.1.0",
                "imageTag": "new-ms-build:latest"
            }
        }
    """

    response = httpRequest contentType: "APPLICATION_JSON", httpMode: "POST",
            url: "${API_URL}/v1/blueprints/microserviceBuild/entities?upsert=true&merge=true",
            requestBody: body,
            customHeaders: [
                [name: "Authorization", value: "Bearer ${token}"],
            ]
    println(response.content)
```

## Basic get example

The following example gets the `new-ms-build` entity from the previous example, this can be useful if your CI process creates a build artifact and then references some of it's data (for example, the image tag when deploying the latest version of your service).

Add the following code to your Jenkins build:

```js showLineNumbers
    response = httpRequest contentType: "APPLICATION_JSON", httpMode: "GET",
            url: "${API_URL}/v1/blueprints/microserviceBuild/entities/new-ms-build",
            customHeaders: [
                [name: "Authorization", value: "Bearer ${token}"],
            ]
    println(response.content)
```

## Relation example

The following example adds a `package` entity, in addition to the `microserviceBuild` entity shown in the previous example. In addition, it also adds a `microserviceBuild` relation. The build will create or update the relation between the 2 existing entities, allowing you to map the package to the microservice build that uses it:

<ExamplePackageBlueprint />

Add the following snippet to your GitHub workflow `yml` file:

```js showLineNumbers
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
...
        wrap([$class: 'BuildUser']) {
                def user = env.BUILD_USER_ID
            }
            OffsetDateTime cur_time = OffsetDateTime.now();
            String formatted_time = cur_time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX"));

            def body = """
                    {
                        "identifier": "package-example",
                        "properties": {
                            "version": "v1",
                            "committedBy": "${user}",
                            "runLink": "${env.BUILD_URL}",
                            "repoPushedAt": "${formatted_time}",
                            "actionJob": "${env.JOB_NAME}"
                        },
                        "relations": {
                            "microserviceBuild": "new-ms-build"
                        }
                    }
                    """
            response = httpRequest contentType: "APPLICATION_JSON", httpMode: "POST",
            url: "${API_URL}/v1/blueprints/package/entities?upsert=true&merge=true",
                requestBody: body,
                customHeaders: [
                    [name: "Authorization", value: "Bearer ${token}"],
                ]
            println(response.content)
```

:::note
For this example, the following plugin is a dependency:

- build user vars plugin (>=v1.9)

We also import the following modules at the top of the pipeline, so make sure their signatures are approved in Jenkins:

```
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
```

:::

That's it! The entity is created or updated and is visible in the UI.
