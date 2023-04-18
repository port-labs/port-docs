import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# GitLab

Our integration with GitLab allows you to export GitLab objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitLab resources.

## 💡 GitLab integration common use cases

Our GitLab integration makes it easy to fill the software catalog with data directly from your GitLab group, for example:

- Map all of the resources in your GitLab workspace, including **projects**, **merge requests** and other GitLab objects;
- Watch for GitLab object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- etc.

## How it works

Port's GitLab integration is deployed as a template from Port's template center, available from the DevPortal Builder page.

The template is constructed of 2 parts that create a complete mapping of your GitLab groups inside Port:

### Setup script

The setup script imports your existing information from GitLab's API - the setup script brings all existing information and objects from GitLab, to create an up to date mapping of your existing GitLab group.

In addition, the script also creates a [GitLab webhook](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html) that will send payloads to Port about events that occur in your GitLab environment (for example - a new project is created or merge request is opened);

### Port-Gitlab webhook

The [Port webhook](../../webhook/webhook.md) provides an endpoint for GitLab to send payloads to Port about events that occur in your GitLab environment.

The webhook also makes it possible to further customize how the payload events sent by GitLab are [mapped](../../webhook/webhook.md#mapping-configuration) to Port entities after the initial setup of the integration.

## Installation

To install Port's GitLab Integration, follow the [installation](./installation.md) guide.
