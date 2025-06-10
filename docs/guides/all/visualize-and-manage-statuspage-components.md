---
displayed_sidebar: null
description: Learn how to monitor and manage your Statuspage components using dashboards and self-service actions in Port.
---

# Visualize and manage your Statuspage components

This guide demonstrates how to bring your Statuspage components management experience into Port. You will learn how to:

- Ingest Statuspage components data into Port's software catalog using **Port's Statuspage** integration.
- Set up a **self-service action** to manage components.
- Build **dashboards** in Port to monitor and act on components.

<img src="/img/guides/statuspageComponentDash1.png" border="1px" width="100%" />
<img src="/img/guides/statuspageComponentDash2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all Statuspage components from a centralized dashboard.
- Empower platform teams to automate day-2 operations via Webhooks.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Statuspage integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/statuspage/) is installed in your account.


## Set up self-service actions

We will create a self-service action in Port to directly interact with the Statuspage REST API. This action lets users update the status of a component.

The action will be configured via JSON and triggered using **synced webhooks** secured with secrets. To implement this use-case, follow the steps below:


<h3>Add Port secrets</h3>

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
    - `_STATUSPAGE_API_KEY`: Your Statuspage API key. Follow the Statuspage documentation on how to [create the API key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/).


### Update Statuspage component status

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update Statuspage component status action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_status_page_component",
      "title": "Update Statuspage Component Status",
      "icon": "StatusPage",
      "description": "Updates the status of an existing Statuspage component",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "status": {
              "type": "string",
              "title": "Status",
              "enum": [
                "operational",
                "degraded_performance",
                "partial_outage",
                "major_outage",
                "under_maintenance"
              ],
              "enumColors": {
                "operational": "green",
                "degraded_performance": "yellow",
                "partial_outage": "orange",
                "major_outage": "red",
                "under_maintenance": "blue"
              }
            }
          },
          "required": [
            "status"
          ],
          "order": [
            "status"
          ]
        },
        "blueprintIdentifier": "statuspageComponent"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.statuspage.io/v1/pages/{{.entity.relations.statuspage}}/components/{{.entity.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "OAuth {{.secrets._STATUSPAGE_API_KEY}}"
        },
        "body": {
          "component": {
            "status": "{{ .inputs.status }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Update Statuspage Component Status` action in the self-service page. 🎉


## Visualize metrics

With components ingested and action configured, the next step is building a dashboard to monitor Statuspage data directly in Port. We can visualize all components by status using customizable widgets. In addition, we can trigger remediation workflows right from your dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Statuspage Component Manager**.
5. Input `Manage and update Statuspage components across pages` under **Description**.
6. Select the `StatusPage` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our Statuspage components.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total operational components (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total operational components` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Component** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `operational` components:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"operational"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `components` as the **Custom unit**
   <img src="/img/guides/totalOperationalComponent.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Components by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Components by status` (add the `StatusPage` icon).
3. Choose the **Statuspage Component** blueprint.
4. Under `Breakdown by property`, select the **Current Status** property
    <img src="/img/guides/statuspageComponentByStatus.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>All StatusPage components view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Components**.
3. Choose the **Statuspage Component** blueprint
   <img src="/img/guides/allStatuspageComponents.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Current Status**: The current status of the component.
    - **Description**: The description of the component.
    - **Last Updated At**: The date the component was last updated.
    - **Status Page**: The related Statuspage.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>