import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect ECR repository to a service

This guide aims to cover how to connect an ECR `repository` to an existing service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [Jira installed and configured](#installation) in your environment.

:::

<br/>

## Add tags to repositories in AWS ECR

Tagging repositories in ECR allows you to categorize and filter them. You can use tags to specify a repository that is related to a specific service in Port. In this guide, we will add a tag to tell us what service the repository is related to.

To tag an ECR repository, you can use either the AWS CLI or the ECR console. Here are the basic steps:

### Using the ECR console

1. **Open the Amazon ECR console** and **select the [region](https://console.aws.amazon.com/console/home)** .

2. **Choose "Repositories"** and select the repository you want to tag.

3. **Select "Repository tags"** from the actions menu on the left side.

4. **Choose "Add tags"** and **specify the key-value pairs** for each tag.

### Using the AWS CLI
Run the command:
```bash
aws ecr tag-resource \
  --resource-arn arn:aws:ecr:region:account-id:repository/repository-name \
  --tags Key=tag-key,Value=tag-value
```

This will add a tag with the specified key-value pair to the repository. You can add multiple tags by specifying additional `--tags` parameters.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/create-new-ecr-tag.png' width='60%' border='1px' />

:::note Control the tag key-value pair
Since our ECR `repository` may already have several tags, we will need a mechanism to control how these tags will be related to our `Service` blueprint. A way to achieve this relation is to prefix the tag key with the keyword `port-` and the value would be anything. We will then use JQ to select the keys that starts with this keyword. So, our example tag key will be named `port-auth-service`, which will correspond to a Service entity identified by `auth-service` in Port. Since tag values can be optional, we can leave it blank; only the keys matter to us.
:::

## Create the service relation

Now that Port is synced with our ECR resources, let's reflect the ECR Repository in our services to display the repository associated with a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding ECR Repository.

1. Head back to the [Builder](https://app.getport.io/dev-portal/data-model), choose the `ECR Repository` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/ecr-repo-create-new-relation.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/ecr-repo-fill-relation-details.png' width='60%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant ECR Repository to each of our services. This can be done by adding some mapping logic. Update the `config.json` file from the AWS exporter to:

<details>
<summary><b>`config.json` (Click to expand)</b></summary>

```json showLineNumbers

{
  "resources": [
    {
      "kind": "AWS::ECR::Repository",
      "port": {
        "entity": {
          "mappings": [
            {
              "identifier": ".RepositoryName",
              "title": ".RepositoryName",
              "blueprint": "ecr_repository",
              "properties": {
                "imageTagMutability": ".ImageTagMutability",
                "scanningConfiguration": ".ImageScanningConfiguration",
                "repositoryArn": ".Arn",
                "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .Arn",
                "repositoryUri": ".RepositoryUri",
                "encryptionConfiguration": ".EncryptionConfiguration",
                "lifecyclePolicy": ".LifecyclePolicy",
                "tags": ".Tags"
              },
              "relations": {
                "region": ".Arn | split(\":\") | .[3]",
                "service": ".Tags | keys[] | select(startswith(\"port-\")) | .[6:]"
              }
            }
          ]
        }
      }
    }
  ]
}

```

</details>

:::tip JQ explanation

The JQ below selects all keys that start with the keyword `port-`. It then removes "port-" from each key, leaving only the part that comes after it. It then selects all keys that fits this criteria as a array

```
service: .Tags | keys[] | select(startswith("port-")) | .[6:]
```

:::

What we just did was map the `ECR Repository` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the ECR Repository tag key, the `service` will automatically be linked to it &nbsp;🎉

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/ecr-service-mapping.png' width='60%' border='1px' />

## Conclusion

By following these steps, you can seamlessly connect an ECR repository with an existing service blueprint in Port using tags.

More relevant guides and examples:

- [Port's AWS integration for ECR Repositories](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples#ecr-repositories)
- [Python script to ingest ECR Repositories and Images into Port](https://github.com/port-labs/example-ecr-images)