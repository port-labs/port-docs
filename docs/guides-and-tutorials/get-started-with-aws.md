---
sidebar_position: 6
title: Get started with AWS
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import FindCredentials from "/docs/build-your-software-catalog/sync-data-to-catalog/api/\_template_docs/\_find_credentials.mdx";

# Get started with AWS

This guide takes 4 minutes to complete, and aims to quickly integrate your AWS environment into Port.

:::tip Prerequisites

- While it is not mandatory for this guide, we recommend that you complete the [quickstart](/quickstart) before proceeding.
- You will need an active [Port account](https://app.getport.io/).
- The [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli) is required to install the AWS exporter.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is required for authentication. Make sure your AWS `Access key id` and `Secret access key` are set. If not, run `aws configure` in your terminal to configure them.

:::

### The goal of this guide

In this guide we will install Port's AWS exporter, ingest AWS resources into Port, and create a visualization from their data.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers and devops will be track AWS resources and their health & status.
- Platform engineers will be able to create and monitor dashboards & visualizations displaying valuable data from their AWS environments.

### Install Port's AWS exporter

1. Go to your [Port application](https://app.getport.io/), hover over the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. Replace `YOUR-PORT-CLIENT-ID` and `YOUR-PORT-CLIENT-SECRET` in the following command, then copy it and run it in your terminal:

_Note that this command will clone a repository in the current working directory of your terminal_

<details>
<summary><b>AWS exporter installation (click to expand)</b></summary>

```bash showLineNumbers
# Export your Port credentials
export PORT_CLIENT_ID=YOUR-PORT-CLIENT-ID
export PORT_CLIENT_SECRET=YOUR-PORT-CLIENT-SECRET

# Clone the terraform template
git clone https://github.com/port-labs/template-assets.git

cd template-assets/aws

# Initialize the Terraform requirements
terraform init

# Deploy the aws exporter and provide the resources you want to export
terraform apply -var 'resources=["lambda", "s3_bucket"]'
```

</details>

:::info Supported AWS resources
In the snippet above, we only ingest `lambda` and `s3_bucket` resources. You can ingest additional resources by adding them to the `resources` list.  
Other supported resources are `ecs_service`, `sns`, `sqs`, `rds_db_instance`, `dynamodb_table`, and `ec2_instance`.
:::

#### What just happened?

The exporter installation did three things:

1. It created blueprints for the resources you specified in the installation command, you can see them in your [builder](https://app.getport.io/dev-portal/data-model).
2. It created entities for the resources fetched from your AWS environment, you can see them in your [software catalog](https://app.getport.io/catalog).
3. It creates a JSON configuration file in an s3 bucket in your AWS environment, which contains a mapping definition to fill the entities' properties with data from your environment. For example, your [lambdas catalog page](https://app.getport.io/lambdas) contains the following entity with its properties filled:

<img src='/img/guides/awsLambdaEntityPage.png' width='100%' />

<br/><br/>

:::info TIP - Updating your configuration

To make changes to your configuration after installation, use the command described in the [AWS exporter page](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/aws/#changing-the-configuration).

💁🏽 _You don't need to change anything in the configuration for this guide, this is just an FYI_
:::

### Visualize data from your AWS resources

Port's homepage is a dashboard that allows you to create various visualizations of data from your entities.  
Let's create a simple pie chart in our homepage to show the distribution of our `Lambdas` by `Runtime`:

1. Go to your [homepage](https://app.getport.io/homepage).
2. Click on the `+ Add` button in the top right corner, and choose `Pie chart`.
3. Fill the form out like this, then click `Save`:

<img src='/img/guides/awsLambdaPieChartForm.png' width='50%' />

<br/><br/>

You should now see the pie chart in your homepage:

<img src='/img/guides/awsLambdaPieChart.png' width='50%' />

### Conclusion

AWS environments are complex and data-rich. Port's AWS exporter allows you to easily ingest resources from your AWS environment into Port, but this is just the starting point.  
Once your data has been ingested, you can use Port to visualize relevant data, automate routine tasks using self-service actions, track metrics for your resources, and much more.

For a deeper dive into Port's integration with AWS (including examples), see the [AWS integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/aws/) section.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
