---
description: Ingests software bill of material (SBOM) in your `SBOM.json` or `SBOM.xml` file using Port's GitHub file ingesting feature
displayed_sidebar: null
title: Ingest software bill of material (SBOM) into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ComponentBlueprint from '../templates/sbom/\_example_sbom_component_blueprint.mdx'
import VulnerabilityBlueprint from '../templates/sbom/\_example_sbom_vulnerability_blueprint.mdx'
import SbomWebhookConfig from '../templates/sbom/\_example_sbom_webhook_config.mdx'

# Ingest software bill of material (SBOM) into your catalog

The following example shows you how to create a `sbomComponent` blueprint that ingests all third party components in your `sbom.json` or `sbom.xml` file using both Port's GitHub file ingesting feature (for `sbom.json`) and a combination of Port's [API](/build-your-software-catalog/custom-integration/api) and [webhook functionality](/build-your-software-catalog/custom-integration/webhook) (for `sbom.xml`). You will then relate this blueprint to a `sbomVulnerability` blueprint, allowing you to map all the components affected by a security vulnerability.

To ingest the packages to Port, a `port-app-config.yml` file in the needed repository or organisation is used.

## Prerequisites
This guide assumes:
- You have a Port account
- You have installed [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) in your organisation or in repositories you are interested in.

## GitHub configuration

To ingest GitHub objects, use one of the following methods:


## Setting up the blueprint and mapping configuration

Create the following blueprint definition and webhook configuration:

<details>
<summary>SBOM component blueprint</summary>
<ComponentBlueprint/>
</details>

<details>
<summary>SBOM vulnerability blueprint</summary>
<VulnerabilityBlueprint/>
</details>


