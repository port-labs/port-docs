# Build

*This section will explain how to implement the roadmap and create the different components that make up a developer portal.*

### 1. Configure Port Account

- Invite relevant initial users to Port
- Configure SSO

### 2. Install and Enrich Pre-built Integrations

- Install the relevant ready-made integrations for tools in your tech stack.
- Configure the integrations' mapping to ensure all relevant data is ingested.
- Create scorecards for the relevant blueprints to set and track standards.
- Create dashboards for the relevant blueprints to visualize and track data.

### 3. Install and Enrich Custom Integrations

- Set up integrations for additional tools using Port's API.
- Create custom blueprints and relations for these integrations.
- Configure the integrations' mapping to ensure all relevant data is ingested.
- Create scorecards for the relevant blueprints to set and track standards.
- Create dashboards for the relevant blueprints to visualize and track data.

### 4. Create logical connections between blueprints

- Define the relationships between the blueprints in your portal according to your needs, using relations.

### 5. Define ownership and permissions

- Assign users to roles based on their responsibilities.
- Set your defined roles and permissions on the blueprints in your portal.

### 6. Apply scorecards

- Set up scorecards for the blueprints in your portal to track metrics.

### 7. Create dashboards

- Create dashboards for different personas in your organization to visualize and track data. Some examples include:
  - A dashboard for developers to track the health of their services.
  - A dashboard for R&D managers to track the performance of APIs and services.
  - A dashboard for security teams to track access control and security policies.
- Dashboards can be created/modified in 3 locations:
  - Homepage
  - Catalog - dashboard page
  - Specific entity page
- Use dynamic filters to display data relevant to the logged-in user, or to filter data based on specific criteria.

### 8. Set up Self-service Actions

- (Optional) Install Port execution agent
- Create self-service actions for common tasks that users can perform on their own.  
  For example:
  - Scaffolding a new service.
  - Requesting a cloud resource.
  - Reporting an incident.

### 9. Set up automations

- Automations can be used to trigger actions based on events in your portal.  
  Some initial automations can be helpful for monitoring and managing the entities you created when installing integrations. For example:
  - Send notifications to relevant users when a new service is created/updated.
  - Trigger an incident when a service degrades.
