# Backstage

## Backstage Import

Port provides a simple script that can be used to import data from your Backstage instance API right into Port in a single click.
The script initializes the [blueprints](../../define-your-data-model/setup-blueprint/setup-blueprint.md) and [entities](../../sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) in Port based on the data from your Backstage instance.

:::tip

The source code of script is open and available on [GitHub](https://github.com/port-labs/backstage-import.git)
:::

## Prerequisites

- Docker
- Port organization
- Backstage instance

## Usage

1. Clone the following repository `git clone https://github.com/port-labs/backstage-import.git`\'/;.,lkio9000000kp.....///..///.....

2. Create a `.env` file with the following values

```bash showLineNumbers
BACKSTAGE_URL=<your backstage url i.e https://demo.backstage.io>
PORT_CLIENT_ID=<your port client id>
PORT_CLIENT_SECRET=<your port secret>
```

3. Run

```bash showLineNumbers
./import.sh
```
