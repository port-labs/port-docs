---
sidebar_position: 6
---

# Microservice Dependency Mapping

Port make's your life easy when storing metadata about your microservices.

## Goal

Our goal is to see how we can use Port to maintain the current status of a microservice's package dependencies.

## Example

In this example we will review a use-case for maintaining package dependencies for a Microservice in a mono-repo environment.
Our development environment is Node and we manage our packages using yarn.

### Use-case setup

Lets review our Blueprints and repository structure so we can better understand what this use-case is trying to accomplish.

#### Blueprints

<details>
<summary>Microservice Blueprint</summary>

_Please notice the 'relations' seciton at the bottom of the Blueprint_

```json showLineNumbers
{
  "identifier": "micro",
  "description": "This blueprint represents service in our software catalog",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "on-call": {
        "type": "string",
        "icon": "Okta",
        "title": "On Call",
        "format": "email",
        "default": "developer@getport.io"
      },
      "language": {
        "type": "string",
        "icon": "Git",
        "title": "Language",
        "default": "Node",
        "enum": ["GO", "Python", "Node"],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue"
        }
      },
      "number-of-open-jira-issues": {
        "type": "number",
        "icon": "DevopsTool",
        "title": "Number of JIRA Issues",
        "default": 42
      },
      "product": {
        "title": "Product",
        "type": "string",
        "icon": "Docs",
        "default": "Analytics",
        "enum": ["SaaS", "Control Panel", "Analytics"],
        "description": "Choose product unit related to the service"
      },
      "url": {
        "type": "string",
        "title": "Github URL",
        "icon": "Github",
        "format": "url",
        "default": "https://git.com",
        "description": "the link to the repo in our github"
      },
      "config": {
        "title": "Service Config",
        "type": "object",
        "icon": "Argo",
        "default": {
          "foo": "bar"
        }
      },
      "monitor-links": {
        "title": "Monitor Tooling",
        "type": "array",
        "icon": "Datadog",
        "items": {
          "type": "string",
          "format": "url"
        },
        "default": [
          "https://grafana.com",
          "https://prometheus.com",
          "https://datadog.com"
        ]
      },
      "last-incident": {
        "icon": "CPU",
        "type": "string",
        "title": "Last Incident",
        "format": "date-time",
        "default": "2022-04-18T11:44:15.345Z"
      },
      "version": {
        "type": "string",
        "icon": "Package",
        "title": "Latest Version",
        "pattern": "[a-zA-Z0-9.]",
        "description": "A property that supports values specified by a regex pattern",
        "default": "Port1337"
      },
      "ip": {
        "title": "IPv4 Property",
        "icon": "Cluster",
        "type": "string",
        "format": "ipv4",
        "description": "An IPv4 property",
        "default": "127.0.0.1"
      }
    },
    "required": ["on-call"]
  },
  "mirrorProperties": {},
  "formulaProperties": {
    "slack-notifications": {
      "title": "Slack Notifications",
      "icon": "Link",
      "formula": "https://slack.com/{{$identifier}}"
    },
    "latest-build-output": {
      "title": "Latest Build Output",
      "icon": "Jenkins",
      "formula": "{{url}}/{{version}}"
    },
    "launch-darkly": {
      "title": "Launch Darkly",
      "icon": "Customer",
      "formula": "https://launchdarkly.com/{{$title}}"
    }
  },
  "relations": {
    "package": {
      "title": "Package",
      "target": "Package",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Package Blueprint</summary>

```json showLineNumbers
{
  "identifier": "Package",
  "title": "Package",
  "icon": "Package",
  "schema": {
    "properties": {
      "version": {
        "title": "Version",
        "type": "string"
      },
      "inHouse": {
        "title": "In-House?",
        "type": "boolean"
      }
    },
    "required": ["version"]
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {}
}
```

</details>

![blueprints.png](../../static/img/tutorial/complete-use-cases/microservice-dependency/blueprints.png)

For more information about Blueprints, click [here](https://docs.getport.io/platform-overview/port-components/blueprint).

#### Repository structure

Here is a [link](https://github.com/port-labs/demo-node-project) to the Git repository we will be working on during this use-case.

Directory tree:

```
.
├── README.md
├── package.json
├── apps
│   ├── frontend/
│   ├── backend/
│   └── db/
├── scripts
│   ├── scan-yarn-lock.py
    └── scan_requirements.txt
├── .github
│   └── workflows
│       └── update-packages.yml
└── yarn.lock
```

As stated before, in this example we will cover a mono-repo use case. In this repository, microservices are positioned in the 'apps/' directory, which we will refer to as MICROSERVICE_PATH.

```
# Later, this environment variable will be passed to the workflow in Github Actions
MICROSERVICE_PATH = 'apps/'
```

We will also persume that the directory names in MICROSERVICE_PATH (i.e. apps/frontend will be 'frontend', apps/backend will be 'backend') are the names of the different Microservices we are managing.

### Automating Entity creation

Let's begin by creating a Python script to handle scanning the 'yarn.lock' file. We will also implement Package entity creation, and update the exisiting Microservices with their relevant package dependencies.

[This Python script](https://github.com/port-labs/demo-node-project/blob/main/scripts/scan-yarn-lock.py) has some useful functions to interact with Port.
Have a look at:

```python
get_port_api_token()
    ...
report_to_port(blueprint, entity)
    ...
get_port_entity(blueprint, id)
    ...
```

### Triggering a run using Github Actions

In order to monitor the 'yarn.lock' file, we will create a Github Action which watches the lock file on 'main' branch. On a file change, we will run the Python script.

Here is the [link](https://github.com/port-labs/demo-node-project/blob/main/.github/workflows/update-packages.yml) to a demo workflow.

After setting up the Workflow, we are done!
On a push to main, if 'yarn.lock' has changed, the Python script will be triggered and Port will be updated.
