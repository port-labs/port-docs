---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# GitOps

Port's Bitbucket (Self-Hosted) makes it possible to manage Port entities with a GitOps approach, making your code repositories into the source of truth for the various infrastructure assets you want to manage.

## 💡 Bitbucket (Self-Hosted) GitOps common use cases

- Use Bitbucket server as the source-of-truth for your **microservices**, **packages**, **libraries** and other software catalog assets.
- Allow developers to keep the catalog up-to-date, by making updates to files in their Git repositories.
- Create a standardized way to document software catalog assets in your organization.

## Managing entities using GitOps

To manage entities using GitOps, you will need to add a `port.yaml` file to the **root directory** of your repository in the **default branch** (usually `main`). The `port.yaml` file must be placed in the root directory of your repository. 

Repository folder structure should look like this example:

```
root
|
+- port.yml
|
+-+ module1
|   |
|   +- README.md
|   |
|   +-+ src
...
```

The `port.yaml` file can specify one or more Port entities that will be ingested to Port, and any change made to the `port.yaml` file will also be reflected inside Port.

This configuration turns your Bitbucket server repositories to the source-of-truth for the software catalog.

### GitOps port.yaml file

The `port.yaml` file defines your Port entities, which are managed via GitOps and have their data ingested from your Git repositories

Here are examples for valid `port.yaml` files:

<Tabs groupId="format">

<TabItem value="single" label="Single entity">

```yaml showLineNumbers
identifier: myEntity
title: My Entity
blueprint: myBlueprint
properties:
  myStringProp: myValue
  myNumberProp: 5
  myUrlProp: https://example.com
relations:
  mySingleRelation: myTargetEntity
  myManyRelation:
    - myTargetEntity1
    - myTargetEntity2
```

</TabItem>

<TabItem value="multiple" label="Multiple entities">

```yaml showLineNumbers
- identifier: myEntity1
  title: My Entity1
  blueprint: myFirstBlueprint
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
  relations:
    mySingleRelation: myTargetEntity
    myManyRelation:
      - myTargetEntity1
      - myTargetEntity2
- identifier: myEntity
  title: My Entity2
  blueprint: mySecondBlueprint
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
```

</TabItem>

</Tabs>

Since both of the valid `port.yaml` formats follow the same structure, the following section will explain the format based on the single entity example.

### port.yaml structure

The `port.yaml` file has the following structure:

- `identifier` (required): A unique identifier for the entity.
- `title` (required): The display name of the entity.
- `blueprint` (required): The blueprint identifier that this entity is an instance of.
- `properties` (optional): A map of property values for the entity.
- `relations` (optional): A map of relation values for the entity.

## Implementation

To implement GitOps with Bitbucket (Self-Hosted), you can use the provided Python script that will scan your repositories for `port.yaml` files and create or update entities in Port accordingly.

### Prerequisites

To use the GitOps functionality, you need to provide the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `BITBUCKET_HOST` - Bitbucket server host such as `http://localhost:7990`
- `BITBUCKET_USERNAME` - Bitbucket username to use when accessing the Bitbucket resources
- `BITBUCKET_PASSWORD` - Bitbucket account password
- `BITBUCKET_PROJECTS_FILTER` - An optional comma separated list of Bitbucket projects to filter. If not provided, all projects will be fetched.
- `PORT_API_URL` - An optional variable that defaults to the EU Port API `https://api.getport.io/v1`. For US organizations use `https://api.us.getport.io/v1` instead.

### Python Script

Here's a Python script that you can use to implement GitOps with Bitbucket (Self-Hosted):

<details>
<summary>Python script (Click to expand)</summary>

