---
displayed_sidebar: null
description: Learn how to create an EKS cluster and deploy your application in Port for scalable and efficient cloud infrastructure.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Create an EKS cluster and deploy a Node.js app

In this guide, we are going to use [self-service actions](/actions-and-automations/create-self-service-experiences/) to demonstrate a workflow that does the following:

- Creates an EKS Cluster.
- Scaffolds a Node.js app that's automatically ingested as an entity by Port.
- Deploys the app to the cluster.

<br/>
🎬 If you would like to follow along to a **video** that implements this guide, check out this one by @TeKanAid 🎬
<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/2Cw4i_FuSC8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

<br/><br/>

## Prerequisites

1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. This guide assumes the presence of a blueprint representing your repositories. If you haven't done so yet, initiate the setup of your GitHub data model by referring to this [guide](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#mapping-repositories-file-contents-and-pull-requests) first.
3. A repository to contain your action resources i.e. the github workflow file.
4. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - AWS Credentials. Follow this [guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html) to create them.
      - `AWS_ACCESS_KEY_ID`: Your AWS access key.
      - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
   - `CREATOR_TOKEN`: A GitHub [personal access token (fine-grained)](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/#creating-personal-access-tokens) that has `Read and Write` permissions on the following scopes: _Administration_, _Contents_.
   * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
   * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
        
5. Your AWS account has access to an [Elastic Container Registry](https://aws.amazon.com/ecr/).


:::tip Starter Repository
Clone the repository [here](https://github.com/port-labs/eks-deploy-guide) to follow along with the guide. The repository contains the following folders:
- `app-templates`: contains the cookiecutter templates for scaffolding apps.
- `terraform`: contains the terraform configuration for creating an EKS cluster.
:::

## Creating the EKS Cluster

1. Create the following blueprints:

<details>

<summary>Region blueprint</summary>

```json showLineNumbers
{
  "identifier": "region",
  "description": "",
  "title": "Region",
  "icon": "AWS",
  "schema": {
    "properties": {
      "link": {
        "type": "string",
        "title": "Link",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<details>

<summary>EKS Cluster blueprint</summary>

```json showLineNumbers
{
  "identifier": "eks",
  "description": "",
  "title": "EKS Cluster",
  "icon": "Service",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "roleArn": {
        "type": "string",
        "title": "Role ARN"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "version": {
        "type": "string",
        "title": "Version"
      },
      "endpoint": {
        "title": "Endpoint",
        "description": "The cluster endpoint",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "region": {
      "title": "Region",
      "target": "region",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<br />

2. Create the file `manage-eks-cluster.yml` in the `.github/workflows` folder of your repository.

<details>

<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="manage-eks-cluster.yml"
name: Manage EKS Cluster

on:
  workflow_dispatch:
    inputs:
      cluster_name:
        description: "Name of the EKS cluster"
        required: true
      region:
        description: "AWS Region for the cluster"
        required: true
      action:
        description: "Action to perform (apply/destroy)"
        required: true
        default: "apply"
      port_context:
        required: true
        description: "Port's payload (who triggered, port_context, etc...)"
        type: string

jobs:
  manage_cluster: # Combine into a single job
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
        working-directory: ./terraform

    if: ${{ github.event.inputs.action == 'apply' || github.event.inputs.action == 'destroy' }}

    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
      PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
      CLUSTER_NAME: ${{ github.event.inputs.cluster_name }}
      REGION: ${{ github.event.inputs.region }}
      ACTION: ${{ github.event.inputs.action }}
      PORT_RUN_ID: ${{ fromJson(inputs.port_context).runId }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create a log message (apply)
        if: ${{ github.event.inputs.action == 'apply' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Initiating creation of EKS cluster: ${{ env.CLUSTER_NAME }}."

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1

      - name: Terraform Init
        run: terraform init

      - name: Terraform Format
        run: terraform fmt

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Apply
        id: terraform_apply
        if: ${{ github.event.inputs.action == 'apply' }}
        run: terraform apply -auto-approve
        env:
          TF_VAR_cluster_name: ${{ env.CLUSTER_NAME }}
          TF_VAR_region: ${{ env.REGION }}
          TF_VAR_port_run_id: ${{ env.PORT_RUN_ID }}

      - name: Terraform Destroy
        if: ${{ github.event.inputs.action == 'destroy' }}
        run: terraform destroy -auto-approve
        env:
          TF_VAR_cluster_name: ${{ env.CLUSTER_NAME }}
          TF_VAR_region: ${{ env.REGION }}
          TF_VAR_port_run_id: ${{ env.PORT_RUN_ID }}

      - name: Inform Port about the status of the EKS cluster creation
        if: ${{ github.event.inputs.action == 'apply' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "SUCCESS"
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "EKS cluster creation has been completed: ${{ env.CLUSTER_NAME }}"

      - name: Inform Port about the status of the EKS cluster destruction
        if: ${{ github.event.inputs.action == 'destroy' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "SUCCESS"
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "EKS cluster destruction has been completed: ${{ env.CLUSTER_NAME }}"
```

</details>

<br />

3. Create a Port action against the `EKS Cluster` blueprint:
    - Go to the [self-service](https://app.getport.io/self-serve) page.
    - Click on the `+ New Action` button.
    - Click on the `{...} Edit JSON` button in the top right corner.
    - Copy and paste the following JSON configuration into the editor.
    - Click `Save`

<details>

<summary>Port Action: Create EKS Cluster</summary>

   :::tip Replace the placeholders
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json
{
  "identifier": "eks_create_eks_cluster",
  "title": "Create an EKS cluster",
  "icon": "AmazonEKS",
  "description": "An action that creates an eks cluster",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "cluster_name": {
          "title": "Cluster Name",
          "description": "The name of the EKS Cluster",
          "icon": "AmazonEKS",
          "type": "string"
        },
        "region": {
          "type": "string",
          "blueprint": "region",
          "title": "Region",
          "format": "entity"
        }
      },
      "required": [
        "cluster_name"
      ],
      "order": [
        "cluster_name"
      ]
    },
    "blueprintIdentifier": "eks"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "manage-eks-cluster.yml",
    "workflowInputs": {
      "cluster_name": "{{ .inputs.\"cluster_name\" }}",
      "region": "{{ .inputs.\"region\" }}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

<br />

4. Create the following Terraform configuration in a `terraform` folder at the root of your GitHub repository:

    1. `main.tf` - This file will contain the resource blocks which define the EKS Cluster to be created in AWS and the entity to be created in Port.
    2. `variables.tf` – This file will contain the variable declarations that will be used in the resource blocks e.g. the Port credentials and Port run id.
    3. `output.tf` – This file will contain outputs from the cluster creation like the endpoint.
    4. `terraform.tf` - This file contains the definitions of all the providers we will use.

<details>
  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
provider "aws" {
  region = var.region
}

# Filter out local zones, which are not currently supported 
# with managed node groups
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

locals {
  cluster_name = var.cluster_name == "" ? "education-eks-${random_string.suffix.result}" : var.cluster_name
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "education-vpc"

  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = 1
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"

  }

  eks_managed_node_groups = {
    one = {
      name = "node-group-1"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 3
      desired_size = 2
    }

    two = {
      name = "node-group-2"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }
}


# https://aws.amazon.com/blogs/containers/amazon-ebs-csi-driver-is-now-generally-available-in-amazon-eks-add-ons/ 
data "aws_iam_policy" "ebs_csi_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

module "irsa-ebs-csi" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "4.7.0"

  create_role                   = true
  role_name                     = "AmazonEKSTFEBSCSIRole-${module.eks.cluster_name}"
  provider_url                  = module.eks.oidc_provider
  role_policy_arns              = [data.aws_iam_policy.ebs_csi_policy.arn]
  oidc_fully_qualified_subjects = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
}

resource "aws_eks_addon" "ebs-csi" {
  cluster_name             = module.eks.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.20.0-eksbuild.1"
  service_account_role_arn = module.irsa-ebs-csi.iam_role_arn
  tags = {
    "eks_addon" = "ebs-csi"
    "terraform" = "true"
  }
}


# Port resources
resource "port_entity" "eks_cluster" {
  identifier = module.eks.cluster_arn
  title      = module.eks.cluster_name
  blueprint  = "eks"
  run_id     = var.port_run_id
  properties = {
    string_props = {
      "version"  = module.eks.cluster_version,
      "name"     = module.eks.cluster_name,
      "endpoint" = module.eks.cluster_endpoint,
      "roleArn"  = module.eks.cluster_iam_role_arn
    }
  }
  relations = {
    single_relations = {
      "region" = var.region
    }
  }

  depends_on = [module.eks.cluster_name]
}
```

</details>

<details>
  
  <summary><b>variables.tf</b></summary>
  :::note
  Replace the default `region` with your own preferred region.
  :::

```hcl showLineNumbers title="variables.tf"
variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Version of the EKS cluster"
  type        = string
  default     = "1.29"
  
}

variable "port_run_id" {
  type        = string
  description = "The runID of the action run that created the entity"
  default     = ""
}
```

</details>

<details>
<summary><b>output.tf</b></summary>
  
```hcl showLineNumbers title="output.tf"
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "region" {
  description = "AWS region"
  value       = var.region
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}
```

</details>


<details>
<summary><b>terraform.tf</b></summary>
  

```hcl  showLineNumbers title="terraform.tf"
terraform {
  
  # uncomment for terraform cloud
  # cloud {
  #   workspaces {
  #     name = "test"
  #   }
  # }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.7.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.1"
    }

    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0.4"
    }

    cloudinit = {
      source  = "hashicorp/cloudinit"
      version = "~> 2.3.2"
    }

    port = {
      source  = "port-labs/port-labs"
      version = "2.0.3"
    }
  }

  required_version = "~> 1.3"
}
```
</details>

<br />

5. Now, create a cluster using the action.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/createAndDeployCluster.png' width='45%' border='1px' />

## Scaffolding a Node.js app

1. On the [self-service](https://app.getport.io/self-serve) page, create the Port action against the `Repository` blueprint. This will trigger the GitHub workflow.
    - Click on the `+ New Action` button.
    - Click on the `{...} Edit JSON` button in the top right corner.
    - Copy and paste the following JSON configuration into the editor.
    - Click `Save`

<details>

:::tip Replace the placeholders
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

<summary>Port Action: Scaffold Node App</summary>

```json showLineNumbers
{
  "identifier": "repository_scaffold_node_app",
  "title": "Scaffold Node App",
  "description": "Scaffold a node.js app",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "project_name": {
          "title": "Project Name",
          "description": "The name of the project",
          "type": "string"
        },
        "description": {
          "title": "Description",
          "type": "string"
        },
        "repo_name": {
          "icon": "DefaultProperty",
          "title": "Repository Name",
          "type": "string"
        }
      },
      "required": [
        "project_name",
        "repo_name"
      ],
      "order": [
        "project_name",
        "repo_name",
        "description"
      ]
    },
    "blueprintIdentifier": "repository"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "phalbert",
    "repo": "azure-resources-terraform",
    "workflow": "scaffold-app.yml",
    "workflowInputs": {
      "project_name": "{{.inputs.\"project_name\"}}",
      "repo_name": "{{.inputs.\"repo_name\"}}",
      "template": "{{.inputs.\"template\"}}",
      "description": "{{.inputs.\"description\"}}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

<br />

2. Create the file `scaffold-app.yml` in the `.github/workflows` folder of your repository.

<details>

<summary>GitHub workflow to scaffold a Node.js app</summary>

:::tip Cookiecutter Template
To implement this workflow, you'll need a cookiecutter template for scaffolding the application. You can either create one or utilize our starter [repository](https://github.com/port-labs/eks-deploy-guide).
:::

```yaml showLineNumbers
name: Scaffold Node.js App

on:
  workflow_dispatch:
    inputs:
      project_name:
        description: "Name of the app"
        required: true
      repo_name:
        description: "Slug of the app"
        required: true
      template:
          description: "Template to use for the app"
          required: false
          default: "nodejs"
      description:
        description: "Description of the app"
        required: true
        default: "A simple app"
      port_context:
        required: true
        description: "Port's payload (who triggered, port_context, etc...)"
        type: string

jobs:
  scaffold_app:
    runs-on: ubuntu-latest

    env:
      PORT_RUN_ID: ${{ fromJson(github.event.inputs.port_context).runId }}
      

    steps:
      - name: Create a log message (post-action)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Starting scaffolding of app: ${{ github.event.inputs.project_name }}"

      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check if Repository Exists
        id: check_repo
        run: |
          REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X GET \
            -H "Authorization: Bearer ${{ secrets.GH_TOKEN }}" \
            "https://api.github.com/repos/${{ github.repository_owner }}/${{ github.event.inputs.repo_name }}")
           
          echo "HTTP Status: $REPO_EXISTS"

          if [ $REPO_EXISTS -eq 200 ]; then
            echo "Repository already exists."
            echo "repo_exists=true" >> $GITHUB_ENV
          else
            echo "Repository does not exist."
            echo "repo_exists=false" >> $GITHUB_ENV
          fi

      - name: Create a log message (post-action)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Creating ECR repository: ${{ github.event.inputs.repo_name }}"

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Login to AWS ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Create ECR Repository
        id: create-ecr-repo
        run: |
          repositoryUri=$(aws ecr create-repository --repository-name "${{ github.event.inputs.repo_name }}" --output json | jq -r '.repository.repositoryUri')
          echo "ECR_REPOSITORY_URI=$repositoryUri" >> $GITHUB_ENV

      - name: Run Cookiecutter
        id: cookiecutter
        uses: andrewthetechie/gha-cookiecutter@main
        with:
          # path to what you checked out
          template: ./app-templates/${{ github.event.inputs.template }}
          outputDir: ./tmp
          cookiecutterValues: '{
            "project_name": "${{ github.event.inputs.project_name }}",
            "directory_name": "${{ github.event.inputs.repo_name }}",
            "description": "${{ github.event.inputs.description }}",
            "author_name": "Port",
            "github_username": "${{ github.repository_owner }}",
            "image_repository": "${{ env.ECR_REPOSITORY_URI }}"
            }'

      - name: Create a log message (post-action)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Creating repository for app: ${{ github.event.inputs.project_name }}"

      - name: Create GitHub Repository
        id: create-repo
        if: ${{ env.repo_exists == 'false' }}
        run: |
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${{ secrets.GH_TOKEN }}" \
            -d '{"name": "${{ github.event.inputs.repo_name }}", "private": true, "description": "${{ github.event.inputs.description }}"}' \
            "https://api.github.com/user/repos")

          echo "HTTP Status: $HTTP_STATUS"

          if [ $HTTP_STATUS -eq 201 ]; then
            echo "Repository created successfully."
          else
            echo "Failed to create repository. HTTP Status: $HTTP_STATUS"
            exit 1
          fi

      - name: Create a log message (post-action)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Committing new app files: ${{ github.event.inputs.project_name }}"

      - name: Commit files
        working-directory: ./tmp/${{ github.event.inputs.repo_name }}
        run: |
          sudo chmod -R 777 .
          git init
          git config user.name "GitHub Actions Bot"
          git config user.email "<>"
          git add .
          git commit -m "Initial commit"
          git branch -M main
          git remote add origin https://${{ github.repository_owner }}:${{ secrets.GH_TOKEN }}@github.com/${{ github.repository_owner }}/${{ github.event.inputs.repo_name }}.git
          git push -u origin main

      - name: Create a log message (post-action)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "SUCCESS"
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Finished scaffolding of app: ${{ github.event.inputs.project_name }}"
```

</details>

<br />

3. Scaffold an application using the `nodejs` template.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/createAndDeployScaffold.png' width='45%' border='1px' />

<br />
<br />

This action will create the following:
- A GitHub repository containing a starter Node.js app.
- Since the repository is created with a `port.yml` file, the Port GitHub app will create the repository entity automatically.
- An ECR repository for the app.


## Deploy the app

1. On the [self-service](https://app.getport.io/self-serve) page, create a Port action against the `Repository` blueprint called `Deploy to EKS`.

<details>

<summary>Port Action: Deploy to EKS</summary>

   :::tip Replace the placeholders
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "deploy_to_eks",
  "title": "Deploy to EKS",
  "description": "Build and deploy an image to EKS",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "cluster": {
          "type": "string",
          "blueprint": "eks",
          "title": "Cluster",
          "format": "entity"
        }
      },
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "eks"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "build-and-deploy.yml",
    "workflowInputs": {
      "cluster": "{{.inputs.\"cluster\"}}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

<br />

2. Create the file `build-and-deploy.yml` in the `.github/workflows` folder of your repository. (This is the same repository you've been using for the other workflows.)

<details>

<summary>GitHub workflow to deploy a Node.js app</summary>

```yaml showLineNumbers
name: Build and Deploy Image to EKS

on:
  workflow_dispatch:
    inputs:
      cluster:
        description: 'Deployment cluster'
        required: true
      port_context:
        required: true
        description: "Action and general port_context (blueprint, run id, etc...)"
        type: string

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      REPO_URL: ${{ fromJson(inputs.port_context).entity.properties.url }}
      TRIGGERED_BY: ${{ fromJson(inputs.port_context).trigger.by.user.email || github.actor }}

    steps:
    - name: Extract repository owner and name
      run: |
        repo_owner=$(echo "${REPO_URL}" | awk -F/ '{print $4}')
        repo_name=$(echo "${REPO_URL}" | awk -F/ '{print $5}')

        echo "REPO_OWNER=$repo_owner" >> $GITHUB_ENV
        echo "REPO_NAME=$repo_name" >> $GITHUB_ENV
      shell: bash

    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        repository: ${{ env.REPO_OWNER }}/${{ env.REPO_NAME }}
        token: ${{ secrets.CREATOR_TOKEN }}

    - name: Get short commit ID
      id: get-commit-id
      run: |
        echo "COMMIT_SHORT=$(git rev-parse --short HEAD)" >> $GITHUB_ENV
        echo "COMMIT_SHA=$(git rev-parse HEAD)" >> $GITHUB_ENV
      shell: bash
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-region: ${{ secrets.AWS_REGION }}
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Login to AWS ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: ${{ env.REPO_NAME }}
      run: |
        # Build and push image with short commit ID and triggered by as tags
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT

        # Tag image with commit ID and push
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHA
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHA

        # Tag image with triggered by and push
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:actor-${TRIGGERED_BY//[^a-zA-Z0-9]/-}
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:actor-${TRIGGERED_BY//[^a-zA-Z0-9]/-}

        # Tag image with PR ID and push
        if [ "${{ github.event_name }}" == "pull_request" ]; then
          PR_ID=$(echo "${{ github.event.pull_request.number }}" | tr -d '/')
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_ID
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_ID
        fi

        # Tag image with workflow ID and push
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:build-${{ github.run_id }}
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:build-${{ github.run_id }}
        
        # Tag image with latest and push
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

    - name: Notify Port
      uses: port-labs/port-github-action@v1
      with:
        clientId: ${{ secrets.PORT_CLIENT_ID }}
        clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
        operation: PATCH_RUN
        baseUrl: https://api.getport.io
        runId: ${{ fromJson(inputs.port_context).runId }}
        logMessage: |
          Built and pushed image to ECR

    - name: Extract cluster name and region from arn
      run: |
        cluster_arn=$(echo "${{ github.event.inputs.cluster }}" | awk -F/ '{print $NF}')
        cluster_name=$(echo "${cluster_arn}" | awk -F: '{print $NF}')
        cluster_region=$(echo "${{ github.event.inputs.cluster }}" | awk -F: '{print $4}')

        echo "CLUSTER_NAME=$cluster_name" >> $GITHUB_ENV
        echo "CLUSTER_REGION=$cluster_region" >> $GITHUB_ENV
      

    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --name ${{ env.CLUSTER_NAME }} --region ${{ env.CLUSTER_REGION }}
        kubectl apply -f manifests/deployment.yml
        kubectl apply -f manifests/service.yml

    - name: Notify Port
      uses: port-labs/port-github-action@v1
      with:
        clientId: ${{ secrets.PORT_CLIENT_ID }}
        clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
        operation: PATCH_RUN
        status: "SUCCESS"
        baseUrl: https://api.getport.io
        runId: ${{ fromJson(inputs.port_context).runId }}
        logMessage: |
            Deployed to EKS 
```

</details>

<br />

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/createAndDeployTest.png' width='90%' border='1px' />

<br />
<br />

The deploy action will:
1. Build the docker image.
2. Push it to the ECR repository.
3. Deploy it to the cluster.

Done! 🎉


## Augment It!
Here are a few additional enhancements you can make to the actions in this guide:
- Add more templates to the Scaffolding action.
- Extend the scaffold action by including a step that calls the Port API to trigger the deploy action on the newly created repository.

These enhancements will provide more flexibility and automation to your workflow.
