---
sidebar_position: 18
description: Ingest JFrog artifacts, Docker tags and builds into your catalog
---

# JFrog

In this example you are going to create a webhook integration between your JFrog Server and Port. The integration will facilitate the ingestion of JFrog artifact, Docker tag and build entities into Port.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Jfrog artifact blueprint</summary>

```json showLineNumbers
{
  "identifier": "jfrogArtifact",
  "description": "This blueprint represents an artifact in our JFrog catalog",
  "title": "JFrog Artifact",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name",
        "description": "Name of the artifact"
      },
      "path": {
        "type": "string",
        "title": "Path",
        "description": "Path to artifact"
      },
      "sha256": {
        "type": "string",
        "title": "SHA 256",
        "description": "SHA256 of the artifact"
      },
      "size": {
        "type": "number",
        "title": "Size",
        "description": "Size of the artifact"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "repository": {
      "title": "Repository",
      "description": "Repository of the artifact",
      "target": "jfrogRepository",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Jfrog Docker tag blueprint</summary>

```json showLineNumbers
{
  "identifier": "jfrogDockerTag",
  "description": "This blueprint represents a Docker tag in our Jfrog catalog",
  "title": "JFrog Docker Tag",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name",
        "description": "Name of the Docker tag"
      },
      "imageName": {
        "type": "string",
        "title": "Image Name",
        "description": "Name of the Docker image"
      },
      "path": {
        "type": "string",
        "title": "Path",
        "description": "Path to Docker tag"
      },
      "sha256": {
        "type": "string",
        "title": "SHA 256",
        "description": "SHA256 of the Docker tag"
      },
      "size": {
        "type": "number",
        "title": "Size",
        "description": "Size of the Docker tag"
      },
      "tag": {
        "type": "string",
        "title": "Docker tag",
        "description": "Docker tag"
      },
      "platforms": {
        "type": "array",
        "title": "Platforms",
        "description": "Platforms supported by image"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "repository": {
      "title": "Repository",
      "description": "Repository of the artifact",
      "target": "jfrogRepository",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Jfrog repository blueprint</summary>

```json showLineNumbers
{
  "identifier": "jfrogRepository",
  "description": "This blueprint represents a repository on Jfrog",
  "title": "JFrog Repository",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "key": {
        "type": "string",
        "title": "Key",
        "description": "Name of the repository"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Description of the repository"
      },
      "type": {
        "type": "string",
        "title": "Repository Type",
        "description": "Type of the repository",
        "enum": ["LOCAL", "REMOTE", "VIRTUAL", "FEDERATED", "DISTRIBUTION"],
        "enumColors": {
          "LOCAL": "blue",
          "REMOTE": "bronze",
          "VIRTUAL": "darkGray",
          "FEDERATED": "green",
          "DISTRIBUTION": "lightGray"
        }
      },
      "url": {
        "type": "string",
        "title": "Repository URL",
        "description": "URL to the repository",
        "format": "url"
      },
      "packageType": {
        "type": "string",
        "title": "Package type",
        "description": "Type of the package"
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
<summary>Jfrog project blueprint</summary>

```json showLineNumbers
{
  "identifier": "jfrogProject",
  "description": "This blueprint represents an artifact in our JFrog project",
  "title": "JFrog Project",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "key": {
        "type": "string",
        "title": "Key",
        "description": "Project identifier key"
      },
      "name": {
        "type": "string",
        "title": "Name",
        "description": "Display name of the project"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Project description"
      },
      "adminPrivileges": {
        "type": "object",
        "title": "Admin Privileges",
        "description": "Administrative privileges configuration for the project"
      },
      "roles": {
        "items": {
          "type": "object"
        },
        "type": "array",
        "title": "Roles"
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
<summary>Jfrog build blueprint</summary>

```json showLineNumbers
{
  "identifier": "jfrogBuild",
  "description": "This blueprint represents a build from JFrog",
  "title": "JFrog Build",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Build name",
        "description": "Name of the build"
      },
      "uri": {
        "type": "string",
        "title": "Build URI",
        "description": "URI to the build"
      },
      "lastStarted": {
        "type": "string",
        "title": "Last build time",
        "description": "Last time the build ran",
        "format": "date-time"
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
<summary>Jfrog Container Image</summary>

```json showLineNumbers
{
  "identifier": "jfrogContainerImage",
  "title": "JFrog Container Image",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "tag": {
        "type": "string",
        "title": "Tag"
      },
      "fullName": {
        "type": "string",
        "title": "Full Name"
      },
      "repository": {
        "type": "string",
        "title": "Repository"
      },
      "registryUrl": {
        "type": "string",
        "title": "Registry URL",
        "format": "url"
      },
      "imageSize": {
        "type": "string",
        "title": "Image Size"
      },
      "architecture": {
        "type": "string",
        "title": "Architecture"
      },
      "os": {
        "type": "string",
        "title": "Operating System"
      },
      "createdAt": {
        "type": "string",
        "title": "Created At",
        "format": "date-time"
      },
      "lastScanned": {
        "type": "string",
        "title": "Last Scanned",
        "format": "date-time"
      },
      "vulnerabilityCount": {
        "type": "number",
        "title": "Total Vulnerabilities"
      },
      "criticalVulns": {
        "type": "number",
        "title": "Critical Vulnerabilities"
      },
      "highVulns": {
        "type": "number",
        "title": "High Vulnerabilities"
      },
      "mediumVulns": {
        "type": "number",
        "title": "Medium Vulnerabilities"
      },
      "lowVulns": {
        "type": "number",
        "title": "Low Vulnerabilities"
      }
    },
    "required": [
      "name",
      "tag",
      "fullName"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "jfrog_repository": {
      "title": "Jfrog Repository",
      "target": "jfrogRepository",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Jfrog XRay Container Vulnerability</summary>

```json showLineNumbers
{
  "identifier": "containerVulnerability",
  "title": "JFrog Container Vulnerability",
  "icon": "JfrogXray",
  "schema": {
    "properties": {
      "cve": {
        "title": "CVE",
        "description": "Common Vulnerabilities and Exposures identifier",
        "type": "string"
      },
      "cwe": {
        "title": "CwE",
        "description": "Common Weakness Enumeration identifier",
        "type": "array"
      },
      "severity": {
        "title": "Severity",
        "description": "Vulnerability severity level",
        "type": "string",
        "enum": ["Critical", "High", "Medium", "Low", "Informational", "Unknown"]
      },
      "status": {
        "title": "Status",
        "description": "Current status of the vulnerability",
        "type": "string",
        "enum": ["Open", "Fixed", "Ignored", "Not Applicable"]
      },
      "component": {
        "title": "Component",
        "description": "Affected component/package name",
        "type": "string"
      },
      "imageName": {
        "title": "Image Name",
        "description": "Container image full name",
        "type": "string"
      },
      "imageTag": {
        "title": "Image Tag",
        "description": "Container image tag",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "description": "Detailed description of the vulnerability",
        "type": "string",
        "format": "markdown"
      },
      "summary": {
        "title": "Summary",
        "description": "Brief summary of the vulnerability",
        "type": "string"
      },
      "created": {
        "title": "Created",
        "description": "When the vulnerability was created",
        "type": "string",
        "format": "date-time"
      },
      "cvssScore": {
        "title": "CVSS Score",
        "description": "Common Vulnerability Scoring System score",
        "type": "number"
      },
      "issueId": {
        "title": "Issue ID",
        "description": "Internal issue identifier from JFrog Xray",
        "type": "string"
      },
      "provider": {
        "title": "Provider",
        "description": "Vulnerability data provider",
        "type": "string"
      },
      "manifestPath": {
        "title": "Manifest Path",
        "description": "Path to the container manifest file",
        "type": "string"
      },
      "artifactPath": {
        "title": "Artifact Path",
        "description": "Full path to the affected artifact",
        "type": "string"
      },
      "packageType": {
        "title": "Package Type",
        "description": "Type of package containing the vulnerability",
        "type": "string"
      }
    },
    "required": [
      "cve",
      "severity", 
      "status",
      "component",
      "imageName",
      "created"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "containerImage": {
      "title": "Container Image",
      "target": "jfrogContainerImage", 
      "required": false,
      "many": false
    }
  }
}
```

</details>
:::tip Blueprint Properties
You can modify the properties in your blueprints depending on what you want to track in your JFrog repositories, builds and projects.
:::

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>JFrog webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `JFrog mapper`;
   2. Identifier : `jfrogMapper`;
   3. Description : `A webhook configuration to map JFrog repositories and builds to Port`;
   4. Icon : `JfrogXray`;
2. **Integration configuration** tab - fill the following JQ mapping:

```json
[
  {
    "blueprint": "jfrogBuild",
    "filter": ".body.event_type == 'uploaded'",
    "entity": {
      "identifier": ".body.build_name",
      "title": ".body.build_name",
      "properties": {
        "name": ".body.build_name",
        "uri": "'/' + .body.build_name",
        "lastStarted": ".body.build_started"
      }
    }
  },
  {
    "blueprint": "jfrogDockerTag",
    "filter": ".body.event_type == 'pushed'",
    "entity": {
      "identifier": ".body.name",
      "title": ".body.name",
      "properties": {
        "name": ".body.name",
        "imageName": ".body.image_name",
        "path": ".body.path",
        "sha256": ".body.sha256",
        "size": ".body.size",
        "tag": ".body.tag",
        "platforms": ".body.platforms[] | \"(.os):(.architecture)\""
      },
      "relations": {
        "repository": ".body.repo_key"
      }
    }
  },
  {
    "blueprint": "jfrogArtifact",
    "filter": ".body.event_type == 'deployed'",
    "entity": {
      "identifier": ".body.data.name",
      "title": ".body.data.name",
      "properties": {
        "name": ".body.data.name",
        "path": ".body.data.path",
        "sha256": ".body.data.sha256",
        "size": ".body.data.size"
      },
      "relations": {
        "repository": ".body.data.repo_key"
      }
    }
  }
]
```

:::note
Take note of, and copy the Webhook URL that is provided in this tab
:::

3. Click **Save** at the bottom of the page.
</details>

## Create a webhook in JFrog

1. Log in to JFrog as a user with admin privileges
2. Click the gear icon at the top right corner at the left side of the user icon;
3. Choose **Platform Management**;
4. At the bottom of the sidebar on the left, just below **General**, choose **Webhooks**;
5. Click on **Create a WebHook**
6. Input the following details:
   1. `Name` - use a meaningful name such as **Port-Artifact**;
   2. `Description` - enter a description for the webhook;
   3. `URL` - enter the value of the `url` key you received after creating the webhook configuration in Port;
   4. `Events` - Under **Artifacts**, select **Artifact was deployed** and select all repositories that apply;
7. Click **Create** at the bottom of the page.
8. Create two more webhooks using the details:
   1. For builds:
      - Name: **Port-Build**;
      - Events: Under **Builds**, select **Build was uploaded** and select all builds that apply;
      - `Description` - enter a description for the webhook;
      - `URL` - enter the value of the `url` key you received after creating the webhook configuration in Port;
   2. For Docker tags:
      - Name: **Port-Docker-Tag**;
      - Events: Under **Docker**, select **Docker tag was pushed** and select all repositories that apply

:::tip
In order to view the different payloads and events available in JFrog webhooks, [look here](https://jfrog.com/help/r/jfrog-platform-administration-documentation/event-types)
:::

Done! Any artifact you publish, build you trigger, or artifact you upload will trigger a webhook event that JFrog will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample webhook event sent from JFrog when a build is uploaded. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a JFrog build is uploaded:

<details>
<summary>Webhook event payload</summary>

```json showLineNumbers
{
  "build_name": "sample_build_name",
  "event_type": "uploaded",
  "build_number": "1",
  "build_started": "2020-06-18T14:40:49.869+0300"
}
```

</details>

### Mapping Result

```json showLineNumbers
{
  "identifier": "sample_build_name",
  "title": "sample_build_name",
  "blueprint": "jfrogBuild",
  "properties": {
    "name": "sample_build_name",
    "uri": "/sample_build_name",
    "lastStarted": "21 hours ago"
  },
  "relations": {},
  "filter": true
}
```

## Import JFrog Historical Builds, Repositories, Projects, Containers and XRay Vulnerabilities

In this example you are going to use the provided Python script to fetch data from the JFrog Server API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint and webhook](#port-configuration) definition from the previous section.

In addition, you require the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `JFROG_ACCESS_TOKEN` - You can get that by following instructions in the [Jfrog documentation](https://jfrog.com/help/r/jfrog-platform-administration-documentation/access-tokens)
- `JFROG_HOST_URL` - The host URL of your Jfrog instance

:::info
Find your Port credentials using this [guide](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
:::

Use the following Python script to ingest historical JFrog builds, repositories and projects into Port:

<details>
<summary>JFrog Python script for historical builds, repositories, projects, containers and XRay vulnerabilities</summary>

```python showLineNumbers
# JFrog Port Integration Script
# 
# This script synchronizes JFrog Artifactory and Xray data with Port.
# It imports repositories, builds, projects, container images, and security vulnerabilities.
#
# SETUP:
# 1. Install dependencies: pip install python-dotenv requests
# 2. Create .env file with required credentials:
#    PORT_CLIENT_ID=your_port_client_id
#    PORT_CLIENT_SECRET=your_port_client_secret
#    JFROG_ACCESS_TOKEN=your_jfrog_access_token
#    JFROG_HOST_URL=https://your-instance.jfrog.io
# 3. Import Port blueprints from provided in the documentation
#
# USAGE:
# python jfrog-script.py

# Dependencies to install
# pip install python-dotenv
# pip install requests

import logging
import os
import time
from datetime import datetime

import dotenv
import requests

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PORT_API_URL = "https://api.getport.io/v1"
PORT_CLIENT_ID = os.getenv("PORT_CLIENT_ID")
PORT_CLIENT_SECRET = os.getenv("PORT_CLIENT_SECRET")
JFROG_ACCESS_TOKEN = os.getenv("JFROG_ACCESS_TOKEN")
JFROG_HOST_URL = os.getenv("JFROG_HOST_URL")


class Blueprint:
    REPOSITORY = "jfrogRepository"
    BUILD = "jfrogBuild"
    PROJECT = "jfrogProject"
    CONTAINER_IMAGE = "containerImage"
    CONTAINER_VULNERABILITY = "containerVulnerability"


## Get Port Access Token
credentials = {"clientId": PORT_CLIENT_ID, "clientSecret": PORT_CLIENT_SECRET}
token_response = requests.post(f"{PORT_API_URL}/auth/access_token", json=credentials)
access_token = token_response.json()["accessToken"]

# You can now use the value in access_token when making further requests
headers = {"Authorization": f"Bearer {access_token}"}


def add_entity_to_port(blueprint_id, entity_object, transform_function):
    """A function to create the passed entity in Port

    Params
    --------------
    blueprint_id: str
        The blueprint id to create the entity in Port

    entity_object: dict
        The entity to add in your Port catalog

    transform_function: function
        A function to transform the entity object to the Port entity object

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    logger.info(f"Adding entity to Port: {entity_object}")
    entity_payload = transform_function(entity_object)
    response = requests.post(
        (
            f"{PORT_API_URL}/blueprints/"
            f"{blueprint_id}/entities?upsert=true&merge=true"
        ),
        json=entity_payload,
        headers=headers,
    )
    logger.info(response.json())


def get_all_builds():
    logger.info("Getting all builds")
    url = f"{JFROG_HOST_URL}/artifactory/api/build"
    try:
        response = requests.get(
            url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN}
        )
        response.raise_for_status()
        builds = response.json()["builds"]
        return builds
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching JFrog builds: {e}")
        return []


def get_all_repositories():
    logger.info("Getting all repositories")
    url = f"{JFROG_HOST_URL}/artifactory/api/repositories"
    try:
        response = requests.get(
            url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN}
        )
        response.raise_for_status()
        repositories = response.json()
        return repositories
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching JFrog repositories: {e}")
        return []

def get_all_projects():
    logger.info("Getting all projects")
    url = f"{JFROG_HOST_URL}/access/api/v1/projects"
    try:
        response = requests.get(
            url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN}
        )
        response.raise_for_status()
        projects = response.json()
        return projects
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching JFrog projects: {e}")
        return []

def get_project_roles(project_key):
    """Get roles associated with a specific JFrog project"""
    logger.info(f"Getting roles for project: {project_key}")
    url = f"{JFROG_HOST_URL}/access/api/v1/projects/{project_key}/roles"
    try:
        response = requests.get(
            url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN}
        )
        response.raise_for_status()
        roles = response.json()
        return roles
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching roles for project {project_key}: {e}")
        return []


def get_container_images():
    """Get all container images from Docker repositories"""
    logger.info("Getting container images from Docker repositories")
    
    repositories = get_all_repositories()
    docker_repos = [repo for repo in repositories if repo.get("packageType", "").lower() == "docker"]
    
    container_images = []
    
    for repo in docker_repos:
        repo_key = repo["key"]
        catalog_url = f"{JFROG_HOST_URL}/artifactory/api/docker/{repo_key}/v2/_catalog"
        try:
            catalog_resp = requests.get(catalog_url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN})
            if catalog_resp.status_code == 404: # a V1 repo might not have a catalog
                 logger.warning(f"Could not find catalog for repo {repo_key}, skipping.")
                 continue
            catalog_resp.raise_for_status()
            images_in_repo = catalog_resp.json().get("repositories", [])
            
            for image_name in images_in_repo:
                tags_url = f"{JFROG_HOST_URL}/artifactory/api/docker/{repo_key}/v2/{image_name}/tags/list"
                tags_resp = requests.get(tags_url, headers={"Authorization": "Bearer " + JFROG_ACCESS_TOKEN})
                if tags_resp.status_code == 404:
                    logger.warning(f"Could not find tags for image {image_name} in repo {repo_key}, skipping.")
                    continue
                tags_resp.raise_for_status()
                tags_data = tags_resp.json()
                
                tags = tags_data.get("tags")
                if not tags:
                    continue

                for tag in tags:
                    image_data = {
                        "name": image_name,
                        "tag": tag,
                        "repository": repo_key,
                        "fullName": f"{repo_key}/{image_name}:{tag}"
                    }
                    container_images.append(image_data)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error processing repo {repo_key}: {e}")
            continue

    return container_images


def get_container_manifest_path(image_data):
    """Get the SHA256 hash for a container image using the dependency graph API"""
    logger.info(f"Getting SHA256 hash for: {image_data['fullName']}")
    
    # Construct the base path for the image tag
    base_path = f"default/{image_data['repository']}/{image_data['name']}/{image_data['tag']}"
    
    # Use the dependency graph API to get the SHA256
    url = f"{JFROG_HOST_URL}/xray/api/v1/dependencyGraph/artifact"
    payload = {
        "path": f"{base_path}"
    }
    
    logger.info(f"Using path for dependency graph: {base_path}")
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={
                "Authorization": "Bearer " + JFROG_ACCESS_TOKEN,
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract SHA256 from the response
        if "artifact" in data and "sha256" in data["artifact"]:
            sha256 = data["artifact"]["sha256"]
            logger.info(f"Found SHA256 hash: {sha256}")
            return sha256
            
        
        logger.warning(f"No SHA256 hash found in dependency graph response for {image_data['fullName']}")
        return None
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting SHA256 hash for {image_data['fullName']}: {e}")
        return None


def get_component_vulnerabilities(image_data):
    """Get vulnerabilities for a specific component"""
    logger.info(f"Getting vulnerabilities for component: {image_data['fullName']}")
    
    # Get the SHA256 hash
    sha256_hash = get_container_manifest_path(image_data)
    
    if not sha256_hash:
        logger.warning(f"Could not get SHA256 hash for {image_data['fullName']}, skipping vulnerability scan")
        return []
    
    url = f"{JFROG_HOST_URL}/xray/api/v1/summary/artifact"
    payload = {
        "checksums": [sha256_hash]
    }
    
    logger.info(f"Using SHA256 hash for vulnerability scan: {sha256_hash}")
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={
                "Authorization": "Bearer " + JFROG_ACCESS_TOKEN,
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        data = response.json()
        
        vulnerabilities = []
        if not data.get("artifacts"):
            if data.get("errors"):
                logger.warning(f"Could not fetch vulnerabilities for {image_data['fullName']}: {data['errors'][0]['error']}")
            return []

        artifact = data["artifacts"][0]
        artifact_general = artifact.get("general", {})
        
        for issue in artifact.get("issues", []):
            for cve in issue.get("cves", []):
                
                # Extract only the fields present in the simplified blueprint
                vulnerability_obj = {
                    # Core vulnerability info (required fields)
                    "cve": cve.get("cve", ""),
                    "severity": issue.get("severity", "Unknown"),
                    "status": "Open",  # Default status
                    "component": artifact_general.get("name", image_data.get("name", "Unknown")),
                    "imageName": image_data["fullName"],
                    "created": issue.get("created"),
                    
                    # Additional fields from blueprint
                    "cwe": cve.get("cwe", []),  # CWE identifiers as array
                    "imageTag": image_data["tag"],
                    "description": issue.get("description", ""),
                    "summary": issue.get("summary", ""),
                    "cvssScore": cve.get("cvss_v3_score") or cve.get("cvss_v2_score"),
                    "issueId": issue.get("issue_id", ""),
                    "provider": issue.get("provider", ""),
                    "artifactPath": artifact_general.get("path", ""),
                    "packageType": artifact_general.get("pkg_type", "")
                }
                
                # Clean up None values to avoid issues with Port
                vulnerability_obj = {k: v for k, v in vulnerability_obj.items() if v is not None}
                
                vulnerabilities.append(vulnerability_obj)
        
        return vulnerabilities
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching vulnerabilities for {image_data['fullName']}: {e}")
        return []


if __name__ == "__main__":
    logger.info("Starting Port integration")
    for repository in get_all_repositories():
        repository_object = {
            "key": repository["key"],
            "description": repository.get("description", ""),
            "type": repository["type"].upper(),
            "url": repository["url"],
            "packageType": repository["packageType"].upper(),
        }
        transform_build_function = lambda x: {
            "identifier": repository_object["key"],
            "title": repository_object["key"],
            "properties": {
                **repository_object,
            },
        }
        logger.info(f"Added repository: {repository_object['key']}")
        add_entity_to_port(
            Blueprint.REPOSITORY, repository_object, transform_build_function
        )

    logger.info("Completed repositories, starting builds")
    for build in get_all_builds():
        build_object = {
            "name": build["uri"].split("/")[-1],
            "uri": build["uri"],
            "lastStarted": build["lastStarted"],
        }
        transform_build_function = lambda x: {
            "identifier": build_object["name"],
            "title": build_object["name"],
            "properties": {
                **build_object,
            },
        }
        logger.info(f"Added build: {build_object['name']}")
        add_entity_to_port(Blueprint.BUILD, build_object, transform_build_function)
    
    logger.info("Completed builds, starting projects")
    for project in get_all_projects():
        project_key = project["project_key"]
        project_roles = get_project_roles(project_key)
        
        project_object = {
            "key": project_key,
            "name": project.get("display_name", ""),
            "description": project.get("description", ""),
            "adminPrivileges": project.get("admin_privileges", {}),
            "roles": project_roles
        }
        transform_project_function = lambda x: {
            "identifier": project_object["key"],
            "title": project_object["name"],
            "properties": {
                **project_object,
            },
        }
        logger.info(f"Added project: {project_object['name']}")
        add_entity_to_port(Blueprint.PROJECT, project_object, transform_project_function)
    
    logger.info("Completed projects, starting container images")
    all_container_images = get_container_images()
    for image in all_container_images:
        image_object = {
            "name": image["name"],
            "tag": image["tag"],
            "repository": image["repository"],
            "fullName": image["fullName"],
        }
        
        transform_image_function = lambda x: {
            "identifier": image_object["fullName"],
            "title": image_object["fullName"],
            "properties": {
                **image_object,
            },
        }
        logger.info(f"Added container image: {image_object['fullName']}")
        add_entity_to_port(Blueprint.CONTAINER_IMAGE, image_object, transform_image_function)
    
    logger.info("Completed container images, starting vulnerabilities scan")
    for image in all_container_images:
        vulnerabilities = get_component_vulnerabilities(image)
        for vuln in vulnerabilities:
            vuln_identifier = f"{image['fullName']}-{vuln['cve']}"
            transform_vuln_function = lambda x: {
                "identifier": vuln_identifier,
                "title": f"{vuln['cve']} in {image['fullName']}",
                "properties": {
                    **vuln
                },
                "relations": {
                    "containerImage": image["fullName"]
                }
            }
            logger.info(f"Adding vulnerability: {vuln['cve']} for image {image['fullName']}")
            add_entity_to_port(Blueprint.CONTAINER_VULNERABILITY, vuln, transform_vuln_function)

    logger.info("Port integration completed successfully")


```

</details>

Done! you can now import historical builds, repositories, projects, containers and XRay vulnerabilities from JFrog into Port. Port will parse them according to the mapping and update the catalog entities accordingly.
