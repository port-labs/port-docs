import ThemedImage from "@theme/ThemedImage"

# Catalog auto discovery

The **auto discovery** capability uses AI to analyze your existing catalog data and suggests missing entities based on existing relationships and patterns.
This helps you maintain a complete and accurate catalog, especially for entities that are not automatically created through integrations (see common use-cases below).

<h3>Common use cases</h3>

- **Services**: Service blueprint centralizes different components of a service like its repository, incidents for example. For that reason, unlike GitHub repositories or PagerDuty services that sync automatically from integrations, services are typically created manually. Auto discovery helps you identify and create these missing services.
- **Users**: Discover users from related entities. For instance, if you have GitHub repositories synced, we can analyze pull requests and issues entities to suggest users who contributed to them but do not yet exist in your catalog.

## How to use catalog auto discovery

**Run the discovery:**

1. Navigate to the [Catalog](https://app.port.io/organization/catalog) page of your portal.

2. Open the catalog page of the blueprint for which you want to discover new entities.

3. Click on the <ThemedImage sources={{light: "/img/icons/AI-icon.svg", dark: "/img/icons/AI-dark-icon.svg"}} style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top right corner of the page.

4. Select related blueprints to analyze. The entities from these blueprints will be used to identify patterns and suggest new entities for your target blueprint.

5. For the best results, we recommend turning on the `Advanced configuration` toggle and providing the definition of the blueprint you want to discover, along with clear instructions for patterns or specific properties that should be considered.

    For example:

    - **Mono-repo microservices:** Services are represented as code in a repository. Check the file structure of each repository to identify services. Services may be found in specific folders, such as `apps` or `services`.
    - **Service repository identification:** Focus on repos that have keywords that can indicate they are services (e.g., `service`, `ms`, `srv`). Ignore repos of libraries and packages. Having also a PagerDuty service with a similar name as a repo is a strong indication that this is a service.
    - **Identify users:** Check `Jira issues` assignees and `pull requests` to identify developers in the organization.

6. Click on the `Discover` button.

    <img src="/img/software-catalog/pages/catalogDiscoveryForm.png" border='1px' width='50%' style={{borderRadius:'8px'}} />

**Review and edit suggestions:**

Once the process is complete, a list of suggested entities will be displayed, divided into two sections: **Create** and **Update**.  

You can:

- Edit individual entity suggestions.
- Approve or decline suggestions individually or in bulk.
- View the proposed updates to existing entities by clicking the <ThemedImage sources={{light: "/img/icons/Show-icon.svg", dark: "/img/icons/Show-icon-dark.svg"}} style={{"vertical-align": "text-top"}} className="not-zoom" /> button.

<img src="/img/software-catalog/pages/catalogDiscoveryResultsWindow.png" border='1px' width='80%' style={{borderRadius:'8px'}} />

## Limitations

- **Entity evaluation limit**: Discovery evaluates only the 1,000 most recently added entities from each related blueprint.