# Bitbucket Cloud Integration Documentation

This document provides a detailed guide on how to set up and use the Bitbucket Cloud Integration for Port. The integration allows you to sync Bitbucket Cloud data (projects, repositories, pull requests, and components) with Port's software catalog in real-time using webhooks and polling mechanisms.

---

## Overview

The Bitbucket Cloud Integration enables you to:

- Sync Bitbucket Cloud data (projects, repositories, pull requests, and components) with Port.
- Automatically create and update entities in Port based on Bitbucket events.
- Use webhooks for real-time updates or polling for periodic data synchronization.

---

## Prerequisites

Before you begin, ensure you have the following:

- **Bitbucket Cloud Account**: A Bitbucket Cloud account with administrative access.
- **Bitbucket App Password**: Generate an app password with the required permissions (e.g., `repository:read`, `pullrequest:write`).
- **Port Account**: A Port account with access to the software catalog.
- **Port Client ID and Secret**: Obtain these from your Port installation.
- **Webhook Secret**: A secure secret key for validating incoming webhook payloads.

---

## Installation

### Step 1: Clone the Repository

Clone the Ocean repository:

```bash
git clone https://github.com/port-labs/ocean.git
```

Navigate to the Bitbucket Cloud integration directory:

```bash
cd ocean/integrations/bitbucket-cloud 
```

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env 
```

Update the `.env` file with your credentials and configuration:

```plaintext
OCEAN__PORT__CLIENT_ID="<port-client-id>"
OCEAN__PORT__CLIENT_SECRET="<port-client-secret>"
OCEAN__BASE_URL=https://test.com
OCEAN__INTEGRATION__IDENTIFIER=bitbucket-cloud
OCEAN__PORT__BASE_URL=https://api.getport.io
OCEAN__EVENT_LISTENER__TYPE=POLLING
OCEAN__INITIALIZE_PORT_RESOURCES=true
OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL=https://api.bitbucket.org/2.0
OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET=4542832c1ed418e8
OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME="<username>"
OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD="<app-password>"
```

---

### Step 2: Run the Integration

#### Install Dependencies
Ensure all required dependencies are installed. Run:

```bash
pip install -r requirements.txt
```

#### Start the Integration
Run the integration using the following command:

```bash
ocean sail
```

The integration will:

- Initialize Port resources (blueprints, relations, etc.).
- Listen for Bitbucket events (`repo:push`, `pullrequest:created`, etc.).
- Automatically create or update entities in Port based on the events.

---

### Step 3: Verify the Integration

#### Trigger Bitbucket Events:
- Push changes to a repository.
- Create or update a pull request.

#### Check Port for Updates:
- Log in to your Port installation.
- Verify that entities are created or updated based on the Bitbucket events.

---

## Supported Entities

The integration syncs the following Bitbucket entities with Port:

| Entity Type  | Description |
|-------------|------------|
| **Repository** | Syncs repository details such as name, description, and last push date. |
| **Project** | Syncs project details such as name, key, and description. |
| **Pull Request** | Syncs pull request details such as title, status, and merge status. |
| **Component** | Syncs components associated with repositories or projects. |

---

## Troubleshooting

### Webhook Validation Errors
- Ensure the `WEBHOOK_SECRET` in your `.env` file matches the one used in the Bitbucket webhook configuration.
- Verify that the `X-Hub-Signature` header is included in incoming requests.

### Authentication Errors
- Double-check the `CLIENT_ID`, `CLIENT_SECRET`, `BITBUCKET_USERNAME`, and `BITBUCKET_APP_PASSWORD` values.

### Event Handling Issues
- Ensure the integration is running and listening for events.
- Check the logs for any errors or warnings.

---

## Example Use Case

### Scenario: Track Microservice Builds

#### Bitbucket Event:
A developer pushes code to a repository.

#### Integration Action:
- The `repo:push` event triggers the integration.
- A new microservice entity is created in Port with details like `buildNumber`, `commitHash`, and `repoPushedAt`.

#### Result:
The microservice entity in Port is updated with the latest build information.

---

## Conclusion

This integration simplifies the process of synchronizing Bitbucket Cloud events with your Port installation. By following the steps above, you can automate entity creation and updates, ensuring your system stays in sync with your Bitbucket repositories.

For further assistance, refer to the [Port documentation](https://docs.port.io/) or contact [Port Support](https://www.getport.io/support).

