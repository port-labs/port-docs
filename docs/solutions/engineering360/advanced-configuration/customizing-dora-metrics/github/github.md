# GitHub integration for DORA metrics

Port provides a flexible, self-service way to track DORA metrics from your GitHub repositories—no manual configuration needed. You can choose from several out-of-the-box actions that let you define what counts as a “deployment” for your organization, all directly in the portal UI.

### Prerequisites
- An installed GitHub integration.
- An installed DORA Metrics experience
- Admin permissions in Port to modify integrations and mappings.


### Choosing Your Deployment Method
The definition of a “deployment” can vary between engineering organizations. With Port’s GitHub integration, you can select the mapping that best matches your workflow using self-service actions. These actions allow you to start ingesting deployment data with just a few clicks.

**Available deployment triggers include:**
- **Merged Pull Requests:** Treat every merged PR as a deployment event.
- **GitHub Workflow Runs**: Use successful GitHub Actions workflow runs as deployments (ideal for CI/CD pipelines).
- **GitHub Releases**: Track deployments based on tagged version releases.
- **GitHub Deployments**: Track deployments triggered via GitHub’s Deployment API.

You can create multiple deployment methods by using the same self-service actions repeatedly.


### How to Configure
1. **Go to the “1. Set up your deployments” configuration page in your Port portal**.

2. **Locate the “Configure your deployment method” section**.

3. **Choose the self-service action** that matches your deployment definition (e.g., “Create a deployment for every GitHub pull request”).

4. **Apply the desired filters**—for example, you might want to track only deployments in a certain environment, branch, or with specific labels. Adjust the filters in the action modal to match your team’s workflow, then save your changes.

Once configured, Port will automatically ingest deployment events from GitHub and update your DORA dashboards—without any additional setup.

### Customization and Advanced Mapping
If your workflow is more complex than that, you can further refine what counts as a deployment by tweaking the integration mapping or by combining multiple mapping blocks.

For full control, you can go directly to the mapping of your GitHub integration and manually adjust it. This allows you to add or modify relations to services and teams, ensuring each deployment is linked to the right context, or create more complex filters. With this setup, you can filter and break down your DORA metrics by team or service—making it easier to pinpoint issues, compare performance, and generate more relevant insights for your organization.

### Next Steps
You can continue refining your integration as your workflows change, or check out guides for other tools to build a comprehensive view of your delivery process.

With your GitHub integration set up, you now have clear visibility into your software delivery metrics, enabling data-driven improvements across your teams.
