---
sidebar_position: 8
title: Port n8n node
---

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'
import N8nOperationsList from '@site/src/components/N8nOperationsList'

# Port n8n node

<BetaFeatureNotice id="ai-form" />

Port provides a custom n8n node (`n8n-nodes-portio`) that simplifies integration with Port's AI agents and API. Instead of making manual HTTP requests for authentication, invocation, and response retrieval, the Port node handles all of this automatically, making it easy to build powerful automation workflows that leverage Port's Context Lake.

This guide walks you through installing and configuring Port's custom n8n node in your n8n instance.

<img src='/img/guides/n8n-port-node/5-n8n-connect-port-node.png' border="1px" width="80%" />

## Prerequisites

Before you begin, ensure you have:

- **npm installed** — Required for installing the Port n8n node package. npm comes with Node.js, [install Node.js](https://nodejs.org/) if you don't have it.
- **A working n8n instance** — Either n8n Cloud or a self-hosted instance. If you don't have one, follow n8n's [guide on using Docker](https://docs.n8n.io/hosting/installation/installation/docker/).
- **Port API credentials** — Your Port `Client ID` and `Client Secret`. [Learn how to get them](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- **A Port account with AI features enabled** — Required for using Port AI agents in your workflows.
- We recommend [creating a dedicated service account](https://docs.port.io/sso-rbac/users-and-teams/manage-users-teams/#service-accounts) in Port for each workflow or agent integration. This improves security and makes it easier to manage credentials.

## Set up n8n instance

If you don't have an n8n instance running, you can set one up using Docker. The location where you mount the n8n data directory is important; this is where you will install the Port n8n node package.

### Using Docker (bind mount)

Using a bind mount allows the container to read/write directly to your local filesystem, making it easier to install and manage the Port n8n node package.

1. **Create a directory for n8n data** (we will call this `$n8n_HOME`):

   ```bash
   mkdir -p ~/n8n-data
   ```

2. **Run n8n with a bind mount**:

   ```bash showLineNumbers
   docker volume create n8n_data

   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -e GENERIC_TIMEZONE="Africa/Accra" \
     -e TZ="Africa/Accra" \
     -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
     -e N8N_RUNNERS_ENABLED=true \
     -e N8N_COMMUNITY_PACKAGES_ENABLED=true \
     -v ~/n8n-data:/home/node/.n8n \
     docker.n8n.io/n8nio/n8n
   ```

   :::tip Configuration notes
   - The `N8N_COMMUNITY_PACKAGES_ENABLED=true` environment variable is required for n8n to load community-installed nodes like the Port n8n node.
   - Replace `"Africa/Accra"` with your preferred timezone. The `GENERIC_TIMEZONE` and `TZ` environment variables should match.
   - Replace `~/n8n-data` with the actual local path you want to use such as `/Users/janedoe/n8n-data`. Anything n8n writes to `/home/node/.n8n` (inside the container) will persist directly to your local directory.
   :::

3. **Access n8n** — Open your browser and navigate to `http://localhost:5678`.

### Using Docker Compose

If you prefer using Docker Compose, create a `docker-compose.yml` file:

```yaml showLineNumbers
version: '3'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Europe/Madrid
      - TZ=Europe/Madrid
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
    volumes:
      - ./n8n-data:/home/node/.n8n
```

   The `N8N_COMMUNITY_PACKAGES_ENABLED=true` environment variable is required for n8n to load community-installed nodes like the Port n8n node.

Then run:

```bash showLineNumbers
# Navigate to the directory containing your docker compose file
cd /path/to/your/compose/file/directory

# Pull latest version
docker compose pull

# Start the container
docker compose up -d
```

## Install Port's n8n node

Now that you have n8n running, let's install Port's custom node using npm.

### Install the npm package

1. **Navigate to your n8n data directory** (the `$n8n_HOME` directory you created earlier):

   ```bash
   cd ~/n8n-data
   ```

2. **Install the Port n8n node package**:

   ```bash showLineNumbers
   mkdir -p custom
   cd custom
   npm i @port-labs/n8n-nodes-portio-experimental
   ```

   The package is installed in the `custom` folder in your n8n data directory (`$n8n_HOME`).

3. **Restart your n8n instance**:

   - **If using Docker**: Stop the container (`Ctrl+C` or `docker stop n8n`) and start it again with the same command.
   - **If using Docker Compose**: Run `docker compose restart`.

   :::caution Restart required
   n8n needs to be restarted after installing community packages so it can discover and load them. Make sure `N8N_COMMUNITY_PACKAGES_ENABLED=true` is set in your Docker configuration.
   :::

The Port n8n node package is available on npm at [@port-labs/n8n-nodes-portio-experimental](https://www.npmjs.com/package/@port-labs/n8n-nodes-portio-experimental). The package is currently in experimental status.

## Quick start

Now that the Port node is installed, let us verify it works by creating a simple workflow.

### Add a Port node to your workflow

1. **Create a new workflow** in your n8n instance.

   <img src='/img/guides/n8n-port-node/1-n8n-create-workflow-button.png' border="1px" width="100%" />

2. **Add a trigger** — For testing, add a **Manual Trigger** node so you can trigger the workflow manually by clicking the **Execute Workflow** button.

   <img src='/img/guides/n8n-port-node/2-n8n-manual-trigger-workflow.png' border="1px" width="60%" />

3. **Add the Port node**:
   - Click the **+** button on the left side of the screen to add a new node
   - Search for `port` in the node search

   <img src='/img/guides/n8n-port-node/3-n8n-search-port-node.png' border="1px" width="50%" />

4. **Select a Port node** — Click the "Port.io" search result and select "General Purpose AI Interaction" (this is the easiest one to test with).

   <img src='/img/guides/n8n-port-node/4-n8n-general-node.png' border="1px" width="50%" />

5. **Connect the nodes** — Drag from the **+** icon on the trigger node to the left side of the Port AI node to connect them.

   <img src='/img/guides/n8n-port-node/5-n8n-connect-port-node.png' border="1px" width="70%" />

   :::tip Success!
   You have successfully deployed your first Port n8n node! The node is now available in your n8n instance.
   :::

### Configure Port credentials

Before you can use the Port node, you need to add your Port API credentials.

1. **Open the Port node** — Double-click the Port AI node you just added.

2. **Create a new credential**:
   - At the top of the node configuration, you will see a dropdown named `Credential to connect with`
   - Click this dropdown and select `Create new credential`

3. **Enter your Port credentials**:
   - **Client ID** — Your Port Client ID
   - **Client Secret** — Your Port Client Secret

   <img src='/img/guides/n8n-port-node/6-n8n-port-credentials.png' border="1px" width="50%" />

   If you're not sure how to get your Port credentials, see the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).

4. **Save the credential** — Click "Save" to store the credential.

   You can store multiple Port account credentials in n8n and select which one to use for each node. This is useful if you work with multiple Port organizations.

## Verify the installation

To verify everything is working:

1. **Configure the Port node** — In the **General Purpose AI Interaction** node:
   - Select your Port credential from the dropdown
   - Enter a simple prompt like "List all ec2 instances in the eu-west region"
   - Save the node
   <img src='/img/guides/n8n-port-node/7-n8n-example-question.png' border="1px" width="50%" />

2. **Execute the workflow** — Click **Execute Workflow** to test the connection.

3. **Check the output** — If successful, you should see the AI response in the node output.


## Available operations

The Port n8n node provides operations for interacting with Port's AI capabilities. Each operation corresponds to a different use case for querying and automating with Port's Context Lake.

<N8nOperationsList />

## What's next?

Now that you have Port's n8n node installed and configured, you can:

- **Build automation workflows** — Use Port's Context Lake to enrich your n8n workflows with organizational context
- **Integrate with AI agents** — Invoke Port AI agents from n8n workflows
- **Query the catalog** — Access service metadata, ownership, dependencies, and more

## Related guides

- [Remediate security vulnerability with n8n and Port AI](/guides/all/remediate-vulnerability-with-n8n-and-port) — Example workflow using Port as a context lake for vulnerability management
- [Port n8n nodes repository](https://github.com/port-labs/port-n8n-nodes) — Source code and detailed documentation for the Port n8n nodes

## Troubleshooting

### Node not appearing in n8n

- **Check package installation** — Verify that `npm i @port-labs/n8n-nodes-portio-experimental` completed successfully. Check for a `node_modules` directory in your `$n8n_HOME` directory.
- **Verify environment variable** — Ensure `N8N_COMMUNITY_PACKAGES_ENABLED=true` is set in your Docker configuration
- **Check installation location** — Make sure the package is installed in the same directory that's mounted to `/home/node/.n8n` in the Docker container
- **Restart n8n** — Community packages are only loaded when n8n starts, so a restart is required after installation

### Credential errors

- **Verify credentials** — Double-check that your Client ID and Client Secret are correct
- **Check AI features** — Ensure your Port account has AI features enabled
- **Test API access** — Try making a direct API call to verify your credentials work

