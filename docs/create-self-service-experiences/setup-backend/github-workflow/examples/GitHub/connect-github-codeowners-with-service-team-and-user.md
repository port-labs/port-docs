# Connect GitHub CODEOWNERS with Service, GitHub Team and User

This guide shows you how to map CODEOWNERS file patterns in GitHub repositories (Service) to their respective Service, Team and User in port.

:::tip Prerequisites
This guide assumes that:
- You have a Port account and that you have finished the [onboarding process](/quickstart).
- You have the [GitHub exporter installed and configured in your environment](/build-your-software-catalog/sync-data-to-catalog/git/github/installation.md)

:::

## Integrate GitHub resources with Port
The goal of this section is to fill the software catalog with data directly from your GitHub repositories. [Port's GitHub app](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/) allows you to import `services`, `pull requests`, `workflows`, `teams`, `users` and other GitHub objects. For the purpose of this guide, we shall focus on the User, Team and Service objects only. Follow the steps below to ingest your PR data to Port:

### Steps

1. Create the following GitHub action secrets:
    * PORT_CLIENT_ID - Your port [client id]([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials))
    * PORT_CLIENT_SECRET - Your port [client secret]([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials))

2. Create the following blueprints:

:::info Blueprints creation
If you already have the `githubUser`, `githubTeam` and `service` blueprints created, you do not need to recreate them. Ensure to adjust the relations' targets as necessary

:::

<details>
<summary><b>GitHub User Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubUser",
  "title": "Github User",
  "icon": "Microservice",
  "schema": {
    "properties": {},
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "user": {
      "title": "User",
      "target": "user",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>GitHub Team Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubTeam",
  "title": "GitHub Team",
  "icon": "Github",
  "schema": {
    "properties": {
      "slug": {
        "title": "Slug",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "link": {
        "title": "Link",
        "icon": "Link",
        "type": "string",
        "format": "url"
      },
      "permission": {
        "title": "Permission",
        "type": "string"
      },
      "notification_setting": {
        "title": "Notification Setting",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>


<details>
<summary><b>Service (GitHub Repository) Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "title": "Service URL",
        "type": "string",
        "format": "url"
      },
      "defaultBranch": {
        "title": "Default branch",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary><b>CODEOWNERS blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubCodeowners",
  "description": "This blueprint represents a CODEOWNERS file in a service",
  "title": "Github Codeowners",
  "icon": "Github",
  "schema": {
    "properties": {
      "location": {
        "type": "string",
        "title": "File location",
        "description": "File path to CODEOWNERS file"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "githubRepository",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>CODEOWNERS Pattern blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubCodeownersPattern",
  "description": "This blueprint represents a pattern in a CODEOWNERS file from a service",
  "title": "Github Codeowners Pattern",
  "icon": "Github",
  "schema": {
    "properties": {
      "pattern": {
        "type": "string",
        "title": "File & Folder pattern",
        "description": "Regex pattern depicting the folder or file the teams and users have access to"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "githubRepository",
      "required": false,
      "many": false
    },
    "user": {
      "title": "Users",
      "target": "githubUser",
      "required": false,
      "many": true
    },
    "codeownersFile": {
      "title": "Codeowners File",
      "target": "githubCodeowners",
      "required": true,
      "many": false
    },
    "team": {
      "title": "Teams",
      "target": "githubTeam",
      "required": false,
      "many": true
    }
  }
}

```

</details>

3. Create a `codeowners_parser.py` file at any convienient location in your Github Repository and copy this script into it:

:::info CODEOWNERS parser?
Prior to ingestion, a parser is run to extract teams, users, emails and file patterns from the `CODEOWNERS` file. This is then used to build up every instance of the `githubCodeowner` entity.

The placement of the file is not necessary as it tried to comb the codebase fo the `CODEOWNERS` file in the exact order defined by the [GitHub CODEOWNERS documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-file-location)
:::

<details>
<summary><b>`codeowners_parser.py` script (Click to expand)</b></summary>

```python showLineNumbers
import asyncio
import os
import re
import sys
from dataclasses import dataclass
from enum import StrEnum

import aiohttp
import requests
from loguru import logger

PORT_API_URL = "https://api.getport.io/v1"
PORT_CLIENT_ID = os.getenv("PORT_CLIENT_ID")
PORT_CLIENT_SECRET = os.getenv("PORT_CLIENT_SECRET")
REPOSITORY_NAME = os.getenv("REPO_NAME")

CODEOWNERS_PATTERN_BLUEPRINT = "githubCodeownersPattern"
CODEOWNERS_BLUEPRINT = "githubCodeOwners"

CODEOWNERS_FILE_PATHS = [
    ".github/CODEOWNERS",
    "CODEOWNERS",
    "docs/CODEOWNERS",
]


def get_codeowner_file():
    for path in CODEOWNERS_FILE_PATHS:
        if os.path.isfile(path):
            return path

    return None


CODEOWNERS_FILE = get_codeowner_file()

if not CODEOWNERS_FILE:
    print("Error parsing file: CODEOWNERS not found in the right location")
    sys.exit(1)


# Get Port Access Token
credentials = {"clientId": PORT_CLIENT_ID, "clientSecret": PORT_CLIENT_SECRET}
token_response = requests.post(f"{PORT_API_URL}/auth/access_token", json=credentials)
access_token = token_response.json()["accessToken"]

# You can now use the value in access_token when making further requests
headers = {"Authorization": f"Bearer {access_token}"}


async def add_entity_to_port(
    session: aiohttp.ClientSession, blueprint_id, entity_object
):
    """A function to create the passed entity in Port

    Params
    --------------
    blueprint_id: str
        The blueprint id to create the entity in Port

    entity_object: dict
        The entity to add in your Port catalog

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    logger.info(f"Adding entity to Port: {entity_object}")
    response = await session.post(
        (
            f"{PORT_API_URL}/blueprints/"
            f"{blueprint_id}/entities?upsert=true&merge=true"
        ),
        json=entity_object,
        headers=headers,
    )
    if not response.ok:
        logger.info("Ingesting {blueprint_id} entity to port failed, skipping...")
    logger.info(f"Added entity to Port: {entity_object}")


def remove_comment_lines(text: list[str]):
    COMMENT_CHAR = "#"
    for line in text:
        if (current_line := line.strip()) and not current_line.startswith(COMMENT_CHAR):
            yield line


def split_pattern_into_tokens(text: str):
    return text.split()


EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
TEAM_REGEX = r"\@[\w|-]+\/[\w+|-]+"
USERNAME_REGEX = r"\@[\w|-]+"


class GithubEntityType(StrEnum):
    USERNAME = "username"
    EMAIL = "email"
    TEAM = "team"


@dataclass
class GithubEntity:
    type: GithubEntityType
    value: str
    pattern: str


PATTERNS = {
    GithubEntityType.USERNAME: USERNAME_REGEX,
    GithubEntityType.EMAIL: EMAIL_REGEX,
    GithubEntityType.TEAM: TEAM_REGEX,
}


def parse_string_to_entity_type(text: str):
    for key, value in PATTERNS.items():
        if re.fullmatch(value, text):
            return key, text

    return None


def create_entity_from_value(
    entity_type: GithubEntityType, value: str, pattern: str
) -> GithubEntity:
    entity = GithubEntity(entity_type, value, pattern)
    return entity


async def provide_entities():
    with open(CODEOWNERS_FILE) as codeowners:
        # CODEOWNERS files aren't supposed to be more than 3mb so we can
        # safely load into memory
        cleaned_lines = remove_comment_lines(codeowners.readlines())

    for cleaned_line in cleaned_lines:
        tokens = split_pattern_into_tokens(cleaned_line)
        pattern, *entities = tokens
        valid_entries = list(filter(None, map(parse_string_to_entity_type, entities)))
        for entry in valid_entries:
            yield create_entity_from_value(*entry, pattern)


async def ingest_codeowner_pattern_entity(
    entity: GithubEntity, session: aiohttp.ClientSession
):
    entity_object = {
        "identifier": entity.pattern,
        "title": f"{entity.pattern} | {REPOSITORY_NAME}",
        "properties": {},
        "relations": {
            "team": entity.value if entity.type == GithubEntityType.TEAM else None,
            "service": REPOSITORY_NAME,
            "owner": entity.value
            if entity.type in [GithubEntityType.USERNAME, GithubEntityType.EMAIL]
            else None,
        },
    }

    await add_entity_to_port(session, CODEOWNERS_PATTERN_BLUEPRINT, entity_object)


async def main():
    logger.info("Starting Port integration")
    async with aiohttp.ClientSession() as session:
        entities = provide_entities()
        codeowner_entity = {
            "identifier": REPOSITORY_NAME,
            "title": f"Codeowners in {REPOSITORY_NAME}",
            "properties": {"location": CODEOWNERS_FILE},
            "relations": {"service": REPOSITORY_NAME},
        }
        await add_entity_to_port(session, CODEOWNERS_BLUEPRINT, codeowner_entity)
        async for pattern_entity in entities:
            await ingest_codeowner_pattern_entity(pattern_entity, session)
    logger.info("Finished Port integration")


if __name__ == "__main__":
    asyncio.run(main())

```

</details>

4. Create a workflow file under `.github/workflows/ingest-codeowners.yml` using the workflow:

<details>
<summary><b>Ingest GitHub Codeowners workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Ingest Codeowners
on:
   push:
    branches:
      - 'main'
      - 'releases/**'

jobs:
  ingest_codeowners:
    runs-on: ubuntu-latest
  
  steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1
      
      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Ingest Codeowners
        run: |
          python <path/to/codeowners_parser.py>
        env:
          REPO_NAME: ${{ github.event.repository.name }}
```

</details>

:::info Execution frequency
This workflow will run on every change made to the branches specified to ensure the CODEOWNERS information is always up-to-date. This frequency choice is in line with GitHub's policy to enforce CODEOWNERS on the base branch a Pull Request is made to, rather than on every branch.

:::

5. Add content to your `CODEOWNERS` file and wait for data to be ingested into Port!

You have successfully mapped `CODEOWNERS` information using a GitHub workflow, into Port.