---
sidebar_position: 0
---
import ProjectBlueprint from './project/\_project.mdx'
import ProjectAppConfig from './project/\_port_app_config.mdx'
import CloudResourceBlueprint from './cloud_resource/\_cloud_resource_blueprint.mdx'
import CloudResourceAppConfig from './cloud_resource/\_port_app_config.mdx'

# Examples

This page contains the base examples for mapping GCP resources to Port.

This base example thrives to provide a simpler and more abstract way to map GCP resources to Port.

The simplification is achieved by using the generic `cloudResource` blueprint, which can be used to map any GCP resource to Port.

## Mapping GCP Projects

In the following example you will ingest your GCP Projects to Port, you may use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<ProjectAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Project](https://cloud.google.com/resource-manager/reference/rest/v3/projects#Project)

## Mapping Cloud Resources

In the following example you will ingest your GCP Resources to Port, you may use the following Port blueprint definitions and integration configuration:

:::note Relate resources and Projects

The Resources below have a relation to the Project, so the creation of the [Project](#mapping-gcp-projects) is required.

<CloudResourceBlueprint/>

<CloudResourceAppConfig/>

## Mapping Extra Resources

The resources in this page are only a few of the resources that the GCP Integration supports.

If the resources you want to ingest into Port do not appear in these examples, you can head to the [Mapping Extra Resources](./mapping_extra_resources.md) page to learn about all of the kinds of GCP resources that are supported by the GCP integration and how to map them into Port.
