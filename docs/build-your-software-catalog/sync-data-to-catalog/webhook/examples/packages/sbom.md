---
sidebar_position: 7
description: Ingest software bill of material (SBOM) into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ComponentBlueprint from './resources/sbom/\_example_sbom_component_blueprint.mdx'
import VulnerabilityBlueprint from './resources/sbom/\_example_sbom_vulnerability_blueprint.mdx'
import SbomWebhookConfig from './resources/sbom/\_example_sbom_webhook_config.mdx'

# SBOM

In this example you are going to create a `sbomComponent` blueprint that ingests all third party components in your `sbom.json` or `sbom.xml` file using a combination of Port's [API](../../../api/api.md) and [webhook functionality](../../webhook.md). You will then relate this blueprint to a `sbomVulnerability` blueprint, allowing you to map all the components affected by a security vulnerability.

To ingest the components and vulnerabilities to Port, a script that sends information about the SBOM file according to the webhook configuration is used.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>SBOM component blueprint</summary>
<ComponentBlueprint/>
</details>

<details>
<summary>SBOM vulnerability blueprint</summary>
<VulnerabilityBlueprint/>
</details>

<details>
<summary>SBOM webhook configuration</summary>

<SbomWebhookConfig/>

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

Create the following Python script in your repository to create or update Port entities as part of your pipeline:

<details>
  <summary> Python script for CycloneDX JSON </summary>

```python showLineNumbers
import requests
import json
import os

WEBHOOK_URL = os.environ['WEBHOOK_URL'] ## the value of the URL you receive after creating the Port webhook
PATH_TO_SBOM_JSON_FILE = os.environ['PATH_TO_SBOM_JSON_FILE']

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
    with open(sbom_file, 'r') as file:
        sbom_data = json.load(file)
    software_information = sbom_data["metadata"]["component"]
    software_product = software_information.get("name", "")
    software_version = software_information.get("version", "")

    components = []
    vulnerabilities = []
    for component in sbom_data.get("components", []):
        component_data = {
            "type": component.get("type", ""),
            "reference": component.get("bom-ref", ""),
            "name": component.get("name", ""),
            "version": component.get("version", ""),
            "purl": component.get("purl", ""),
            "external_references": component.get("externalReferences", []),
            "licenses": [license_data.get("license", "") for license_data in component.get("licenses", [])]
        }
        components.append(component_data)

    for vulnerability in sbom_data.get("vulnerabilities", []):
        vulnerability_data = {
            "id": vulnerability.get("id"),
            "description": vulnerability.get("description", ""),
            "reference": vulnerability.get("bom-ref", ""),
            "recommendation": vulnerability.get("recommendation", ""),
            "state": vulnerability.get("analysis", {}).get("state"),
            "ratings": vulnerability.get("ratings", []),
            "source": vulnerability.get("source", {}).get("name"),
            "affects": [bom_component.get("ref", "") for bom_component in vulnerability.get("affects", [])],
            "published": vulnerability.get("published", "")
        }
        vulnerabilities.append(vulnerability_data)

    entity_object = {
        "components": components,
        "vulnerabilities": vulnerabilities,
        "software_product": software_product,
        "software_version": software_version
    }
    webhook_response = add_entity_to_port(entity_object)
    return webhook_response


# Example usage
response = extract_sbom_data(PATH_TO_SBOM_JSON_FILE)
print(response)
```

</details>

</TabItem>

<TabItem value="xml">

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
