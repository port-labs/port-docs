# 🔌 Sync data to Software Catalog

Port offers several API Providers, allowing you to easily ingest and manage data with the tools you are already use in your infrastructure.

![Catalog Architecture](../../../static/img/sync-data-to-catalog/catalog-arch.jpg)

## Synching basics

Port follows the ETL principle to sync data into the catalog.

### Extract

With Port you can extract data spread across your infrastructure & tools.

For example:

- Kubernetes - xyz
- Github - xyz
- Jira -
- etc

### Transform

Once you indicated the datapoints to collect, you can modify (using JQ) the raw data into the format of your choice. This will ensure high-quality data representation.

For example:
xyz

## Load

The last part is decide where to locate the transformed data point.

For example:
I want replicaset to load into the x prop for blueprint y

## Sync integration methods

- REST
- CI/CD
- Kubernetes & ArgoCD
- IaC
- 3rd party Dev Tools
