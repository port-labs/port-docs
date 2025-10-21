# Manage Port across environments

import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

Managing multiple environments (such as `development`, `staging`, and `production`) is a fundamental practice in modern software delivery. Each environment serves a distinct purpose, and promoting resources across these environments must be done in a controlled, repeatable way.

This approach helps ensure consistency, reduces the risk of errors, and enables safer deployments.  
By managing resources across environments, teams can catch issues early, maintain high quality, and deliver changes to users with confidence.

The guide presents two approaches to achieve this:

1. Using IaC (Terraform) to define and manage resources.
2. Using Port resource definitions (in JSON format) in a dedicated Git repository to define and manage resources.

## Prerequisites

- A Port account with the [onboarding process](https://docs.port.io/getting-started/overview) completed.

- For the first approach, you will need to have a Terraform account and be able to create and manage resources in your desired environment.

- For the second approach, you will need to have a dedicated Git repository to store the resource definitions.

## Approach 1: IaC (Terraform)

Port offers a [Terraform provider](https://registry.terraform.io/providers/port-labs/port/latest/docs) that allows you to define and manage portal resources (blueprints, scorecards, automations, etc.) as Terraform code.

Before you dive into the details of the approach, we recommend to go over best practices when using Terraform & Port:

<details>
<summary><b>Best practices when using Terraform & Port (click to expand)</b></summary>

1. **Define Terraform scope**  
   Decide which resources you want to manage with Terraform (e.g. pages, catalog, integrations). Use Terraform for resources you already manage as code (cloud accounts, databases, Lambdas).  
   For data sourced from other systems, prefer Port’s native integrations (GitHub, Kubernetes, cloud providers, Terraform Cloud) to keep data up to date. It’s often easiest to start with the UI, then transition to Terraform using the [Import Generator](https://github.com/port-experimental/terraform-import-generator).

2. **Pin and configure the provider**  
   - Pin provider versions (e.g., `~> 2.x`) and upgrade intentionally.
   - Obtain your Port client ID & client secret, and choose the EU/US API base URL that matches your account region. See [documentation](https://docs.port.io/build-your-software-catalog/custom-integration/iac/terraform/) for more details.
   - Follow standard Terraform practice to configure the provider, like aliases and inheritance. 

3. **Structure your repository and state**  
   - Use a remote backend with state locking (e.g., Terraform Cloud, S3+DynamoDB) to prevent conflicts.
   - Separate state files per environment (prod, stage) and enforce plan/apply gates in CI.

4. **Model catalog as code with `port_blueprint`**  
   Define blueprints in Terraform so your catalog schema (properties, relations, calculations, etc.) is versioned and reviewable. Refer to documentation for examples covering all property types and advanced features like mirror and calculation properties.

5. **Manage entities with `port_entity`**  
   - Define entities with all of their relevant properties.  
   The provider uses a create/override strategy: any property omitted in Terraform will be reset to empty.  
   - Always model the full desired entity shape in code.  
   - Use registry options like `create_missing_related_entities`, and fields such as `teams` and `run_id` for traceability.

6. **Extend system blueprints properly**  
   `User` and `Team` are system blueprints—extend them using `port_system_blueprint` (not `port_blueprint`) and import them to state before making changes. Supported from provider `v2.2.0`.

7. **Import existing resources before management**  
   If a resource already exists (via UI or integration), import it to state before managing with Terraform.  
   - Blueprints: `terraform import port_blueprint.my "blueprintId"`  
   - Entities: `terraform import port_entity.my "blueprintId:entityId"`  
   - For other resources (scorecards, actions, webhooks, integrations), refer to the [documentation](https://docs.port.io/build-your-software-catalog/custom-integration/iac/terraform/#import-existing-data-to-the-terraform-state) for import forms.

8. **Define self-service actions and permissions in code**  
   Use `port_action` to codify self-service experiences (inputs, triggers, conditions).  
   For actions that invoke Terraform (e.g., GitHub workflow, Terraform Cloud run), store credentials in Port secrets or use an execution agent.

9. **Manage integrations declaratively**  
   Use `port_integration` to manage configuration and mappings for existing integrations.  
   Import by installation ID, then manage mapping in code.

10. **Promote changes safely**  
   Follow standard Terraform best practices: run `terraform validate` and `plan` in CI, and require peer review before running `apply`.  
   Optionally, expose “plan & apply” as a Port action for controlled no-code provisioning flows (e.g., a user [requests an S3 bucket](https://docs.port.io/guides/all/terraform-plan-and-apply-aws-resource/), the action runs Terraform and writes the entity back).

11. **Separate regions, accounts, and environments**  
   For multiple Port accounts or regions (EU/US), set the correct `base_url` per environment or use provider aliases. Avoid mixing resources across environments.

12. **Handle evolution and breaking changes deliberately**  
   For refactors (e.g., renaming properties or relations), use dedicated API endpoints and plan changes carefully to avoid breaking dependencies, especially when multiple blueprints or entities are involved.

</details>

The following steps outline the recommended process for managing your resources across environments using Terraform, while maintaining consistency and minimizing errors:

**Set up development environment**  
   Using Port's UI in your development environment, create the resources you want to promote to your production environment.  
   As an example, we will use the `Service` blueprint, and the `Own services` self-service action. These two resources are automatically created when you create a Port account.

**Update Terraform configuration**  
   In your Terraform configuration, add the following import blocks:

   <details>
   <summary><b>`import` blocks (click to expand)</b></summary>
    ```hcl showLineNumbers
    terraform {
      required_providers {
        port = {
          source  = "port-labs/port-labs"
          version = "~> 2.0.3"
        }
      }
    }

    provider "port" {
      client_id = "{YOUR CLIENT ID}"     # or set the environment variable PORT_CLIENT_ID
      secret    = "{YOUR CLIENT SECRET}" # or set the environment variable PORT_CLIENT_SECRET
      base_url  = "https://api.getport.io"
    }

    import {
      id = "set_ownership"
      to = port_action.own_services
    }

    import {
      id = "service"
      to = port_blueprint.service
    }
    ```
    </details>

**Generate Terraform configuration**  
   Using the Terraform CLI, generate configuration files from the resources created in your development environment:
   
   ```bash showLineNumbers
   terraform init
   terraform plan -generate-config-out=generated.tf
   ```

**Validate the configuration**  
   Check the resulting `generated.tf` file, ensuring it includes the desired configuration for both the `Own services` and `Service` resources.

**Copy and adjust for Production**  
   - Copy the `generated.tf` file to your production environment.
   - Remove the provider blocks - since the provider is usually set at a higher level, remove the `provider = port-labs` lines from both resources.
   - Remove null properties - clean up the configuration by removing all properties that are set to `null`.

**Apply Changes in Production**  
   Before applying any changes, run `terraform plan` in your production environment to view the planned changes and ensure everything is set up correctly.
   
   Once you're satisfied with the plan, run `terraform apply` to apply the changes to your production environment.

:::info Sync changes between UI and IaC

After `import`ing, changes made to the UI will **not** be automatically reflected in your IaC configuration.  
To sync changes, you can:
- Refrain from using the UI to change resources that are configured with IaC, and only use IaC to make changes.
- Remember to always update the relevant IaC files after making changes via the UI.

:::

### Dependency management

#### Dynamic referencing

If you have dependencies between two or more resources, you will need to manually handle them using dynamic referencing.

For example, a self-service action that creates new instances of a blueprint will depend on that blueprint.  
In such a case, use dynamic referencing instead of hardcoding the blueprint identifier:

```hcl showLineNumbers
resource "port_action" "scaffold_a_new_service" {
  identifier                    = "scaffold_a_new_service"
  required_approval             = "false"
  self_service_trigger = {
    # highlight-next-line
    blueprint_identifier = port_blueprint.service.identifier # instead of "service"
    operation            = "DAY-2"
    user_properties = {
    }
  }
…
}
```

#### Resource creation order

When resources depend on each other, Terraform may attempt to create them in the wrong order, leading to dependency errors. You can resolve this using the `depends_on` meta-argument to explicitly define the order of resource creation.

For example, if you have two blueprints where one has a relation to the other, you can ensure proper creation order:

```hcl showLineNumbers
resource "port_blueprint" "githubRepository" {
  identifier = "githubRepository"
  title      = "GitHub Repository"
  # ... other configuration
}

resource "port_blueprint" "service" {
  identifier = "service"
  title      = "Service"
  
  relations = {
    "repository" = {
      title = "Repository"
      target = "githubRepository"
    }
  }
  
  # highlight-next-line
  depends_on = [port_blueprint.githubRepository]
}
```

The `depends_on` meta-argument ensures that:
- The `githubRepository` blueprint is created first
- The `service` blueprint is created after the `githubRepository` blueprint, allowing the relation to be properly established

**Note:** Use `depends_on` sparingly and only when Terraform cannot automatically infer dependencies from resource references. Overuse can make your configuration harder to maintain and may hide implicit dependencies.

## Approach 2: JSON definitions (GitOps)

Being an API-first solution, Port allows you to define portal resources (blueprints, scorecards, automations, etc.) as JSON objects.  
This approach demonstrates how to manage your resource definitions in a dedicated Git repository.

1. **Organize your Git repository**  
   In your dedicated Git repository, create a folder for each environment you want to manage (e.g. `development`, `production`, etc.).  
   In each environment folder, create a folder for each resource type (e.g. `blueprints`, `scorecards`, `automations`, etc.).  
   
2. **Set up development environment**  
   - Using Port's UI in your development environment, create the resources you want to promote to your production environment.  

   - Save the resource definitions to a JSON file. This can be done in the following ways:
     - Using [Port's API](https://docs.port.io/api-reference/port-api), call the relevant GET endpoint to retrieve the definition/s of the desired resource type.  
     - Using Port's UI, click on the `...` button in the top right corner of a resource, then click `Edit`.  
      
   - Save your JSON definitions in the `development` folder in your Git repository.

3. **Promote to production environment**  
   - Copy the relevant JSON definitions to the `production` folder in your Git repository.
   - Using [Port's API](https://docs.port.io/api-reference/port-api), call the relevant POST endpoint to apply the resource definitions to your production environment.

:::info Dependency management

In some cases, resources may depend on each other. For example, **blueprint A** may have a relation to **blueprint B**, meaning that blueprint B must be created before blueprint A.

In such cases, you will need to manually handle the dependencies between resources and create them in the correct order.
:::

### Examples

#### Export data using a CI/CD workflow

Below are examples of CI/CD workflows that automatically export data from your development environment using Port's API and save it to your dedicated repository.

These workflows export resource definitions (such as blueprints, scorecards, and actions) from one of your Port environments using Port's API, and save them as JSON files in the dedicated repository under the appropriate environment folder.

**What these workflows do:**

- **Authenticate** with Port using your API credentials
- **Export** resource definitions (blueprints, scorecards, actions) from your Port environment
- **Save** the exported JSON files to your Git repository in organized folders (`development/blueprints/`, `development/scorecards/`, `development/actions/`)
- **Commit** the changes back to your repository for version control

This creates a backup of your Port configuration and enables you to track changes over time. The exported files are saved in a structure that matches what the promotion workflows expect to find.

**Prerequisites**

Generate API credentials for your Port development environment and store them as CI/CD variables:
- GitHub: Repository secrets named `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`
- GitLab: Project variables named `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`
- Azure DevOps: Pipeline variables named `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="cicd-platform" queryString>
<TabItem value="github" label="GitHub workflow">

<details>
<summary><b>`export-port-data.yml` (click to expand)</b></summary>
```yaml showLineNumbers
name: Export Port Data to Repository

on:
  workflow_dispatch:
    inputs:
      export_type:
        description: 'Type of data to export'
        required: true
        type: choice
        options:
          - all
          - blueprints
          - scorecards
          - actions
      blueprint_filter:
        description: 'Specific blueprint to export (optional)'
        required: false
        type: string

env:
  PORT_API_URL: "https://api.getport.io/v1"
  EXPORT_DIR: "development"

jobs:
  export-port-data:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm install -g jq
          
      - name: Get Port Access Token
        id: get_token
        run: |
          echo "Getting Port access token..."
          access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
            --header 'Content-Type: application/json' \
            --data-raw '{
                "clientId": "${{ secrets.PORT_CLIENT_ID }}",
                "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }' | jq '.accessToken' | sed 's/"//g')
          
          if [ -z "$access_token" ] || [ "$access_token" = "null" ]; then
            echo "Failed to get access token"
            exit 1
          fi
          
          echo "access_token=$access_token" >> $GITHUB_ENV
          echo "✅ Successfully obtained access token"
          
      - name: Create export directories
        run: |
          mkdir -p $EXPORT_DIR/blueprints
          mkdir -p $EXPORT_DIR/scorecards
          mkdir -p $EXPORT_DIR/actions
          echo "Created export directories for resource types"
          
      - name: Export Blueprints
        if: ${{ github.event.inputs.export_type == 'blueprints' || github.event.inputs.export_type == 'all' }}
        run: |
          echo "📋 Exporting blueprints..."
          
          # Get all blueprints
          blueprints_response=$(curl -X GET "$PORT_API_URL/blueprints" \
            -H "Authorization: Bearer ${{ env.access_token }}" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$blueprints_response" ]; then
            echo "$blueprints_response" | jq '.' > "$EXPORT_DIR/blueprints/blueprints.json"
            
            # Count blueprints
            blueprint_count=$(echo "$blueprints_response" | jq '.blueprints | length')
            echo "✅ Exported $blueprint_count blueprints"
            
            # Export individual blueprint definitions if requested
            if [ -n "${{ github.event.inputs.blueprint_filter }}" ]; then
              blueprint_id="${{ github.event.inputs.blueprint_filter }}"
              echo "📄 Exporting detailed definition for blueprint: $blueprint_id"
              
              blueprint_detail=$(curl -X GET "$PORT_API_URL/blueprints/$blueprint_id" \
                -H "Authorization: Bearer ${{ env.access_token }}" \
                -H "Content-Type: application/json")
              
              if [ $? -eq 0 ] && [ -n "$blueprint_detail" ]; then
                echo "$blueprint_detail" | jq '.' > "$EXPORT_DIR/blueprints/$blueprint_id.json"
                echo "✅ Exported detailed definition for blueprint: $blueprint_id"
              fi
            fi
          else
            echo "❌ Failed to export blueprints"
            exit 1
          fi
          
      - name: Export Scorecards
        if: ${{ github.event.inputs.export_type == 'scorecards' || github.event.inputs.export_type == 'all' }}
        run: |
          echo "📊 Exporting scorecards..."
          
          scorecards_response=$(curl -X GET "$PORT_API_URL/scorecards" \
            -H "Authorization: Bearer ${{ env.access_token }}" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$scorecards_response" ]; then
            echo "$scorecards_response" | jq '.' > "$EXPORT_DIR/scorecards/scorecards.json"
            
            scorecard_count=$(echo "$scorecards_response" | jq '.scorecards | length')
            echo "✅ Exported $scorecard_count scorecards"
          else
            echo "❌ Failed to export scorecards"
            exit 1
          fi
          
      - name: Export Actions
        if: ${{ github.event.inputs.export_type == 'actions' || github.event.inputs.export_type == 'all' }}
        run: |
          echo "⚡ Exporting actions..."
          
          actions_response=$(curl -X GET "$PORT_API_URL/actions" \
            -H "Authorization: Bearer ${{ env.access_token }}" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$actions_response" ]; then
            echo "$actions_response" | jq '.' > "$EXPORT_DIR/actions/actions.json"
            
            action_count=$(echo "$actions_response" | jq '.actions | length')
            echo "✅ Exported $action_count actions"
          else
            echo "❌ Failed to export actions"
            exit 1
          fi
          
      - name: Commit exported data
        run: |
          echo "💾 Committing exported data to repository..."
          
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          
          git add "$EXPORT_DIR/"
          
          if git diff --staged --quiet; then
            echo "ℹ️ No changes to commit"
          else
            git commit -m "Export Port data

            - Export type: ${{ github.event.inputs.export_type }}
            - Blueprint filter: ${{ github.event.inputs.blueprint_filter || 'None' }}
            - GitHub run: ${{ github.run_id }}"
            
            git push
            echo "✅ Exported data committed to repository"
          fi
```
</details>

**Usage (GitHub CLI):**
```bash
# Export all blueprints, scorecards, and actions
gh workflow run export-port-data.yml -f export_type=all

# Export specific blueprint
gh workflow run export-port-data.yml \
  -f export_type=blueprints \
  -f blueprint_filter=service
```

</TabItem>
<TabItem value="gitlab" label="GitLab pipeline">

<details>
<summary><b>`.gitlab-ci.yml` (click to expand)</b></summary>
```yaml showLineNumbers
stages:
  - export

variables:
  PORT_API_URL: "https://api.getport.io/v1"
  EXPORT_DIR: "development"

export-port-data:
  stage: export
  image: node:18
  rules:
    - if: $CI_PIPELINE_SOURCE == "web"
  variables:
    EXPORT_TYPE: $EXPORT_TYPE
    BLUEPRINT_FILTER: $BLUEPRINT_FILTER
  before_script:
    - npm install -g jq
    - git config --global user.email "gitlab-ci@gitlab.com"
    - git config --global user.name "GitLab CI"
  script:
    - echo "Getting Port access token..."
    - |
      access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "clientId": "${PORT_CLIENT_ID}",
            "clientSecret": "${PORT_CLIENT_SECRET}"
        }' | jq '.accessToken' | sed 's/"//g')
      
      if [ -z "$access_token" ] || [ "$access_token" = "null" ]; then
        echo "Failed to get access token"
        exit 1
      fi
      
      echo "access_token=$access_token" >> $GITHUB_ENV
      echo "✅ Successfully obtained access token"
    - mkdir -p $EXPORT_DIR/blueprints
    - mkdir -p $EXPORT_DIR/scorecards
    - mkdir -p $EXPORT_DIR/actions
    - echo "Created export directories for resource types"
    - |
      if [ "$EXPORT_TYPE" = "blueprints" ] || [ "$EXPORT_TYPE" = "all" ]; then
        echo "📋 Exporting blueprints..."
        
        blueprints_response=$(curl -X GET "$PORT_API_URL/blueprints" \
          -H "Authorization: Bearer $access_token" \
          -H "Content-Type: application/json")
        
        if [ $? -eq 0 ] && [ -n "$blueprints_response" ]; then
          echo "$blueprints_response" | jq '.' > "$EXPORT_DIR/blueprints/blueprints.json"
          
          blueprint_count=$(echo "$blueprints_response" | jq '.blueprints | length')
          echo "✅ Exported $blueprint_count blueprints"
          
          if [ -n "$BLUEPRINT_FILTER" ]; then
            blueprint_id="$BLUEPRINT_FILTER"
            echo "📄 Exporting detailed definition for blueprint: $blueprint_id"
            
            blueprint_detail=$(curl -X GET "$PORT_API_URL/blueprints/$blueprint_id" \
              -H "Authorization: Bearer $access_token" \
              -H "Content-Type: application/json")
            
            if [ $? -eq 0 ] && [ -n "$blueprint_detail" ]; then
              echo "$blueprint_detail" | jq '.' > "$EXPORT_DIR/blueprints/$blueprint_id.json"
              echo "✅ Exported detailed definition for blueprint: $blueprint_id"
            fi
          fi
        else
          echo "❌ Failed to export blueprints"
          exit 1
        fi
      fi
    - |
      if [ "$EXPORT_TYPE" = "scorecards" ] || [ "$EXPORT_TYPE" = "all" ]; then
        echo "📊 Exporting scorecards..."
        
        scorecards_response=$(curl -X GET "$PORT_API_URL/scorecards" \
          -H "Authorization: Bearer $access_token" \
          -H "Content-Type: application/json")
        
        if [ $? -eq 0 ] && [ -n "$scorecards_response" ]; then
          echo "$scorecards_response" | jq '.' > "$EXPORT_DIR/scorecards/scorecards.json"
          
          scorecard_count=$(echo "$scorecards_response" | jq '.scorecards | length')
          echo "✅ Exported $scorecard_count scorecards"
        else
          echo "❌ Failed to export scorecards"
          exit 1
        fi
      fi
    - |
      if [ "$EXPORT_TYPE" = "actions" ] || [ "$EXPORT_TYPE" = "all" ]; then
        echo "⚡ Exporting actions..."
        
        actions_response=$(curl -X GET "$PORT_API_URL/actions" \
          -H "Authorization: Bearer $access_token" \
          -H "Content-Type: application/json")
        
        if [ $? -eq 0 ] && [ -n "$actions_response" ]; then
          echo "$actions_response" | jq '.' > "$EXPORT_DIR/actions/actions.json"
          
          action_count=$(echo "$actions_response" | jq '.actions | length')
          echo "✅ Exported $action_count actions"
        else
          echo "❌ Failed to export actions"
          exit 1
        fi
      fi
    - echo "💾 Committing exported data to repository..."
    - git add "$EXPORT_DIR/"
    - |
      if git diff --staged --quiet; then
        echo "ℹ️ No changes to commit"
      else
        git commit -m "Export Port data

        - Export type: $EXPORT_TYPE
        - Blueprint filter: ${BLUEPRINT_FILTER:-None}
        - GitLab pipeline: $CI_PIPELINE_ID"
        
        git push origin $CI_COMMIT_REF_NAME
        echo "✅ Exported data committed to repository"
      fi
```
</details>

**Usage:**
1. Go to **CI/CD > Pipelines** in your GitLab project
2. Click **Run pipeline**
3. Set variables:
   - `EXPORT_TYPE`: `all`, `blueprints`, `scorecards`, or `actions`
   - `BLUEPRINT_FILTER`: (optional) specific blueprint identifier

</TabItem>
<TabItem value="azure" label="Azure DevOps pipeline">

<details>
<summary><b>`azure-pipelines.yml` (click to expand)</b></summary>
```yaml showLineNumbers
trigger: none

variables:
  PORT_API_URL: 'https://api.getport.io/v1'
  EXPORT_DIR: 'development'

pool:
  vmImage: 'ubuntu-latest'

parameters:
- name: exportType
  displayName: 'Type of data to export'
  type: string
  default: 'all'
  values:
  - all
  - blueprints
  - scorecards
  - actions
- name: blueprintFilter
  displayName: 'Specific blueprint to export (optional)'
  type: string
  default: ''

stages:
- stage: ExportPortData
  displayName: 'Export Port Data'
  jobs:
  - job: ExportJob
    displayName: 'Export Port Data to Repository'
    steps:
    - task: NodeTool@0
      displayName: 'Use Node.js 18'
      inputs:
        versionSpec: '18.x'
    
    - script: |
        npm install -g jq
      displayName: 'Install dependencies'
    
    - script: |
        echo "Getting Port access token..."
        access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
          --header 'Content-Type: application/json' \
          --data-raw '{
              "clientId": "$(PORT_CLIENT_ID)",
              "clientSecret": "$(PORT_CLIENT_SECRET)"
          }' | jq '.accessToken' | sed 's/"//g')
        
        if [ -z "$access_token" ] || [ "$access_token" = "null" ]; then
          echo "Failed to get access token"
          exit 1
        fi
        
        echo "access_token=$access_token" >> $GITHUB_ENV
        echo "✅ Successfully obtained access token"
      displayName: 'Get Port Access Token'
    
    - script: |
        mkdir -p $(EXPORT_DIR)/blueprints
        mkdir -p $(EXPORT_DIR)/scorecards
        mkdir -p $(EXPORT_DIR)/actions
        echo "Created export directories for resource types"
      displayName: 'Create export directories'
    
    - script: |
        if [ "$(exportType)" = "blueprints" ] || [ "$(exportType)" = "all" ]; then
          echo "📋 Exporting blueprints..."
          
          blueprints_response=$(curl -X GET "$(PORT_API_URL)/blueprints" \
            -H "Authorization: Bearer $access_token" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$blueprints_response" ]; then
            echo "$blueprints_response" | jq '.' > "$(EXPORT_DIR)/blueprints/blueprints.json"
            
            blueprint_count=$(echo "$blueprints_response" | jq '.blueprints | length')
            echo "✅ Exported $blueprint_count blueprints"
            
            if [ -n "$(blueprintFilter)" ]; then
              blueprint_id="$(blueprintFilter)"
              echo "📄 Exporting detailed definition for blueprint: $blueprint_id"
              
              blueprint_detail=$(curl -X GET "$(PORT_API_URL)/blueprints/$blueprint_id" \
                -H "Authorization: Bearer $access_token" \
                -H "Content-Type: application/json")
              
              if [ $? -eq 0 ] && [ -n "$blueprint_detail" ]; then
                echo "$blueprint_detail" | jq '.' > "$(EXPORT_DIR)/blueprints/$blueprint_id.json"
                echo "✅ Exported detailed definition for blueprint: $blueprint_id"
              fi
            fi
          else
            echo "❌ Failed to export blueprints"
            exit 1
          fi
        fi
      displayName: 'Export Blueprints'
    
    - script: |
        if [ "$(exportType)" = "scorecards" ] || [ "$(exportType)" = "all" ]; then
          echo "📊 Exporting scorecards..."
          
          scorecards_response=$(curl -X GET "$(PORT_API_URL)/scorecards" \
            -H "Authorization: Bearer $access_token" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$scorecards_response" ]; then
            echo "$scorecards_response" | jq '.' > "$(EXPORT_DIR)/scorecards/scorecards.json"
            
            scorecard_count=$(echo "$scorecards_response" | jq '.scorecards | length')
            echo "✅ Exported $scorecard_count scorecards"
          else
            echo "❌ Failed to export scorecards"
            exit 1
          fi
        fi
      displayName: 'Export Scorecards'
    
    - script: |
        if [ "$(exportType)" = "actions" ] || [ "$(exportType)" = "all" ]; then
          echo "⚡ Exporting actions..."
          
          actions_response=$(curl -X GET "$(PORT_API_URL)/actions" \
            -H "Authorization: Bearer $access_token" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$actions_response" ]; then
            echo "$actions_response" | jq '.' > "$(EXPORT_DIR)/actions/actions.json"
            
            action_count=$(echo "$actions_response" | jq '.actions | length')
            echo "✅ Exported $action_count actions"
          else
            echo "❌ Failed to export actions"
            exit 1
          fi
        fi
      displayName: 'Export Actions'
    
    - script: |
        echo "💾 Committing exported data to repository..."
        
        git config --global user.email "azure-pipelines@azure.com"
        git config --global user.name "Azure Pipelines"
        
        git add "$(EXPORT_DIR)/"
        
        if git diff --staged --quiet; then
          echo "ℹ️ No changes to commit"
        else
          git commit -m "Export Port data

          - Export type: $(exportType)
          - Blueprint filter: $(blueprintFilter)
          - Azure pipeline: $(Build.BuildId)"
          
          git push origin $(Build.SourceBranchName)
          echo "✅ Exported data committed to repository"
        fi
      displayName: 'Commit exported data'
```
</details>

**Usage:**
1. Go to **Pipelines** in your Azure DevOps project
2. Click **Run pipeline** on your pipeline
3. Set parameters:
   - `exportType`: `all`, `blueprints`, `scorecards`, or `actions`
   - `blueprintFilter`: (optional) specific blueprint identifier

</TabItem>
</Tabs>

---

#### Promote resources using a CI/CD workflow

Below are examples of CI/CD workflows that automate the promotion of resources from a development environment to a production environment.

**What these workflows do:**

- **Validate** JSON files in your development folder to ensure they're properly formatted
- **Copy** resource definitions from the development folder to the production folder in your repository
- **Apply** the resource definitions to your production Port environment using the Port API
- **Commit** the promoted resources back to your repository for audit trail

This automates the promotion process and ensures consistency between your development and production environments.

**Prerequisites**

Before using these workflows, make sure to:

1. **Set up CI/CD credentials:**
   - `PORT_PRODUCTION_TOKEN`: Your Port API token for the production environment.
   - GitHub: Store as repository secrets
   - GitLab: Store as project variables  
   - Azure DevOps: Store as pipeline variables

2. **Configure Port API tokens:**
   - Generate API tokens for your production Port environment.
   - Store them securely in your CI/CD platform.

3. **Organize your repository structure:**
   - Create `development/` and `production/` folders.
   - Add subfolders for each resource type (`blueprints/`, `scorecards/`, `actions/`).  
   The structure of the repository should look something like this:

      <details>
      <summary><b>Repository structure (click to expand)</b></summary>

      ```
      ├── .github/
      │   └── workflows/
      │       └── promote-to-production.yml
      ├── development/
      │   ├── blueprints/
      │   │   ├── service.json
      │   │   └── microservice.json
      │   ├── scorecards/
      │   │   └── security-scorecard.json
      │   └── actions/
      │       └── deploy-service.json
      └── production/
          ├── blueprints/
          ├── scorecards/
          └── actions/
      ```
      </details>

<Tabs groupId="cicd-platform-promote" queryString>
<TabItem value="github" label="GitHub Actions">

**Workflow file**

<details>
<summary><b>`promote-to-production.yml` (click to expand)</b></summary>
```yaml showLineNumbers
name: Promote Resources from Development to Production

on:
  workflow_dispatch:
    inputs:
      resource_type:
        description: 'Type of resource to promote'
        required: true
        type: choice
        options:
          - blueprints
          - scorecards
          - actions
          - all
      resource_name:
        description: 'Specific resource name (optional, leave empty for all)'
        required: false
        type: string

env:
  PORT_API_URL: "https://api.getport.io/v1"

jobs:
  promote-resources:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm install -g jq
          
      - name: Validate development resources
        run: |
          echo "Validating development resources..."
          for file in development/**/*.json; do
            if [ -f "$file" ]; then
              echo "Validating $file"
              jq empty "$file" || (echo "Invalid JSON in $file" && exit 1)
            fi
          done
          
      - name: Promote Blueprints
        if: ${{ github.event.inputs.resource_type == 'blueprints' || github.event.inputs.resource_type == 'all' }}
        run: |
          echo "Promoting blueprints..."
          
          if [ -n "${{ github.event.inputs.resource_name }}" ]; then
            # Promote specific blueprint
            file="development/blueprints/${{ github.event.inputs.resource_name }}.json"
            if [ -f "$file" ]; then
              echo "Promoting blueprint: ${{ github.event.inputs.resource_name }}"
              
              # Copy to production folder
              cp "$file" "production/blueprints/"
              
              # Apply to Port production environment
              curl -X POST "$PORT_API_URL/blueprints" \
                -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Blueprint file not found: $file"
              exit 1
            fi
          else
            # Promote all blueprints
            for file in development/blueprints/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting blueprint: $filename"
                
                # Copy to production folder
                cp "$file" "production/blueprints/"
                
                # Apply to Port production environment
                curl -X POST "$PORT_API_URL/blueprints" \
                  -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
          
      - name: Promote Scorecards
        if: ${{ github.event.inputs.resource_type == 'scorecards' || github.event.inputs.resource_type == 'all' }}
        run: |
          echo "Promoting scorecards..."
          
          if [ -n "${{ github.event.inputs.resource_name }}" ]; then
            # Promote specific scorecard
            file="development/scorecards/${{ github.event.inputs.resource_name }}.json"
            if [ -f "$file" ]; then
              echo "Promoting scorecard: ${{ github.event.inputs.resource_name }}"
              
              # Copy to production folder
              cp "$file" "production/scorecards/"
              
              # Apply to Port production environment
              curl -X POST "$PORT_API_URL/scorecards" \
                -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Scorecard file not found: $file"
              exit 1
            fi
          else
            # Promote all scorecards
            for file in development/scorecards/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting scorecard: $filename"
                
                # Copy to production folder
                cp "$file" "production/scorecards/"
                
                # Apply to Port production environment
                curl -X POST "$PORT_API_URL/scorecards" \
                  -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
          
      - name: Promote Actions
        if: ${{ github.event.inputs.resource_type == 'actions' || github.event.inputs.resource_type == 'all' }}
        run: |
          echo "Promoting actions..."
          
          if [ -n "${{ github.event.inputs.resource_name }}" ]; then
            # Promote specific action
            file="development/actions/${{ github.event.inputs.resource_name }}.json"
            if [ -f "$file" ]; then
              echo "Promoting action: ${{ github.event.inputs.resource_name }}"
              
              # Copy to production folder
              cp "$file" "production/actions/"
              
              # Apply to Port production environment
              curl -X POST "$PORT_API_URL/actions" \
                -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Action file not found: $file"
              exit 1
            fi
          else
            # Promote all actions
            for file in development/actions/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting action: $filename"
                
                # Copy to production folder
                cp "$file" "production/actions/"
                
                # Apply to Port production environment
                curl -X POST "$PORT_API_URL/actions" \
                  -H "Authorization: Bearer ${{ secrets.PORT_PRODUCTION_TOKEN }}" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
          
      - name: Commit promoted resources
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add production/
          
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "Promote ${{ github.event.inputs.resource_type }} to production"
            git push
          fi
          
      - name: Create deployment summary
        run: |
          echo "## 🚀 Resource Promotion Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Resource Type:** ${{ github.event.inputs.resource_type }}" >> $GITHUB_STEP_SUMMARY
          
          if [ -n "${{ github.event.inputs.resource_name }}" ]; then
            echo "**Resource Name:** ${{ github.event.inputs.resource_name }}" >> $GITHUB_STEP_SUMMARY
          else
            echo "**Resource Name:** All resources of type" >> $GITHUB_STEP_SUMMARY
          fi
          
          echo "**Environment:** Production" >> $GITHUB_STEP_SUMMARY
          echo "**Status:** ✅ Successfully promoted" >> $GITHUB_STEP_SUMMARY
```
</details>

**Usage:**

1. **Manual trigger:**  
Go to the `Actions` tab in your GitHub repository and manually trigger the workflow, selecting the resource type and optionally a specific resource name.

2. **Promote specific resource:**
   ```bash
   # Trigger via GitHub CLI
   gh workflow run promote-to-production.yml \
     -f resource_type=blueprints \
     -f resource_name=service
   ```

3. **Promote all resources of a type:**
   ```bash
   # Promote all blueprints
   gh workflow run promote-to-production.yml \
     -f resource_type=blueprints
   ```

</TabItem>
<TabItem value="gitlab" label="GitLab CI">

**Workflow file**

<details>
<summary><b>`.gitlab-ci.yml` (click to expand)</b></summary>
```yaml showLineNumbers
stages:
  - promote

variables:
  PORT_API_URL: "https://api.getport.io/v1"

promote-resources:
  stage: promote
  image: node:18
  rules:
    - if: $CI_PIPELINE_SOURCE == "web"
  variables:
    RESOURCE_TYPE: $RESOURCE_TYPE
    RESOURCE_NAME: $RESOURCE_NAME
  before_script:
    - npm install -g jq
    - git config --global user.email "gitlab-ci@gitlab.com"
    - git config --global user.name "GitLab CI"
  script:
    - echo "Validating development resources..."
    - |
      for file in development/**/*.json; do
        if [ -f "$file" ]; then
          echo "Validating $file"
          jq empty "$file" || (echo "Invalid JSON in $file" && exit 1)
        fi
      done
    - |
      if [ "$RESOURCE_TYPE" = "blueprints" ] || [ "$RESOURCE_TYPE" = "all" ]; then
        echo "Promoting blueprints..."
        
        if [ -n "$RESOURCE_NAME" ]; then
          file="development/blueprints/$RESOURCE_NAME.json"
          if [ -f "$file" ]; then
            echo "Promoting blueprint: $RESOURCE_NAME"
            cp "$file" "production/blueprints/"
            curl -X POST "$PORT_API_URL/blueprints" \
              -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
              -H "Content-Type: application/json" \
              -d @"$file"
          else
            echo "Blueprint file not found: $file"
            exit 1
          fi
        else
          for file in development/blueprints/*.json; do
            if [ -f "$file" ]; then
              filename=$(basename "$file")
              echo "Promoting blueprint: $filename"
              cp "$file" "production/blueprints/"
              curl -X POST "$PORT_API_URL/blueprints" \
                -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            fi
          done
        fi
      fi
    - |
      if [ "$RESOURCE_TYPE" = "scorecards" ] || [ "$RESOURCE_TYPE" = "all" ]; then
        echo "Promoting scorecards..."
        
        if [ -n "$RESOURCE_NAME" ]; then
          file="development/scorecards/$RESOURCE_NAME.json"
          if [ -f "$file" ]; then
            echo "Promoting scorecard: $RESOURCE_NAME"
            cp "$file" "production/scorecards/"
            curl -X POST "$PORT_API_URL/scorecards" \
              -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
              -H "Content-Type: application/json" \
              -d @"$file"
          else
            echo "Scorecard file not found: $file"
            exit 1
          fi
        else
          for file in development/scorecards/*.json; do
            if [ -f "$file" ]; then
              filename=$(basename "$file")
              echo "Promoting scorecard: $filename"
              cp "$file" "production/scorecards/"
              curl -X POST "$PORT_API_URL/scorecards" \
                -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            fi
          done
        fi
      fi
    - |
      if [ "$RESOURCE_TYPE" = "actions" ] || [ "$RESOURCE_TYPE" = "all" ]; then
        echo "Promoting actions..."
        
        if [ -n "$RESOURCE_NAME" ]; then
          file="development/actions/$RESOURCE_NAME.json"
          if [ -f "$file" ]; then
            echo "Promoting action: $RESOURCE_NAME"
            cp "$file" "production/actions/"
            curl -X POST "$PORT_API_URL/actions" \
              -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
              -H "Content-Type: application/json" \
              -d @"$file"
          else
            echo "Action file not found: $file"
            exit 1
          fi
        else
          for file in development/actions/*.json; do
            if [ -f "$file" ]; then
              filename=$(basename "$file")
              echo "Promoting action: $filename"
              cp "$file" "production/actions/"
              curl -X POST "$PORT_API_URL/actions" \
                -H "Authorization: Bearer ${PORT_PRODUCTION_TOKEN}" \
                -H "Content-Type: application/json" \
                -d @"$file"
            fi
          done
        fi
      fi
    - git add production/
    - |
      if git diff --staged --quiet; then
        echo "No changes to commit"
      else
        git commit -m "Promote $RESOURCE_TYPE to production"
        git push origin $CI_COMMIT_REF_NAME
      fi
```
</details>

**Usage:**
1. Go to **CI/CD > Pipelines** in your GitLab project
2. Click **Run pipeline**
3. Set variables:
   - `RESOURCE_TYPE`: `blueprints`, `scorecards`, `actions`, or `all`
   - `RESOURCE_NAME`: (optional) specific resource name

</TabItem>
<TabItem value="azure" label="Azure DevOps">

**Workflow file**

<details>
<summary><b>`azure-pipelines.yml` (click to expand)</b></summary>
```yaml showLineNumbers
trigger: none

variables:
  PORT_API_URL: 'https://api.getport.io/v1'

pool:
  vmImage: 'ubuntu-latest'

parameters:
- name: resourceType
  displayName: 'Type of resource to promote'
  type: string
  default: 'all'
  values:
  - blueprints
  - scorecards
  - actions
  - all
- name: resourceName
  displayName: 'Specific resource name (optional)'
  type: string
  default: ''

stages:
- stage: PromoteResources
  displayName: 'Promote Resources to Production'
  jobs:
  - job: PromoteJob
    displayName: 'Promote Resources from Development to Production'
    steps:
    - task: NodeTool@0
      displayName: 'Use Node.js 18'
      inputs:
        versionSpec: '18.x'
    
    - script: |
        npm install -g jq
      displayName: 'Install dependencies'
    
    - script: |
        echo "Validating development resources..."
        for file in development/**/*.json; do
          if [ -f "$file" ]; then
            echo "Validating $file"
            jq empty "$file" || (echo "Invalid JSON in $file" && exit 1)
          fi
        done
      displayName: 'Validate development resources'
    
    - script: |
        if [ "$(resourceType)" = "blueprints" ] || [ "$(resourceType)" = "all" ]; then
          echo "Promoting blueprints..."
          
          if [ -n "$(resourceName)" ]; then
            file="development/blueprints/$(resourceName).json"
            if [ -f "$file" ]; then
              echo "Promoting blueprint: $(resourceName)"
              cp "$file" "production/blueprints/"
              curl -X POST "$(PORT_API_URL)/blueprints" \
                -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Blueprint file not found: $file"
              exit 1
            fi
          else
            for file in development/blueprints/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting blueprint: $filename"
                cp "$file" "production/blueprints/"
                curl -X POST "$(PORT_API_URL)/blueprints" \
                  -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
        fi
      displayName: 'Promote Blueprints'
    
    - script: |
        if [ "$(resourceType)" = "scorecards" ] || [ "$(resourceType)" = "all" ]; then
          echo "Promoting scorecards..."
          
          if [ -n "$(resourceName)" ]; then
            file="development/scorecards/$(resourceName).json"
            if [ -f "$file" ]; then
              echo "Promoting scorecard: $(resourceName)"
              cp "$file" "production/scorecards/"
              curl -X POST "$(PORT_API_URL)/scorecards" \
                -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Scorecard file not found: $file"
              exit 1
            fi
          else
            for file in development/scorecards/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting scorecard: $filename"
                cp "$file" "production/scorecards/"
                curl -X POST "$(PORT_API_URL)/scorecards" \
                  -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
        fi
      displayName: 'Promote Scorecards'
    
    - script: |
        if [ "$(resourceType)" = "actions" ] || [ "$(resourceType)" = "all" ]; then
          echo "Promoting actions..."
          
          if [ -n "$(resourceName)" ]; then
            file="development/actions/$(resourceName).json"
            if [ -f "$file" ]; then
              echo "Promoting action: $(resourceName)"
              cp "$file" "production/actions/"
              curl -X POST "$(PORT_API_URL)/actions" \
                -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                -H "Content-Type: application/json" \
                -d @"$file"
            else
              echo "Action file not found: $file"
              exit 1
            fi
          else
            for file in development/actions/*.json; do
              if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "Promoting action: $filename"
                cp "$file" "production/actions/"
                curl -X POST "$(PORT_API_URL)/actions" \
                  -H "Authorization: Bearer $(PORT_PRODUCTION_TOKEN)" \
                  -H "Content-Type: application/json" \
                  -d @"$file"
              fi
            done
          fi
        fi
      displayName: 'Promote Actions'
    
    - script: |
        echo "Committing promoted resources..."
        
        git config --global user.email "azure-pipelines@azure.com"
        git config --global user.name "Azure Pipelines"
        
        git add production/
        
        if git diff --staged --quiet; then
          echo "No changes to commit"
        else
          git commit -m "Promote $(resourceType) to production"
          git push origin $(Build.SourceBranchName)
        fi
      displayName: 'Commit promoted resources'
```
</details>

**Usage:**
1. Go to **Pipelines** in your Azure DevOps project
2. Click **Run pipeline** on your pipeline
3. Set parameters:
   - `resourceType`: `blueprints`, `scorecards`, `actions`, or `all`
   - `resourceName`: (optional) specific resource name

</TabItem>
</Tabs>