:::note
This documentation uses the [CycloneDX](https://cyclonedx.org/) SBOM standard. For more information on the schema structure, you can look [here](https://cyclonedx.org/docs/1.5/json/#components)
:::

## Working with Port's API and Bash script

Here are example snippets showing how to integrate Port's API and Webhook with your existing pipelines using Python and report SBOM entities from them:

<Tabs groupId="usage" defaultValue="json" values={[
{label: "JSON", value: "json"},
{label: "XML", value: "xml"}
]}>

<TabItem value="json">

<Tabs queryString="method">

<TabItem label="Using Port's UI" value="port">

To manage your GitHub integration configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Here you can modify the configuration to suit your needs, by adding/removing entries.
5. When finished, click `resync` to apply any changes.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

</TabItem>

<TabItem label="Using GitHub" value="github">

To manage your GitHub integration configuration using a config file in GitHub:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Scroll all the way down, and turn on the `Manage this integration using the "port-app-config.yml" file` toggle.

This will clear the configuration in Port's UI.

When configuring the integration **using GitHub**, you can choose either a global or granular configuration:

- **Global configuration:** create a `.github-private` repository in your organization and add the `port-app-config.yml` file to the repository.
  - Using this method applies the configuration to all repositories that the GitHub app has permissions to (unless it is overridden by a granular `port-app-config.yml` in a repository).
- **Granular configuration:** add the `port-app-config.yml` file to the `.github` directory of your desired repository.
  - Using this method applies the configuration only to the repository where the `port-app-config.yml` file exists.

When using global configuration **using GitHub**, the configuration specified in the `port-app-config.yml` file will only be applied if the file is in the **default branch** of the repository (usually `main`).

</TabItem>

</Tabs>

:::info Important
When **using Port's UI**, the specified configuration will override any `port-app-config.yml` file in your GitHub repository/ies.
:::

Put the following config in your `port-app-config.yml` file in your location of choice: repository level or organisation level.

<details>
<summary><b>SBOM mapping config (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        - path: '**/sbom.json'
    port:
      itemsToParse: .file.content.components
      entity:
        mappings:
          identifier: .item.bom-ref
          title: .item.name
          blueprint: '"sbomComponent"'
          properties:
            version: .item.version
            package_url: .item.purl
            type: .item.type
            external_references: .item.external_references
            licenses: .item.licenses
            software_product: .body.software_product + "-" + .body.software_version
          relations: {}

  - kind: file
    selector:
      query: 'true'
      files:
        - path: '**/sbom.json'
    port:
      itemsToParse: .file.content.vulnerabilities
      entity:
        mappings:
          identifier: .item.id
          title: .item.id
          blueprint: '"sbomVulnerability"'
          properties:
            description: .item.description
            reference: .item.reference
            recommendation: .item.recommendation
            ratings: .item.ratings
            source: .item.source
            published: .item.published
            state: .item.state
          relations: {}
```

</details>

</TabItem>

<TabItem value="xml">

Create the following webhook config:

<details>
<summary>SBOM webhook configuration</summary>

<SbomWebhookConfig/>

</details>

Create the following Python script in your repository to create or update Port entities as part of your pipeline:

<details>
  <summary> Python script for CycloneDX XML </summary>

```python showLineNumbers
import requests
import xml.dom.minidom
import os

WEBHOOK_URL = os.environ["WEBHOOK_URL"]
PATH_TO_SBOM_XML_FILE = os.environ["PATH_TO_SBOM_XML_FILE"]

def add_entity_to_port(entity_object):
    """A function to create the passed entity in Port using the webhook URL

    Params
    --------------
    entity_object: dict
        The entity to add in your Port catalog

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    headers = {"Content-Type": "application/json"}
    response = requests.post(WEBHOOK_URL, json=entity_object, headers=headers)
    return response.json()


def extract_sbom_data(sbom_file):
    """This function takes an sbom file path, converts the "components" and "vulnerabilities" property into a
    JSON array and it then sends this data to Port

    Params
    --------------
    sbom_file: str
        The path to the sbom file relative to the project's root folder

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """

    xml_doc = xml.dom.minidom.parse(sbom_file)

    # Get the metadata component element
    metadata_component = xml_doc.getElementsByTagName("metadata")[0].getElementsByTagName("component")[0]

    # Extract software name and version from the metadata component
    software_product_name = metadata_component.getElementsByTagName("name")[0].firstChild.data.strip()
    software_version = metadata_component.getElementsByTagName("version")[0].firstChild.data.strip()

    # get all the components elements and extract details
    sbom_components = []
    components_element = xml_doc.getElementsByTagName('components')[0]
    components = components_element.getElementsByTagName("component")

    for component in components:
        name = component.getElementsByTagName('name')[0].childNodes[0].data
        bom_ref = component.getAttribute("bom-ref")
        version = component.getElementsByTagName('version')[0].childNodes[0].data
        component_type = component.getAttribute('type')
        purl = component.getElementsByTagName('purl')[0].childNodes[0].data
        licenses = component.getElementsByTagName("licenses")
        external_references = component.getElementsByTagName("reference")

        license_ids = []
        for license_node in licenses:
            license_id = license_node.getElementsByTagName("id")[0].firstChild.data.strip()
            license_ids.append({"id": license_id})

        external_reference_list = []
        for reference in external_references:
            reference_type = reference.getAttribute("type")
            reference_url = reference.getElementsByTagName("url")[0].firstChild.data.strip()
            external_reference_list.append({"type": reference_type, "url": reference_url})

        sbom_components.append({
            "type": component_type,
            "reference": bom_ref,
            "name": name,
            "version": version,
            "purl": purl,
            "external_references": external_reference_list,
            "licenses": license_ids
        })
    # Get the vulnerabilities element
    vulnerabilities_element = xml_doc.getElementsByTagName("vulnerabilities")[0]
    vulnerabilities = vulnerabilities_element.getElementsByTagName("vulnerability")
    sbom_vulnerabilities = []

    # Iterate over vulnerabilities and extract details
    for vulnerability in vulnerabilities:
        bom_reference = vulnerability.getAttribute("bom-ref")
        vulnerability_id = vulnerability.getElementsByTagName("id")[0].firstChild.data.strip()
        description = vulnerability.getElementsByTagName("description")[0].firstChild.data.strip()
        recommendation = vulnerability.getElementsByTagName("recommendation")[0].firstChild.data.strip()
        state = vulnerability.getElementsByTagName("state")[0].firstChild.data.strip()
        source = vulnerability.getElementsByTagName("source")[0].getElementsByTagName("name")[0].firstChild.data.strip()
        published = vulnerability.getElementsByTagName("published")[0].firstChild.data.strip()
        ratings = vulnerability.getElementsByTagName("rating")
        affects_target_refs = vulnerability.getElementsByTagName("target")

        rating_list = []
        for rating in ratings:
            rating_source = rating.getElementsByTagName("source")[0].getElementsByTagName("name")[0].firstChild.data.strip()
            rating_score = rating.getElementsByTagName("score")[0].firstChild.data.strip()
            rating_severity = rating.getElementsByTagName("severity")[0].firstChild.data.strip()
            rating_list.append({"source": rating_source, "score": rating_score, "severity": rating_severity})


        affected_components = []
        for target_ref in affects_target_refs:
            ref = target_ref.getElementsByTagName("ref")[0].firstChild.data.strip()
            affected_components.append(ref)

        sbom_vulnerabilities.append({
            "id": vulnerability_id,
            "description": description,
            "reference": bom_reference,
            "recommendation": recommendation,
            "state": state,
            "ratings": rating_list,
            "source": source,
            "affects": affected_components,
            "published": published
        })

    entity_object = {
        "components": sbom_components,
        "vulnerabilities": sbom_vulnerabilities,
        "software_product": software_product_name,
        "software_version": software_version
    }
    webhook_response = add_entity_to_port(entity_object)
    return webhook_response

# Example usage
response = extract_sbom_data(PATH_TO_SBOM_XML_FILE)
print(response)
```

</details>

</TabItem>
</Tabs>
