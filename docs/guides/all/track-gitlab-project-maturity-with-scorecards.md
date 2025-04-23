---
displayed_sidebar: null
description: Learn how to drive DevOps and DevSecOps governance in your organization by enforcing code maturity standards using scorecards with GitLab file search 
---

# Enforce code maturity with GitLab file search

Code maturity standards help teams to consistently follow engineering best practices like testing, linting, documentation, and CI. By tracking these signals with Port scorecards via GitLab file search, teams can monitor compliance, guide maturity, and reduce production risk.

This guide demonstrates how to set up a GitLab integration that uses file search to detect the presence of key configuration files (like `.gitlab-ci.yml`, `README.md`, or `package.json`), and then visualize and score these practices in Port.

## Common use cases

- **Encourage consistency**: Ensure all services have testing and deployment pipelines in place.
- **Track adoption of practices**: Identify which services still lack key maturity signals (e.g., no README, no linter config).
- **Gate production deployments**: Require a certain maturity level before deploying new services.

## Prerequisites
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have enabled [GitLab advanced search API](https://docs.gitlab.com/api/search/) in your GitLab environment.
- You have installed Port's [GitLab integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/gitlab/).


## Set up data model

Follow the steps below to **update** the `Service` blueprint:

1. Navigate to the `Service` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select `Edit JSON`.
3. Add the following boolean properties to capture repository maturity signals:

   <details>
   <summary><b>Repository file check properties (Click to expand)</b></summary>

   ```json showLineNumbers
      "hasCI": {
        "type": "boolean",
        "title": "Has CI"
      },
      "hasLicense": {
        "type": "boolean",
        "title": "Has License"
      },
      "usingFastapiPackage": {
        "type": "boolean",
        "title": "Uses FastAPI"
      },
      "usingOldLoggingPackage": {
        "type": "boolean",
        "title": "Use Old Logging"
      },
      "hasTests": {
        "type": "boolean",
        "title": "Has Test"
      },
      "hasContributingGuide": {
        "type": "boolean",
        "title": "Has Contributing Guide"
      },
      "hasLinter": {
        "type": "boolean",
        "title": "Has Linter"
      },
      "hasPoetryLock": {
        "type": "boolean",
        "title": "Has Poetry Lock"
      },
      "hasPythonVersionInPoetry": {
        "type": "boolean",
        "title": "Has Python Version in Poetry"
      },
      "hasTestInCi": {
        "type": "boolean",
        "title": "Has Test in CI"
      },
      "hasReadme": {
        "type": "boolean",
        "title": "Has Readme"
      }
   ```

   </details>

4. Click `Save` to update the blueprint.

<h3> Update GitLab integration configuration </h3>

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitLab integration.
3. Add the following YAML block into the `Mapping` editor to detect file presence:

    <details>
    <summary><b>GitLab Code Maturity Check Configuration (Click to expand)</b></summary>

    :::note supported search scope 
    Currently only search in the repository files (`blobs`) are supported
    :::

    ```yaml showLineNumbers
    - kind: project
        selector:
        query: 'true'
        includeLabels: 'false'
        port:
        entity:
            mappings:
            identifier: .path_with_namespace | gsub(" "; "")
            title: .name
            blueprint: '"gitlabRepository"'
            properties:
                url: .web_url
                description: .description
                language: .__languages | to_entries | max_by(.value) | .key
                namespace: .namespace.name
                fullPath: .namespace.full_path
                defaultBranch: .default_branch
                labels: .__labels
                hasLicense: search://scope=blobs&&query=filename:"LICENSE"
                usingFastapiPackage: search://scope=blobs&&query=fastapi filename:pyproject.toml
                hasCI: search://scope=blobs&&query=filename:.gitlab-ci.yml
                usingOldLoggingPackage: search://scope=blobs&&query=logging extension:py
                hasTests: search://scope=blobs&&query=filename:test_* extension:py
                hasContributingGuide: search://scope=blobs&&query=filename:CONTRIBUTING.md
                hasLinter: search://scope=blobs&&query=flake8 | black filename:pyproject.toml
                hasPoetryLock: search://scope=blobs&&query=filename:poetry.lock
                hasPythonVersionInPoetry: search://scope=blobs&&query="python =" filename:pyproject.toml
                hasTestInCi: search://scope=blobs&&query=pytest | python -m unittest filename:.gitlab-ci.yml
                hasReadme: search://scope=blobs&&query=filename:README.md
    ```
    </details>

4. Click `Save & Resync` to apply the mapping.

## Set up scorecard

Let's create a scorecard to assess code maturity based on the files present in each repo:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Search for the **Service** blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.
5. Add this JSON configuration:
    <details>
    <summary><b>Code Maturity Scorecard (click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "code_maturity",
    "title": "Code Maturity",
    "levels": [
        {
        "color": "paleBlue",
        "title": "Basic"
        },
        {
        "color": "darkGray",
        "title": "Low"
        },
        {
        "color": "orange",
        "title": "Medium"
        },
        {
        "color": "red",
        "title": "High"
        }
    ],
    "rules": [
        {
        "identifier": "has_ci",
        "title": "CI/CD Configuration",
        "description": "Ensures that CI pipelines exist to automate testing and deployments.",
        "level": "High",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasCI",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_license",
        "title": "License File",
        "description": "Project contains a LICENSE file. Indicates the project's usage and distribution rights.",
        "level": "Low",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasLicense",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_readme",
        "title": "Has README",
        "description": "Project contains a README file to describe the purpose, usage, and setup instructions. Encouraged for onboarding and documentation clarity.",
        "level": "Medium",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasReadme",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_tests",
        "title": "Has Tests",
        "description": "Project contains test files. This is a basic engineering quality requirement.",
        "level": "High",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasTests",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_tests_in_ci",
        "title": "Tests Run in CI",
        "description": "Ensures tests are executed in the CI pipeline, validating builds before deployment.",
        "level": "Medium",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasTestInCi",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_contrib_guide",
        "title": "Contributing Guide",
        "description": "Presence of a CONTRIBUTING.md file helps standardize external and internal collaboration.",
        "level": "Low",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasContributingGuide",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_linter",
        "title": "Code Linter Configured",
        "description": "Project includes standard linting configurations to enforce code quality and consistency.",
        "level": "Medium",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasLinter",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "uses_fastapi",
        "title": "Uses FastAPI",
        "description": "Project uses FastAPI, a modern Python web framework ideal for high-performance APIs.",
        "level": "Low",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "usingFastapiPackage",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "uses_old_logging",
        "title": "Uses Old Logging",
        "description": "Project uses the standard `logging` module. Consider structured logging or better alternatives like Loguru.",
        "level": "Low",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "usingOldLoggingPackage",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_poetry_lock",
        "title": "Poetry Lock File Present",
        "description": "Presence of `poetry.lock` indicates project uses Poetry for dependency management.",
        "level": "High",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasPoetryLock",
                "value": true
            }
            ]
        }
        },
        {
        "identifier": "has_python_version",
        "title": "Python Version Defined in Poetry",
        "description": "Specifying Python version in `pyproject.toml` improves reproducibility and environment stability.",
        "level": "Medium",
        "query": {
            "combinator": "and",
            "conditions": [
            {
                "operator": "=",
                "property": "hasPythonVersionInPoetry",
                "value": true
            }
            ]
        }
        }
    ]
    }
    ```
    </details>

6. Click on `Save` to create the scorecard.


After setting up the scorecard metrics on a service, it should look like this:

<img src="/img/guides/gitLabFileCheckScorecard.png" width="80%" border="1px" />