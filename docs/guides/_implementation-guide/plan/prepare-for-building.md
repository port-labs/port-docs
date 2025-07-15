# Prepare for building

This page will guide you through some initial steps to prepare for building your portal.

## Plan for integration and customization

According to your prioritized user-stories, list the tools and platforms in your tech stack with which you want to integrate your portal.  
For example, if you define a user-story like **"Developers will be able to quickly identify and resolve incidents"**, you will need to integrate with your incident management tool (e.g. **PagerDuty**).

Port offers a wide range of [pre-built integrations](/build-your-software-catalog/sync-data-to-catalog/) for popular tools, but you can also create custom integrations for any other tool using Port's API.

:::tip Optional - Define installation method
Port's pre-built integrations can be installed using several different methods, see [Jira](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/#setup) for example.  
The installation method mainly depends on your infrastructure and processes.  
You can can consider defining this now, or later during the implementation phase.
:::

## Sign up & onboard

Now that you have a clear plan for your portal, it's time to sign up and start creating it.

Port will guide you through an [onboarding process](/getting-started/overview) to help you get started.
## Invite relevant initial users to Port

Invite users to your Port account who will be responsible for the initial setup and configuration of the portal, and assign them the appropriate roles.  
Port offers three user roles:
- `Admin`: Has full access to all components in the portal, can perform any operation.
- `Moderator` of a blueprint: Can perform any operation on a specific blueprint and its entities. Users can be moderators of multiple blueprints.
- `Member`: By default - has read-only permissions. Members can be granted access to view specific pages/dashboards, execute self-service actions, and edit specific entities.  

Read more about roles and permissions [here](https://docs.port.io/sso-rbac/rbac/).

## Configure SSO

Select the relevant [SSO provider](/sso-rbac/sso-providers/) and follow the instructions to set it up.

:::info Enterprise feature
Note that SSO support is an enterprise feature. If you are using the free tier, you can skip this step.
:::

## Next step - build

Once you have completed the planning phase, proceed to the [Build phase](/guides/implementation-guide/build/install-integrations) to start building components in your portal.