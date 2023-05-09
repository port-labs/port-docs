---
sidebar_position: 1
---

# Auto Discovery

Actions Auto Discovery is a tool that automates the process of discovering and syncing GitHub Actions with Port.

You can run the tool and it will automatically sync your GitHub Actions workflows with Port Actions in a selected blueprint.

For more detailed information about how to use this tool, please refer to the README file in the [project's repository](https://github.com/port-labs/actions-auto-discovery).

# Usage example

```bash showLineNumbers
#!/bin/bash
export PORT_CLIENT_ID="PORT_CLIENT_ID"
export PORT_CLIENT_SECRET="PORT_CLIENT_SECRET"
export GITHUB_TOKEN="GITHUB_TOKEN"
export GITHUB_ORG_NAME="GITHUB_ORG_NAME"
export BLUEPRINT_IDENTIFIER="BLUEPRINT_IDENTIFIER"
export ACTION_TRIGGER="TRIGGER" # optional, defaults to CREATE
export REPO_LIST="repo1,repo2,repo3" # optional, defaults to all repositories in the organization(*), comma separated list of repositories repo1,repo2,repo3

curl -s https://raw.githubusercontent.com/port-labs/actions-auto-discovery/main/github-actions/sync.sh | bash
```
