# Managing Ownership in Port

Ownership in Port defines who is responsible for specific entities in your internal developer portal — such as services, repositories, or incidents.  

Managing ownership correctly ensures clear accountability, smoother collaboration, and accurate reporting.  
Ownership in Port is represented through relationships between **users**, **teams**, and **catalog entities**. 

This guide explains how to manage ownership in Port, from syncing users and teams to assigning them to catalog entities, and visualizing the data.

## Overview

Defining ownership in Port is composed of several steps:

- [Sync Users](#sync-users) - the first step in managing ownership is syncing your users from 3rd party tools into Port, and connecting to the relevant Port user. This allows you to have a single component in your portal that represents your user across your entire ecosystem.

- [Sync Teams](#sync-teams) - just like users, teams from 3rd party tools can be synced into Port, and connected to the relevant Port teams. 

- [Assign Users to Teams](#assign-users-to-teams) - once Port users and teams are synced and connected to each other, users can get visibility into the resources owned by their team/s.

- [Assign Teams to Catalog Entities](#assign-teams-to-catalog-entities) - define ownership of resources in your catalog to Port teams.  
  For example, a GitHub repository can be owned by the `frontend` team.

- [Assign Users to Catalog Entities](#assign-users-to-catalog-entities) - define ownership of resources in your catalog to Port users.  
  For example, a PagerDuty incident can be owned by the current `on-call` user.

## Sync Users

Users can be synced into Port either manually or automatically, depending on your integrations.

### Manually

- **Self-Service Action (SSA) – [Register your user](https://app.getport.io/self-serve?action=_onboard_your_user)**  
  An out-of-the-box self service action used to register the logged-in user in Port, connecting it to the relevant 3rd party user/s.

- **Register a new user**  
  This can be done from the [Users catalog page](https://app.getport.io/_users):  
  Click on the `+ User` button, then click on `Register existing user`.
  
  This is useful for inviting a new user and defining their relations to 3rd party users in a single step.

- **Edit an existing user entity**  
  This can also be done from the [Users catalog page](https://app.getport.io/_users):  
  Click on the `...` button, then click on `Edit`.

  Ideal when updating a user with new data — for example, connecting it to a Slack user.

#### Custom integrations

Tools for which Port does not have a built-in integration can be synced manually using the following guides:

- Slack:
- ServiceNow:
- HiBob:




  

### Automatically
- **Built-in integrations**: Update the integration mapping to connect the Port user to the integration user.  **ADD TABS WITH MAPPINGS FOR EACH INTEGRATION**
- **Custom integrations**: When a new Port user is created, an automation links them to the matching integration user. **ADD LINKS TO THE RELEVANT ANCHOR IN EACH GUIDE**

---

## Sync Teams

Teams can also be synced into Port either manually or automatically, depending on your integrations and conventions.

### Manually

- **Register a new team**  
  This can be done from the [Teams catalog page](https://app.getport.io/_teams):  
  Click on the `+ Team` button.
  
  This is useful for creating a new team and defining its relations to 3rd party teams in a single step. 

- **Edit an existing team entity**  
  This can also be done from the [Teams catalog page](https://app.getport.io/_teams):  
  Click on the `...` button, then click on `Edit`.

  Ideal when updating a team with new data — for example, connecting it to a Sentry team.

### Automatically
- **Built-in integrations**:  
  
  Using the integration mapping, we can define how to create/update teams in Port.
  
  For example, the following mapping can be used to create/update teams in Port using GitHub:
    ```yaml
    - kind: team
    selector:
        query: 'true'
    port:
        entity:
        mappings:
            identifier: .id | tostring
            title: .name
            blueprint: '"_team"'
            relations:
                git_hub_team: .id | tostring
    ```

  In this example, if the team already exists in Port, it will be connected to the GitHub team with the same identifier.  
  If it does not exist, it will be created and connected to the GitHub team with the same identifier.
  
  
 
<!-- - **Custom integrations**:
-  Automatic mapping is usually not reliable because team names and identifiers may not match. In most cases, automation will require consistent identifiers across systems, which is uncommon.
  - For example, if a team in GitHub is called `frontend`, but in Sentry it is called `Frontend`, we need to create a mapping between the two. -->

---

## Assign Users to Teams

In many cases, ownership is assigned to a team and not a specific user. By default, Port allows you to assign one or more owning teams to each entity in your catalog.

As a user, it's important to see all of the resources owned by you or your team/s. Therefore, the next step is to ensure that all Port users are assigned to the relevant team/s.



### Manually
- **Self-Service Action (SSA) – [Add team members](https://app.getport.io/self-serve?action=_onboard_existing_team)**  
  An out-of-the-box self service action used to add users to an existing team.
- **Edit a user entity**  
  This can be done from the [Users catalog page](https://app.getport.io/_users):  
  Click on the `...` button, then click on `Edit`.
  - When creating a new user, assign their team(s).

### Automatically
- **Using SSO**: Users and teams are created and connected automatically.  
- **Using Entra ID**: Use the Entra ID integration tool.  
- **GitLab / ADO**: Use auto-discovery to map:


---

## Assign Teams to Catalog Entities

### Manually
- **SSA – Own services**  
- Edit an entity to update its owning team(s).  
- When creating a new entity, assign its owning team(s).

### Automatically
- **GitHub example**:  
- Use the `team-mapper` script.  
- If an entity has an integration-team property (e.g., GitHub repository → `github-teams`), update the mapping so that if `github-teams` has a value, it is also set in `owning teams`.  
- This assumes Port team IDs match GitHub team IDs.

---

## Assign Users to Catalog Entities

### Manually
- Edit an entity to set its relevant user(s).  
- Assign relevant user(s) during entity creation.

### Automatically
- Example mappings:  
- GitHub Pull Request → creator, reviewer  
- Jira Issue → creator, assignee  
- PagerDuty Incident → on-call user  
- These mappings are included in Port’s new onboarding process.

---

## Visualize User & Team Data

- **User entity pages**: View all related integration users and the Port teams they belong to.  
- **Team entity pages**: View all related integration teams and their members.  
- **Catalog pages & dashboards**: Use the *My Teams* or *My* filters to show only relevant data.  
- **User management dashboard**:  
- View which users are assigned to one or more teams.  
- Include an SSA to onboard users to teams.



