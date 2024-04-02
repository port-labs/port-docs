---
sidebar_position: 2
sidebar_label: Configure mapping
---

# Configure mapping

The mapping of an integration's data source defines the ingested data and its destination. It allows you to specify:

- **Which data** you wish to ingest from the integrated tool.
- **Which properties** in the integration's blueprints will be filled with the ingested data.

## How does mapping work?

Integration mapping is configured in the [data sources page](https://app.getport.io/dev-portal/data-sources) of your portal, under `Exporters`.  
Each integration has its own mapping, written in `YAML`.

To understand how mapping works, let's take a look at an example. After you complete the [onboarding](/quickstart) and connect your Git provider to Port, you will see an exporter entry in your [data sources page](https://app.getport.io/dev-portal/data-sources):

<img src='/img/software-catalog/customize-integrations/mappingExampleEntry.png' width='55%' />

<br/><br/>

Clicking on this entry will open the mapping configuration.  
Note that Port provides default mapping, providing values to the properties defined in the relevant blueprint:

<img src='/img/software-catalog/customize-integrations/mappingExampleGithub.png' width='80%' />

<br/><br/>

### Configuration structure

This section will explain each part of the configuration YAML.  
Some of the keys use [JQ queries](https://jqlang.github.io/jq/manual/) to filter the data ingested from the tool's API.

- The `resources` key is the root of the YAML configuration:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: repository
      ...
  ```

<br/>

- The `kind` key is a specifier for the object you wish to map from the tool's API (in this example, a Github repository).  
  To see which `kinds` are available for mapping, refer to the integration's documentation. In this example, the available kinds are listed in the [Github integration page](/build-your-software-catalog/sync-data-to-catalog/git/github/#port-app-configyml-structure).

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: repository
        selector:
        ...
  ```

<br/>

- The `selector` and the `query` keys let you filter exactly which objects of the specified `kind` will be ingested into Port:

  ```yaml showLineNumbers
  resources:
    - kind: repository
      # highlight-start
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
      port:
  ```

  Using a JQ query, you can define your desired conditions. For example, to ingest only repositories that have a name starting with `"service"`, use the `query` key like this:

  ```yaml
  query: .name | startswith("service")
  ```

<br/>

- The `port.entity.mappings` key contains the section used to map the object fields to Port entities.  
  Here you can specify the `blueprint` in Port to which the data should be mapped, and which API object will be ingested to each of its properties.

  ```yaml showLineNumbers
  resources:
    - kind: repository
      selector:
        query: "true"
      # highlight-start
      port:
        entity:
          mappings: # Mappings between one GitHub API object to a Port entity. Each value is a JQ query.
            identifier: ".name"
            title: ".name"
            blueprint: '"service"'
            properties:
              description: ".description"
              url: ".html_url"
              defaultBranch: ".default_branch"
      # highlight-end
  ```

  To create multiple mappings of the same kind, you can add another item to the `resources` array:

  ```yaml showLineNumbers
  resources:
    # highlight-next-line
    - kind: repository
      selector:
        query: "true"
      port:
        entity:
          mappings: # Mappings between one GitHub API object to a Port entity. Each value is a JQ query.
            identifier: ".name"
            title: ".name"
            blueprint: '"service"'
            properties:
              description: ".description"
              url: ".html_url"
              defaultBranch: ".default_branch"
    # highlight-next-line
    - kind: repository # In this instance repository is mapped again with a different filter
      selector:
        query: '.name == "MyRepositoryName"'
      port:
        entity:
          mappings: ...
  ```

## Mapping relations

You can use the mapping YAML file to set the value of a relation between entities. This is very useful when you want to automatically assign an entity to the relation of another entity using a convention of your choice.

For example, say we have a `service` blueprint and a `PagerDuty Service` blueprint with a relation between them:

<img src='/img/software-catalog/customize-integrations/relationExample.png' width='70%' border='1px' />

<br/><br/>

After ingesting all of our services and PagerDuty services, we want to connect each `service` to its corresponding `PagerDuty service`. To achieve this, we have two options:

1. **Option 1** - manually assign a PagerDuty service to each service using the UI:

   - Go to the [Services page](https://app.getport.io/services) of your software catalog.
   - Choose a service you want to assign a PagerDuty service to. Hover over it, click on the `...` button on the right, and select `Edit`.
   - In the `PagerDuty service` field, select the relevant PagerDuty service from the dropdown list, then click `Update`:

     <img src='/img/software-catalog/customize-integrations/relationManualAssign.png' width='40%' border='1px' />

1. **Option 2** - use the integration's mapping YAML. In our example, we can add an entry to the mapping of the PagerDuty integration:

   - Go to your [data sources page](https://app.getport.io/dev-portal/data-sources) and click on the PagerDuty exporter:

      <img src='/img/software-catalog/customize-integrations/dataSourcesPdIntegration.png' width='100%' border='1px' />

   - Add the following entry to the mapping YAML:

     ```yaml showLineNumbers
     - kind: services
       selector:
         query: "true"
       port:
         entity:
           mappings:
             identifier: .name
             blueprint: '"service"'
             properties: {}
             relations:
               pagerduty_service: .id
     ```

     Now, if a `service's` **identifier** is equal to a `PagerDuty service's` **name**, that service will automatically have its on-call property filled with the relevant PagerDuty service.  
      This is just the convention we chose for this example, but you can use a different one if you'd like.

## Create multiple entities from an array API object

In some cases, an application's API returns an array of objects that you want to map to multiple entities in Port.  
To achieve this, Port provides you with the `itemsToParse` key, its value should be a JQ query that returns an array.  
In order to reference an array item attribute, use `.item` in your JQ expression.  

Here is an example mapping configuration of a Jira `issue`, where we want to map each of the issue's `comments` to a separate `comment` entity:

```yaml showLineNumbers
- kind: issue
  selector:
    query: .item.name != 'test-item' and .issueType == 'Bug' 
  port:
    # highlight-next-line
    itemsToParse: .fields.comments
    entity:
      mappings:
        # highlight-next-line
        identifier: .item.id
        blueprint: '"comment"'
        properties:
          # highlight-next-line
          text: .item.text
        relations:
            issue: .key
```

The object returned from Jira for which we would apply this mapping might look like this (note the `comments` array):

<details>
<summary><b>Example Jira API response (click to expand)</b></summary>
```json
{
  "url": "https://example.com/issue/1",
  "status": "Open",
  "issueType": "Bug",
  "comments": [
    {
      "id": "123",
      "text": "This issue is not reproducing"
    },
    {
      "id": "456",
      "text": "Great issue!"
    }
  ],
  "assignee": "user1",
  "reporter": "user2",
  "creator": "user3",
  "priority": "High",
  "created": "2024-03-18T10:00:00Z",
  "updated": "2024-03-18T12:30:00Z",
  "key": "ISSUE-1"
}
```
</details>

## Common use-cases

### Splitting a `kind` block
Sometimes the `CreateRelatedMissingEntities` flag is passed as `false` to prevent generation of additional entities for relations. This can lead to cases where entity ingestion will not happen because the target entity for a relation does not exist in your catalog.  
To handle such cases, you can split a single `kind` to multiple mappings like this:


```yaml showLineNumbers
createMissingRelatedEntities: false
  - kind: services
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          blueprint: '"service"'
          properties: 
            #Properties mapping
  - kind: services
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          blueprint: '"service"'
          properties: {}
          relations:
            pagerduty_service: .id
```

Looking at this mapping configuration we see the following:
* The first `kind` block is used to create the entity along with all of its properties.
* The second `kind` block is used to update the same entity (notice the mapping for the identifier is the same in both configurations) with relations. If the target entity of the relation does not exist (i.e. you have no matching PagerDuty service), the update itself will fail, but the data ingestion will still complete successfully.

This case can also be expanded for handling multiple relation, for each relation that might not be established, you can split it into another kind mapping.