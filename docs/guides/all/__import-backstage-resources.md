---
sidebar_position: 10
title: Import data from Backstage
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Import from Backstage

Port provides a simple script that can be used to import data from your Backstage instance into Port using the Backstage API.  
The script initializes the <PortTooltip id="blueprint">blueprints</PortTooltip> and <PortTooltip id="entity">entities</PortTooltip> in Port based on the data in your Backstage instance.

The source code of the import script is open and available on [**GitHub**](https://github.com/port-labs/backstage-import.git).

:::info Prerequisites

- While it is not mandatory for this guide, we recommend that you complete the [onboarding process](/getting-started/overview) before proceeding.
- [Docker](https://docs.docker.com/engine/install/).
- A Backstage instance.

:::

## Run the script

1. Clone the project repository repository:

```bash showLineNumbers
git clone https://github.com/port-labs/backstage-import.git
```

2. In the cloned repository, create a `.env` file with the following values:

```bash showLineNumbers
BACKSTAGE_URL=<YOUR BACKSTAGE URL i.e https://demo.backstage.io>
PORT_CLIENT_ID=<YOUR PORT CLIENT ID>
PORT_CLIENT_SECRET=<YOUR PORT CLIENT SECRET>
```

3. Run the import script:

```bash showLineNumbers
./import.sh
```

Done! After the script completes, you will see new <PortTooltip id="blueprint">blueprints</PortTooltip> in Port, along with <PortTooltip id="entity">entities</PortTooltip> matching the data you have in your Backstage instance.

## Next steps

### Use Gitops to manage your resources

Once all of the data has been imported to Port, you will likely want to start managing it through specification files in Git.

1. Go to your [Port account](https://app.getport.io/).
2. Click on the `...` icon in the top right corner, then select "Export Data".
3. Choose the blueprints you would like to export, select the `GitOps` format, and click `Export`.

This will download all the specification files to your local machine. You can then push them to your GitOps repository and begin managing them from there.

To learn more about managing your Port entities using GitOps, refer to the [GitHub](/build-your-software-catalog/sync-data-to-catalog/git/github/gitops/gitops.md) and [Bitbucket](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/gitops/gitops.md) GitOps pages.