:::tip Latest Version
You can pull the latest version of this code by cloning this [repository](https://github.com/port-labs/bitbucket-workspace-data.git)
:::

```python showLineNumbers
import time
from datetime import datetime, timedelta
import asyncio
from typing import Any, Optional, Dict
import httpx
import yaml
from decouple import config
from loguru import logger
from httpx import BasicAuth
from pydantic import BaseModel, ValidationError

# These are the credentials passed by the variables of your pipeline to your tasks and into your env
PORT_CLIENT_ID = config("PORT_CLIENT_ID")
PORT_CLIENT_SECRET = config("PORT_CLIENT_SECRET")
BITBUCKET_USERNAME = config("BITBUCKET_USERNAME")
BITBUCKET_PASSWORD = config("BITBUCKET_PASSWORD")
BITBUCKET_API_URL = config("BITBUCKET_HOST")
BITBUCKET_PROJECTS_FILTER = config(
    "BITBUCKET_PROJECTS_FILTER", cast=lambda v: v.split(",") if v else None, default=[]
)
PORT_API_URL = config("PORT_API_URL", default="https://api.getport.io/v1")

# According to https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/
RATE_LIMIT = 1000  # Maximum number of requests allowed per hour
RATE_PERIOD = 3600  # Rate limit reset period in seconds (1 hour)
request_count = 0
rate_limit_start = time.time()
port_access_token, token_expiry_time = None, datetime.now()
port_headers = {}
bitbucket_auth = BasicAuth(username=BITBUCKET_USERNAME, password=BITBUCKET_PASSWORD)
client = httpx.AsyncClient(timeout=httpx.Timeout(60))


async def get_access_token():
    credentials = {"clientId": PORT_CLIENT_ID, "clientSecret": PORT_CLIENT_SECRET}
    token_response = await client.post(
        f"{PORT_API_URL}/auth/access_token", json=credentials
    )
    response_data = token_response.json()
    access_token = response_data["accessToken"]
    expires_in = response_data["expiresIn"]
    token_expiry_time = datetime.now() + timedelta(seconds=expires_in)
    return access_token, token_expiry_time


async def refresh_access_token():
    global port_access_token, token_expiry_time, port_headers
    logger.info("Refreshing access token...")
    port_access_token, token_expiry_time = await get_access_token()
    port_headers = {"Authorization": f"Bearer {port_access_token}"}
    logger.info(f"New token received. Expiry time: {token_expiry_time}")


async def refresh_token_if_expired():
    if datetime.now() >= token_expiry_time:
        await refresh_access_token()


async def refresh_token_and_retry(method: str, url: str, **kwargs):
    await refresh_access_token()
    response = await client.request(method, url, headers=port_headers, **kwargs)
    return response


async def send_port_request(method: str, endpoint: str, payload: Optional[dict] = None):
    global port_access_token, token_expiry_time, port_headers
    await refresh_token_if_expired()
    url = f"{PORT_API_URL}/{endpoint}"
    try:
        response = await client.request(method, url, headers=port_headers, json=payload)
        response.raise_for_status()
        return response
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            # Unauthorized, refresh token and retry
            logger.info("Received 401 Unauthorized. Refreshing token and retrying...")
            try:
                response = await refresh_token_and_retry(method, url, json=payload)
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Error after retrying: {e.response.status_code}, {e.response.text}"
                )
                return {"status_code": e.response.status_code, "response": e.response}
        else:
            logger.error(
                f"HTTP error occurred: {e.response.status_code}, {e.response.text}"
            )
            return {"status_code": e.response.status_code, "response": e.response}
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {e}")
        return {"status_code": None, "error": e}


async def add_entity_to_port(blueprint_id, entity_object):
    response = await send_port_request(
        method="POST",
        endpoint=f"blueprints/{blueprint_id}/entities?upsert=true&merge=true",
        payload=entity_object,
    )
    if not isinstance(response, dict):
        logger.info(response.json())


async def get_paginated_resource(
    path: str,
    params: dict[str, Any] = None,
    page_size: int = 25,
    full_response: bool = False,
):
    global request_count, rate_limit_start

    # Check if we've exceeded the rate limit, and if so, wait until the reset period is over
    if request_count >= RATE_LIMIT:
        elapsed_time = time.time() - rate_limit_start
        if elapsed_time < RATE_PERIOD:
            sleep_time = RATE_PERIOD - elapsed_time
            await asyncio.sleep(sleep_time)

        # Reset the rate limiting variables
        request_count = 0
        rate_limit_start = time.time()

    url = f"{BITBUCKET_API_URL}/rest/api/1.0/{path}"
    params = params or {}
    params["limit"] = page_size
    next_page_start = None

    while True:
        try:
            if next_page_start:
                params["start"] = next_page_start

            response = await client.get(url=url, auth=bitbucket_auth, params=params)
            response.raise_for_status()
            page_json = response.json()
            request_count += 1
            logger.debug(
                f"Requested data for {path}, with params: {params} and response code: {response.status_code}"
            )
            if full_response:
                yield page_json
            else:
                batch_data = page_json["values"]
                yield batch_data

            next_page_start = page_json.get("nextPageStart")
            if not next_page_start:
                break
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(
                    f"Could not find the requested resources {path}. Terminating gracefully..."
                )
                return
            logger.error(
                f"HTTP error with code {e.response.status_code}, content: {e.response.text}"
            )
        except httpx.HTTPError as e:
            logger.error(f"HTTP occurred while fetching Bitbucket data: {e}")
        logger.info(f"Successfully fetched paginated data for {path}")


async def get_single_project(project_key: str):
    response = await client.get(
        f"{BITBUCKET_API_URL}/rest/api/1.0/projects/{project_key}", auth=bitbucket_auth
    )
    response.raise_for_status()
    return response.json()


def parse_repository_file_response(file_response: dict[str, Any]) -> str:
    lines = file_response.get("lines", [])
    logger.info(f"Received port.yaml file with {len(lines)} entries")
    content = ""
    for line in lines:
        content += line.get("text", "") + "\n"
    return content


async def get_repositories(project: dict[str, Any]):
    repositories_path = f"projects/{project['key']}/repos"
    async for repositories_batch in get_paginated_resource(path=repositories_path):
        logger.info(
            f"received repositories batch with size {len(repositories_batch)} from project: {project['key']}"
        )
        await asyncio.gather(
            *(
                create_or_update_entity_from_yaml(
                    project_key=project["key"], repo_slug=repo["slug"]
                )
                for repo in repositories_batch
            )
        )


async def read_port_yaml_from_bitbucket(project_key, repo_slug):
    url = f"projects/{project_key}/repos/{repo_slug}/browse/port.yaml"
    port_yaml_file = ""
    async for port_file_batch in get_paginated_resource(
        path=url, page_size=500, full_response=True
    ):
        file_content = parse_repository_file_response(port_file_batch)
        port_yaml_file += file_content
    return yaml.safe_load(port_yaml_file)


async def create_or_update_entity_from_yaml(project_key, repo_slug):
    try:
        entity_data = await read_port_yaml_from_bitbucket(project_key, repo_slug)
        if entity_data:
            logger.info(f"Creating entity from port.yaml: {entity_data}")
            if isinstance(entity_data, dict):
                validated_entity = validate_port_yaml(entity_data)
                if validated_entity:
                    await add_entity_to_port(
                        blueprint_id=entity_data.get("blueprint"), entity_object=entity_data
                    )
            elif isinstance(entity_data, list):
                for entity in entity_data:
                    validated_entity = validate_port_yaml(entity)
                    if validated_entity:
                        await add_entity_to_port(
                            blueprint_id=entity.get("blueprint"), entity_object=entity
                        )
                    else:
                        logger.error(f"Invalid entity schema: {entity}")
            else:
                logger.error(f"Invalid entity port.yaml schema : {entity_data} with type {type(entity_data)}")
    except Exception as e:
        logger.error(f"Error reading port.yaml file: {str(e)}")
        return


class PortEntity(BaseModel):
    identifier: str
    title: str
    blueprint: str
    properties: Dict[str, Any]
    relations: Dict[str, Any]


def validate_port_yaml(data: dict):
    try:
        data["properties"] = data.get("properties") or {}
        data["relations"] = data.get("relations") or {}
        validated_entity = PortEntity(**data)
        return validated_entity.model_dump()
    except ValidationError as e:
        logger.error(f"Validation error for entity: {e.json()}")
        return None
    except Exception as e:
        logger.error(f"Error validating entity: {e}")
        return None


async def main():
    logger.info("Starting Bitbucket data extraction")
    if BITBUCKET_PROJECTS_FILTER:

        async def filtered_projects_generator():
            yield [await get_single_project(key) for key in BITBUCKET_PROJECTS_FILTER]

        projects = filtered_projects_generator()
    else:
        projects = get_paginated_resource(path="projects")
    async for projects_batch in projects:
        logger.info(f"received projects batch with size {len(projects_batch)}")
        for project in projects_batch:
            await get_repositories(project=project)

    logger.info("Bitbucket gitops completed")
    await client.aclose()


if __name__ == "__main__":
    asyncio.run(main())
```

</details>

### Running the Script

You can run this script periodically (e.g., using a cron job or CI/CD pipeline) to scan your Bitbucket Server repositories for `port.yaml` files and create or update entities in Port accordingly.

For example, you can create a GitHub Actions workflow that runs this script on a schedule:

:::info Host accessibility
If you're running this script using GitHub Actions or any other external CI/CD service, your Bitbucket Server host must be accessible over the internet. If your Bitbucket Server is deployed in a private network or behind a firewall, you'll need to ensure it's properly exposed or consider running the script from a machine within the same network that has access to both the Bitbucket Server and the internet.
:::

```yaml showLineNumbers
name: Bitbucket Server GitOps

on:
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours
  workflow_dispatch:  # Allow manual triggering

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install httpx pydantic python-decouple loguru pyyaml

      - name: Run GitOps script
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
          BITBUCKET_USERNAME: ${{ secrets.BITBUCKET_USERNAME }}
          BITBUCKET_PASSWORD: ${{ secrets.BITBUCKET_PASSWORD }}
          BITBUCKET_HOST: ${{ secrets.BITBUCKET_HOST }}
        run: python gitops.py
```

## Examples

Here's an example of a `port.yaml` file for a microservice:

```yaml
identifier: my-service
title: My Service
blueprint: microservice
properties:
  description: A service that does something awesome
  language: Python
  version: 1.0.0
  tier: Backend
  lifecycle: Production
  owner: Team A
  documentation: https://example.com/docs
relations:
  repository: my-service-repo
  team: team-a
```

This will create or update a microservice entity in Port with the specified properties and relations.

## Limitations

The GitOps script has a limitation regarding entity deletion - when an entity is removed from the `port.yaml` file, it will not be automatically deleted from your Port catalog. The script only handles creation and updates of entities that are explicitly defined in the `port.yaml` files.

To remove entities that are no longer needed in your catalog, you will need to delete them manually through Port's UI or API.


## Conclusion

Using GitOps with Bitbucket Server allows you to manage your Port entities directly from your code repositories, making it easier to keep your software catalog up-to-date and accurate. By adding a `port.yaml` file to your repositories, you can define the entities that should be created or updated in Port, and the provided Python script will handle the synchronization for you. 
