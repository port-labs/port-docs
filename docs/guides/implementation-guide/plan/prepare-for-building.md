# Prepare for building

This page will guide you through some initial steps to prepare for building your portal.

### Plan for integration and customization

List the tools and platforms in your tech stack that you want to ingest into your developer portal.

Port offers a wide range of [pre-built integrations](/build-your-software-catalog/sync-data-to-catalog/) for popular tools, but you can also create custom integrations for any other tool using Port's API.

:::tip Optional - Define installation method
Port's pre-built integrations can be installed using several different methods, see [Jira](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/#setup) for example.  
The installation method mainly depends on your infrastructure and processes.  
You can can consider defining this now, or later during the implementation phase.
:::

### Invite relevant initial users to Port

Invite users to your Port account who will be responsible for the initial setup and configuration of the portal, and assign them the appropriate roles.  
Port offers three user roles:
- `Admin`: Has full access to all components in the portal, can perform any operation.
- `Moderator` of a blueprint: Can perform any operation on a specific blueprint and its entities. Users can be moderators of multiple blueprints.
- `Member`: Has read-only permissions, can execute self-service actions.  

Read more about roles and permissions [here](https://docs.getport.io/sso-rbac/rbac/).

### Next step - build

Once you have completed the planning phase, proceed to the [Build phase](/guides/implementation-guide/build/install-integrations) to start building components in your portal.