---
displayed_sidebar: null
description: Build an OWASP Top 10 security scorecard in Port using vulnerability data from Snyk.
---

import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

# Promote resources across environments

Managing multiple environments (such as `development`, `staging`, and `production`) is a fundamental practice in modern software delivery. Each environment serves a distinct purpose, and promoting resources across these environments must be done in a controlled, repeatable way.

This approach helps ensure consistency, reduces the risk of errors, and enables safer deployments.  
By managing resources across environments, teams can catch issues early, maintain high quality, and deliver changes to users with confidence.

The guide presents two approaches to achieve this:

1. Using IaC (Terraform) to define and manage resources.
2. Using Port resource definitions (in JSON format) in a dedicated Git repository to define and manage resources.

## Prerequisites

- A Port account with the [onboarding process](https://docs.port.io/getting-started/overview) completed.

- For the first approach, you will need to have a Terraform account and be able to create and manage resources in your desired environment.

- For the second approach, you will need to have a dedicated Git repository to store the resource definitions. In this guide, we will use GitHub as an example.

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

1. **Set up development environment**  
   Using Port's UI in your development environment, create the resources you want to promote to your production environment.  
   As an example, we will use the `Service` blueprint, and the `Own services` self-service action. These two resources are automatically created when you create a Port account.

2. **Update Terraform configuration**  
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

3. **Generate Terraform configuration**  
   Using the Terraform CLI, generate configuration files from the resources created in your development environment:
   
   ```bash showLineNumbers
   terraform init
   terraform plan -generate-config-out=generated.tf
   ```

4. **Validate the configuration**  
   Check the resulting `generated.tf` file, ensuring it includes the desired configuration for both the `Own services` and `Service` resources.

5. **Copy and adjust for Production**  
   - Copy the `generated.tf` file to your production environment.
   - Remove the provider blocks - since the provider is usually set at a higher level, remove the `provider = port-labs` lines from both resources.
   - Remove null properties - clean up the configuration by removing all properties that are set to `null`.

6. **Dynamic referencing**  
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

7. **Apply Changes in Production**  
   Before applying any changes, run `terraform plan` in your production environment to view the planned changes and ensure everything is set up correctly.
   
   Once you're satisfied with the plan, run `terraform apply` to apply the changes to your production environment.


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

### Examples

#### Export data using a GitHub workflow

Below is an example of a GitHub workflow that automatically exports data from your development environment using Port's API and saves it to your dedicated repository.

**Prerequisites**

Generate API credentials for your Port development environment and store them as GitHub repository secrets named `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`.

**Workflow file**

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
  TIMESTAMP: ${{ github.run_number }}-${{ github.run_id }}

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
          
      - name: Create export directory
        run: |
          mkdir -p $EXPORT_DIR/$TIMESTAMP
          echo "Created export directory: $EXPORT_DIR/$TIMESTAMP"
          
      - name: Export Blueprints
        if: ${{ github.event.inputs.export_type == 'blueprints' || github.event.inputs.export_type == 'all' }}
        run: |
          echo "📋 Exporting blueprints..."
          
          # Get all blueprints
          blueprints_response=$(curl -X GET "$PORT_API_URL/blueprints" \
            -H "Authorization: Bearer ${{ env.access_token }}" \
            -H "Content-Type: application/json")
          
          if [ $? -eq 0 ] && [ -n "$blueprints_response" ]; then
            echo "$blueprints_response" | jq '.' > "$EXPORT_DIR/$TIMESTAMP/blueprints.json"
            
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
                echo "$blueprint_detail" | jq '.' > "$EXPORT_DIR/$TIMESTAMP/blueprint-$blueprint_id.json"
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
            echo "$scorecards_response" | jq '.' > "$EXPORT_DIR/$TIMESTAMP/scorecards.json"
            
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
            echo "$actions_response" | jq '.' > "$EXPORT_DIR/$TIMESTAMP/actions.json"
            
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
            git commit -m "Export Port data - $TIMESTAMP

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

---

#### Promote resources using a GitHub workflow

Below is an example of a GitHub workflow that automates the promotion of resources from a development environment to a production environment.

**Prerequisites**

Before using this workflow, make sure to:

1. **Set up repository secrets:**
   - `PORT_PRODUCTION_TOKEN`: Your Port API token for the production environment.

2. **Configure Port API tokens:**
   - Generate API tokens for your production Port environment.
   - Store them securely as GitHub repository secrets.

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

**Workflow file**

The workflow file might look like this:

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
