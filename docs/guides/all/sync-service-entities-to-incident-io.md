---
sidebar_position: 8
displayed_sidebar: null
description: Learn how to sync your Port service entities into incident.io catalog for better visibility.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Sync Port Services to incident.io
This guide demonstrates how to set up a GitHub workflow that periodically syncs service entities from Port into incident.io's catalog, ensuring better visibility and context for your services during incident management.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- A GitHub repository where you can trigger a workflow for this guide.
- An [incident.io](https://app.incident.io/) account with **admin access** to create API keys.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed (required for GitHub Actions implementation)

:::info Admin Access Required
You need admin access to your incident.io organization to create API keys. If you don't have admin access, contact your incident.io administrator to create the API key for you.
:::

## Set up required secrets and permissions

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `INCIDENT_IO_API_KEY` - [API key](https://app.incident.io/settings/api-keys) from your incident.io dashboard with the following permissions: 
  - `Can manage catalog types and edit catalog data`
  - `Can view catalog types and entries`
- `INCIDENT_IO_CATALOG_TYPE_ID` - Incident.io catalog type ID. To be created in [this section](#create-a-catalog-type-in-incident-io).

## Set up data model

You'll need a `Service` blueprint in Port to represent the service entities you want to sync to incident.io. If you don't already have one, Follow the steps below:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add the following JSON schema:

    <details>
    <summary><b>Service blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "service",
      "title": "Service",
      "icon": "Github",
      "schema": {
        "properties": {
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown",
            "icon": "Book"
          },
          "url": {
            "title": "URL",
            "format": "url",
            "type": "string",
            "icon": "Link"
          },
          "language": {
            "icon": "Git",
            "type": "string",
            "title": "Language",
            "enum": [
              "GO",
              "Python",
              "Node",
              "React"
            ],
            "enumColors": {
              "GO": "red",
              "Python": "green",
              "Node": "blue",
              "React": "yellow"
            }
          },
          "type": {
            "title": "Type",
            "description": "This service's type",
            "type": "string",
            "enum": [
              "Backend",
              "Frontend",
              "Library"
            ],
            "enumColors": {
              "Backend": "purple",
              "Frontend": "pink",
              "Library": "green"
            },
            "icon": "DefaultProperty"
          },
          "lifecycle": {
            "title": "Lifecycle",
            "type": "string",
            "enum": [
              "Production",
              "Experimental",
              "Deprecated"
            ],
            "enumColors": {
              "Production": "green",
              "Experimental": "yellow",
              "Deprecated": "red"
            },
            "icon": "DefaultProperty"
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

5. Click `Save` to create the blueprint.

:::tip Customizing Your Blueprint
This example shows a basic service schema. You can customize it by:
1. **Adding properties**: Add new properties to the `properties` section in the blueprint JSON
2. **Updating the workflow**: Modify the GitHub workflow to include your new properties in the mapping section
3. **Updating incident.io**: Add corresponding attributes in your incident.io catalog type

For example, to add a `team` property, you would:
- Add it to the blueprint JSON properties
- Add the mapping in the workflow (step 4 in the workflow section)
- Add a `team` attribute in incident.io catalog type
:::

## Create a catalog type in incident.io

To sync your Port services into incident.io, you first need to create a catalog type in incident.io. Follow the steps below:

1. Login to your [incident.io](https://app.incident.io/) account
2. Click **Catalog** on the left navigation bar
3. Click on **add a custom type**
4. Fill in the following details:
   - **Name**: a suitable name such as `Port Services`
   - **Description**: Provide a description for the catalog type
   - Under **Categories**, select `Services` from the list
   - Under **Attributes**, add the following columns to reflect the properties of your Port `Service` blueprint:
     - `url`: Select `string` as the data type
     - `readme`: Select `rich text` as the data type
     - `language`: Select `string` as the data type
     - `lifecycle`: Select `string` as the data type
     - `type`: Select `string` as the data type

5. **Save the changes** by clicking the **Save** button
6. Once successful, click on the newly created type and take note of the ID from the browser's URL. For example, the ID might be something like `01J5RB95K5NNDE1CRQ7ZQ24YH5` for this browser URL (https://app.incident.io/organization/catalog/01J5RB95K5NNDE1CRQ7ZQ24YH5)
7. Create a GitHub secret (`INCIDENT_IO_CATALOG_TYPE_ID`) in the repository with the value of this ID


## Create GitHub workflow

Let's create a GitHub workflow file in a GitHub repository for the incident.io integration:

- Create a GitHub repository (or use an existing one)
- Create a `.github` directory and `workflows` sub directory

Inside the `.github/workflows` directory create a file called `sync-port-services-to-incident-io.yml` with the following content:

<details>
<summary><b>GitHub workflow configuration (click to expand)</b></summary>

:::info Blueprint Schema Matching
Make sure the property names in your Port Service blueprint match the attribute names in your incident.io catalog type. The workflow maps these properties:
- `url` → `url` attribute
- `readme` → `readme` attribute  
- `language` → `language` attribute
- `lifecycle` → `lifecycle` attribute
- `type` → `type` attribute

If you have different property names, update the mapping in step 4 of the workflow.
:::

```yml showLineNumbers
name: Sync Data to incident.io
on:
  schedule:
    - cron: "0 */2 * * *" # every two hours. Adjust this value
  workflow_dispatch: # allows manual triggering

jobs:
  sync-data:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v4
        
      - name: Get Port Access Token
        id: get_token
        run: |
          access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
          --header 'Content-Type: application/json' \
          --data-raw '{
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
          }' | jq '.accessToken' | sed 's/"//g')
          echo "access_token=$access_token" >> $GITHUB_ENV

      - name: Get Service Entities from Port
        id: get_entities
        run: |
          response=$(curl -X GET "https://api.getport.io/v1/blueprints/service/entities" \
              -H "Authorization: Bearer ${{ env.access_token }}" \
              -H "Content-Type: application/json")
          
          # Check if response is empty or if an error occurred
          if [ -z "$response" ]; then
            echo "No response received from Port API."
            exit 1
          else
            echo "Port Service Entities Response:"
            echo "$response"
          fi
          
          # Save response to file and environment variable
          echo "$response" > response.json

      - name: Get incident.io Schema
        id: get_schema
        run: |
          schema_response=$(curl --location --request GET 'https://api.incident.io/v2/catalog_types/${{ secrets.INCIDENT_IO_CATALOG_TYPE_ID }}' \
          -H "Authorization: Bearer ${{ secrets.INCIDENT_IO_API_KEY }}" \
          -H "Content-Type: application/json")
          echo "$schema_response" > schema.json
          
      - name: Map and Send Data to incident.io
        run: |
          schema=$(jq '.catalog_type.schema.attributes' schema.json)

          # Extract IDs of incident.io catalog attributes
          # IMPORTANT: Make sure these attribute names match your incident.io catalog type
          url_id=$(echo "$schema" | jq -r '.[] | select(.name == "url") | .id')
          readme_id=$(echo "$schema" | jq -r '.[] | select(.name == "readme") | .id')
          language_id=$(echo "$schema" | jq -r '.[] | select(.name == "language") | .id')
          lifecycle_id=$(echo "$schema" | jq -r '.[] | select(.name == "lifecycle") | .id')
          type_id=$(echo "$schema" | jq -r '.[] | select(.name == "type") | .id')

          # Read entities as a JSON array, and use `jq` to iterate correctly
          entities=$(jq -c '.entities[]' response.json)

          echo "$entities" | while IFS= read -r entity; do

            name=$(echo "$entity" | jq -r '.title // empty')
            if [ -z "$name" ]; then
              echo "Error: 'name' field is required but is empty. Skipping this entity."
              continue
            fi

            data=$(jq -n \
              --arg url_id "$url_id" \
              --arg url "$(echo "$entity" | jq -r '.properties.url // empty')" \
              --arg readme_id "$readme_id" \
              --arg readme "$(echo "$entity" | jq -r '.properties.readme // empty')" \
              --arg language_id "$language_id" \
              --arg language "$(echo "$entity" | jq -r '.properties.language // empty')" \
              --arg lifecycle_id "$lifecycle_id" \
              --arg lifecycle "$(echo "$entity" | jq -r '.properties.lifecycle // empty')" \
              --arg type_id "$type_id" \
              --arg type "$(echo "$entity" | jq -r '.properties.type // empty')" \
              --arg external_id "$(echo "$entity" | jq -r '.identifier')" \
              --arg name "$name" \
              --arg catalog_type_id "${{ secrets.INCIDENT_IO_CATALOG_TYPE_ID }}" \
              '{
                "aliases": [],
                "attribute_values": {
                  ($url_id): {"value": {"literal": $url}},
                  ($readme_id): {"value": {"literal": $readme}},
                  ($language_id): {"value": {"literal": $language}},
                  ($lifecycle_id): {"value": {"literal": $lifecycle}},
                  ($type_id): {"value": {"literal": $type}}
                },
                "catalog_type_id": $catalog_type_id,
                "external_id": $external_id,
                "name": $name
              }')

            echo "Sending data to API for entity $name"

            response=$(curl -i -X POST "https://api.incident.io/v2/catalog_entries" \
              -H "Authorization: Bearer ${{ secrets.INCIDENT_IO_API_KEY }}" \
              -H "Content-Type: application/json" \
              -d "$data")

            echo "Incident.io API response for entity $name:"
            echo "$response"
            
            # Check if the response indicates success
            if echo "$response" | grep -q "201\|200"; then
              echo "✅ Successfully synced entity $name to incident.io"
            else
              echo "❌ Failed to sync entity $name to incident.io"
              echo "Response: $response"
            fi
          done
```

<PortApiRegionTip/>
</details>


## Let's test it!

1. **Manual Testing**: Go to your GitHub repository's **Actions** tab and manually trigger the `Sync Data to incident.io` workflow to test it immediately.
2. **Check the logs**: Review the workflow logs to ensure all entities are being synced successfully.
3. **Verify in incident.io**: 
   - Log in to your incident.io account.
   - Navigate to the **Catalog** section in the left navigation bar.
   - Search for the `Port Services` catalog type or any custom name you provided.
   - You should now see the synced service entities from Port listed under this catalog type.

  <img src="/img/guides/IncidentioServiceCatalog.png" border="1px" />

Once the GitHub workflow runs (either manually or on schedule), the service entities from Port will be automatically synced into your incident.io catalog, giving you improved visibility and context for managing incidents.

With this integration in place, you'll have real-time access to your Port services within incident.io, streamlining your incident response and management processes.


## Limitations

Note that incident.io can currently ingest up to **50,000 catalog items**, keep this limit in mind when scaling your service catalog.