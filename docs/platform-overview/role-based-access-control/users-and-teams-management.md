---
sidebar_position: 2
---

# Teams and users management

On Port, you can control and manage users and teams in one place. 

This allows admins to manage their users and teams inside Port. Helping them to:

1. **Manage users (via the users’ page).**
2. **Promote ownership of assets within the organization (with team assignments).**
3. **Set granular permissions on the portal (permission management).**

It will also benefit developers, who could:

1. **Know what software assets they own and are responsible for.**
2. **View and perform actions on their assets according to their role and team belonging.**

## 1. Users page

Users management is done from the **Users page.**

Each user is defined by the following properties:

1. Basic information - image, name, and email.
2. Role - shows the user’s permissions level (see the [permission](https://www.notion.so/Users-and-teams-management-c2e15ba3c5374fcd9544e6da1d7f58cd) section).
3. Teams - a “team” is a group of users that owns entities (see the [team](https://www.notion.so/Users-and-teams-management-c2e15ba3c5374fcd9544e6da1d7f58cd) section).

<!-- ![Untitled](Users%20and%20teams%20management%201153be2d2db2443fb3f40f6fabcc6de4/Untitled.png) -->

<aside>
⚠️ Modifying roles and teams via this page will become available soon!

</aside>

## 2. `Team` system property

Each entity has a system property called `team`, so you can set which team owns the entity. As an admin, you can also set blueprint permissions according to this field.

- JSON **entity example with “team” field**
    
    ```json
    {
        "identifier": "",
        "title": "",
        "team": "",
        "blueprint": "TestBlueprint",
        "properties": {
            "prop1": ""
        },
        "relations": {}
    }
    ```
    

<!-- ![Untitled](Users%20and%20teams%20management%201153be2d2db2443fb3f40f6fabcc6de4/Untitled%201.png) -->

| Field | Type | Description | Default |
| --- | --- | --- | --- |
| team | List | A system field that defines the team belonging of an entity (I.e, Okta teams, AzureAD teams, etc.). |  "team": [] |

- We support the manual creation of teams on Port, as well as integrating with identity providers, such as Okta and AzureAD, to import existing teams.
- When users log in to Port their groups will be pulled automatically from their identity provider, and the allowed team values will be updated accordingly.

<aside>
🚧 Notice that Okta and Azure integrations are available only after integrating the relevant identify provider.
For more details see [Further Info](https://www.notion.so/Permissions-a311101df15b4264b9fa85de78a90bc2) under the Permissions section.

</aside>

# 3. Permission management

[Permissions](https://www.notion.so/Permissions-a311101df15b4264b9fa85de78a90bc2)

# Future features

1. Admins will be able to modify roles on the Users page.