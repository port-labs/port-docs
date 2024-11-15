---
displayed_sidebar: null
description: Learn how to track SLOs and SLIs for your services using Port
---

# Set up announcements in your portal

This guide will walk you through setting up an announcements mechanism in your portal.  

Once implemented:
  - Users will be able to send announcements to all members in the portal, using a self-service action.
  - Users will be able to view announcements on the portal's homepage, and mark them as read.

## Common use cases

- Communicate important information to your team, such as new features, updates, or maintenance schedules.
- Notify users about upcoming events, such as webinars or training sessions.
- Announce new resources, such as blog posts, documentation, or tutorials.

## Prerequisites

This guide assumes you have a Port account with permissions to create blueprints and self-service actions.


## Set up data model

To represent announcements in your portal, let's create a blueprint with the following properties:

- **Message**: The content of the announcement.
- **Users who read it**: A list of users who have read the announcement.

### Create the announcement blueprint

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `Edit JSON` button in the top right corner.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Announcement blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "announcement",
      "title": "Announcement",
      "icon": "Microservice",
      "schema": {
        "properties": {
          "message": {
            "type": "string",
            "title": "Message",
            "default": "\ntitle: \"Announcement Title Here\"\ndate: \"Date Here\"\n---\n\n# Important Update\n\nHello everyone,\n\nWe're excited to share that **[topic or key update]** will be happening on **[specific date]**. Here’s what you need to know:\n\n- **Detail 1:** Brief explanation or impact of the update.\n- **Detail 2:** Any necessary steps or actions users need to take.\n- **Detail 3:** Additional resources or contact info for further questions.\n\nPlease ensure you read and understand the changes. If you have any questions, feel free to reach out or comment below.\n\nThank you,\n**[Your Team or Name]**\n",
            "format": "markdown"
          },
          "read_users": {
            "icon": "DefaultProperty",
            "type": "array",
            "title": "Users who read it",
            "default": [],
            "items": {
              "type": "string",
              "format": "user"
            }
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

   </details>

5. Click "Save" to create the blueprint.

## Create self-service actions

Next, let's create self-service actions to allow users to send announcements and mark them as read.

### "Announce message" action

This action will allow users to send announcements to all members in the portal.

1. Go to the [self-service actions](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Click on the `Edit JSON` button in the top right corner.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Announce message action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "announce_message",
      "title": "Announce message",
      "description": "Announce a message to users of your portal",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "message": {
              "type": "string",
              "title": "Message",
              "default": "---\ntitle: \"Announcement Title Here\"\ndate: \"Date Here\"\n---\n\n# Important Update\n\nHello everyone,\n\nWe're excited to share that **[topic or key update]** will be happening on **[specific date]**. Here’s what you need to know:\n\n- **Detail 1:** Brief explanation or impact of the update.\n- **Detail 2:** Any necessary steps or actions users need to take.\n- **Detail 3:** Additional resources or contact info for further questions.\n\nPlease ensure you read and understand the changes. If you have any questions, feel free to reach out or comment below.\n\nThank you,\n**[Your Team or Name]**\n",
              "format": "markdown"
            },
            "title_of_message": {
              "type": "string",
              "title": "Title of message",
              "description": "This will be the title Users will see before reading the message itself"
            }
          },
          "required": []
        },
        "blueprintIdentifier": "announcement"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "announcement",
        "mapping": {
          "title": "{{.inputs.title_of_message}}",
          "icon": "DefaultBlueprint",
          "properties": {
            "message": "{{.inputs.message}}",
            "read_users": []
          }
        }
      },
      "requiredApproval": false
    }
    ```
   </details>

    **Note** the `message` input field in the action form is pre-filled with a default value for the announcement content. You can customize this template as needed.
  
  5. Click "Save" to create the action.

  :::tip Action permissions
  You may want to restrict this action to specific users or teams. To do this:
  - Edit the action by hovering over it and clicking on the `...` button, then selecting `Edit`. 
  - In the `Permissions` tab, select the users or teams who can execute the action.
  :::

### "Mark announcement as read" action

This action will be used by users to mark an announcement as read after they have viewed it.

1. Go to the [self-service actions](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Click on the `Edit JSON` button in the top right corner.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Mark announcement as read action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "read_announcement",
      "title": "Mark as read",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "announcement"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "announcement",
        "mapping": {
          "identifier": "{{.entity.identifier}}",
          "properties": {
            "read_users": "{{.entity.properties.read_users + [.trigger.by.user.email]}}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
   </details>

5. Click "Save" to create the action.

## Add announcements to the portal homepage

A convenient way to display announcements is in the portal's homepage, which serves as a dashboard. You can do this by creating a table widget that lists all announcements.

1. Go to the [homepage](https://app.getport.io/organization/home) of your portal.
2. Click on `+ Widget`, then select `Table`.
3. Fill in the widget details like this:
   
   <img src="/img/guides/announcementsTableForm.png" width="50%" border='1px' />

4. Under `Additional filters`, click on the pencil icon, then copy and paste the following filter definition:
   
    ```json
    {
      "combinator": "and",
      "rules": [
        {
          "operator": "doesNotContains",
          "property": "read_users",
          "value": "{{getUserEmail()}}"
        },
        {
          "operator": "=",
          "value": "announcement",
          "property": "$blueprint"
        }
      ]
    }
    ```
    This filter ensures that only announcements that the user has not read are displayed in the table.

5. Finally, click `Save` to create the widget.

:::tip Customize table view
Once you have created the table widget, you can customize it by hovering over it and clicking on the `...` button, then selecting `Customize table`.  

In our example, we recommend clicking on the `Manage Properties` button and hiding all columns except for the `title` column.  
This makes the table more readable by displaying only the announcement titles.
:::

### Execute the actions

All done! Now that you have set up your announcements mechanism, you can test it by executing the actions you created.

1. Go to the [self-service actions](https://app.getport.io/self-serve) page of your portal.
2. Execute the `Announce message` action, and give it a title and message.
3. Go back to the homepage, you should see the new announcement displayed in the table widget. Click on the title to view the content.
4. To mark the announcement as read, click on the ⚡ icon in the announcement's table row, then select `Mark as read`:
    
    <img src="/img/guides/announcementsTableMarkAsRead.png" width="100%" border='1px' />

## Possible enhancements

This guide provides a basic setup for announcements in your portal.  
You can further enhance the announcements mechanism by customizing the actions and widgets, for example:
- **Customize the announcement template**: You can customize the default message template in the `Announce message` action to include your own message format.
- **Add more properties to the announcement blueprint**: You can add more properties to the announcement blueprint to include additional information, such as the author of the announcement or a link to more details.
- **Send announcements to specific users**: You can modify the `Announce message` action to allow users to select specific users or teams to send the announcement to.
- **Send announcements to additional channels**: You can modify the `Announce message` action to send announcements via email, Slack, or other channels in addition to the portal homepage.