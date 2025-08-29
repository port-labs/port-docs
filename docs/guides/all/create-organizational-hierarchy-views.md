---
displayed_sidebar: null
description: Learn how to model and visualize hierarchy tiers in your organization.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'


# Create organizational hierarchy views

This guide demonstrates how to:
- Model and visualize the hierarchy tiers in your organization.
- Create dedicated views for each tier, displaying relevant information.

## Example use case

Say you have an organization with the following hierarchy:

<img src="/img/guides/hierarchyTiers/hierarchyTiers.png" border="1px" width="50%" />
<br/><br/>

In this example, a **group** is comprised of one or more **domains**, which are comprised of one or more **tribes**, and so on.

Once we model this hierarchy in Port, we can create a single view for a specific tier, where the manager of that tier can see useful information about the tiers below them, such as the services they are responsible for.


## Prerequisites

This guide assumes you have a Port account with admin access, and have completed the [onboarding process](https://docs.port.io/getting-started/overview).


## Set up data model

First, let's enrich the `Team` blueprint to support different tiers in our hierarchy.

### Add a self-relation

The first thing we need to do is add a relation from the `Team` blueprint to itself.  
This will allow us to assign a parent team to each team entity.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.

2. Search for the `Team` blueprint using the search bar.

3. On the bottom of the blueprint card, click on `+ New relation`.

4. Fill out the form as seen below, then click `Create`:
    <img src="/img/guides/hierarchyTiers/selfRelationForm.png" border="1px" width="50%" />

### Add a "type" property

Next, let's add a `Type` property to the `Team` blueprint to make it easier to see what tiers/types of teams exist.  
This property can also be later used for filtering in views/dashboards.

1. In the `Team` blueprint card, click on `+ New property`, and choose `Enum` as the property type.

2. Fill out the form with the options matching your hierarchy tiers, then click `Create`.  
   You can use the following example:
    <div style={{ display: "flex", gap: "10px" }}>
        <img src="/img/guides/hierarchyTiers/typePropertyForm1.png" border="1px" width="45%" />
        <img src="/img/guides/hierarchyTiers/typePropertyForm2.png" border="1px" width="45%" />
    </div>

### Assign types & parent teams

To finish setting up the data model, we need to assign each team a type and a parent team.

1. In the `Team` blueprint card, click on `` to view all of your teams.

2. For each team, assign a type and a parent team by clicking on the .

:::tip Table filters
To make the process of assigning types and parent teams easier, you can use table filters to hide other columns.
:::

## Create dashboard

Now that our data model is set up, let's create a dedicated dashboard for Tribe leads.

1. Go to the [catalog](https://app.getport.io/catalog) page of your portal.

2. Click on `+ New`, then select `New dashboard`.

3. Name the dashboard "Tribe Lead". Optionally, give it a description and select an icon, then click `Create`.

Next, let's add two useful tables to the dashboard:  

### Table 1: all of the tribe's squads

The first table will display all of the squads under the tribe of the logged-in user.

1. In the top-right corner of the dashboard, click on `+ Widget`, then select `Table`.

2. Fill out the form as seen below:
   <img src="/img/guides/hierarchyTiers/allSquadsTable.png" border="1px" width="50%" />

3. Let's define filters to ensure that only the relevant squads are displayed. Click on the `Filters` button.

4. When defining filters, we can use the UI, or by writing a JSON object.  
   Click on the `Edit JSON`, and paste the following JSON:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "property": "type",
          "operator": "=",
          "value": "Squad"
        },
        {
          "operator": "matchAny",
          "property": {
            "path": [
              "parent"
            ]
          },
          "value": [
            "{{getUserTeams()}}"
          ]
        }
      ]
    }
    ```
    This JSON object defines two filters with an `AND` operator between them:
    - The first filter ensures that only squads are displayed.
    - The second filter ensures that only squads that are children of the logged-in user's teams are displayed.

5. Click `Save` to save the filters, then click `Save` again to save the table.

### Table 2: all services owned by the tribe

1. In the top-right corner of the dashboard, click on `+ Widget`, then select `Table`.

2. Fill out the form as seen below:
   <img src="/img/guides/hierarchyTiers/ownedServicesTable.png" border="1px" width="50%" />

3. Let's define filters to ensure that only the relevant services are displayed. Click on the `Filters` button.

4. Once again, let's use a JSON object to define the filters.  
   Click on the `Edit JSON`, and paste the following JSON:

    ```json showLineNumbers
    {
      "combinator": "or",
      "rules": [
        {
          "property": "$team",
          "operator": "containsAny",
          "value": [
            "{{getUserTeams()}}"
          ]
        },
        {
          "operator": "matchAny",
          "property": {
            "path": [
              "$team",
              "parent"
            ]
          },
          "value": [
            "{{getUserTeams()}}"
          ]
        }
      ]
    }
    ```
    This JSON object defines two filters with an `OR` operator between them:
    - The first filter ensures that all services owned by the logged-in user's teams are displayed.
    - The second filter ensures that all services owned by children of the logged-in user's teams are displayed.

5. Click `Save` to save the filters, then click `Save` again to save the table.

:::tip "match any" operator
To achieve the desired filtering, the tables use the `matchAny` operator.  

This operator allows you to search for entities that are related through a specific path of relations.  
Read more about this operator [here](/search-and-query/?relation=matchAny#relation-operators).

:::


