# Import From Backstage

Port provides a simple script that can be used to import data from your Backstage instance using the Backstage API into Port in a single click.
The script initializes the [blueprints](../../define-your-data-model/setup-blueprint/setup-blueprint.md) and [entities](../../sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) in Port based on the data in your Backstage instance.

:::tip

The source code of the import script is open and available on [**GitHub**](https://github.com/port-labs/backstage-import.git)

:::

## Prerequisites

- Docker;
- Port organization;
- Backstage instance.

## Usage

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

Done! after the script completes, you will see the new blueprints in Port, along with entities matching the data you have in your Backstage instance.

## Next Steps

### Export to GitOps

Once all entities have been imported to Port, you will likely want to start managing them through specification files in Git.

To do this, click on the three-dot icon in the top right corner of the Port UI, then select "Export Data" from the menu, followed by "Export to GitOps." This will download all the specification files to your local machine.

You can then push them to your GitOps repository and begin managing them from there.

To learn more about managing your Port entities using GitOps, refer to the [GitHub](../git/github/gitops/gitops.md) and [Bitbucket](../git/bitbucket/gitops/gitops.md) GitOps pages.
