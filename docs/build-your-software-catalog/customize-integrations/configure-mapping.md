---
sidebar_position: 2
sidebar_label: Configure mapping
---

# Configure mapping

The mapping of an integration's data source defines the ingested data and its destination. It allows you to specify:

- **Which data** you wish to ingest from the integrated tool.
- **Which properties** in the integration's blueprints will be filled with the ingested data.

## How does mapping work?

Integration mapping is configured in the [data sources page](https://app.getport.io/settings/data-sources) of your portal, under `Exporters`.  
Each integration has its own mapping, written in `YAML`.

To understand how mapping works, let's take a look at an example. After you complete the [onboarding](/quickstart) and connect your Git provider to Port, you will see an exporter entry in your [data sources page](https://app.getport.io/settings/data-sources):

<img src='/img/software-catalog/customize-integrations/mappingExampleEntry.png' width='55%' />

<br/><br/>

Clicking on this entry will open the mapping configuration. In the bottom left panel, you will see the YAML configuration of the mapping.  
Note that Port provides default mapping, providing values to the properties defined in the relevant blueprint:

<img src='/img/software-catalog/customize-integrations/mappingExampleGithub.png' width='80%' border='1px' />

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

### Test your mapping - JQ playground

The mapping configuration window contains a JQ playground that allows you to test your JQ queries against example responses from the API of the integrated tool. This is useful for validating your queries and ensuring they return the expected results.

For integrations based on the [Ocean framework](https://ocean.getport.io/integrations-library/), examples will be automatically generated for each resource `kind` in your mapping, based on real data ingested from the tool. You can disable this behavior by setting the `sendRawDataExamples` flag to `false` in the integration's configuration.

To test your mapping against the example data, click on the `Test mapping` button in the bottom-right panel.

#### Manually add test examples

For each resource `kind` in your mapping (in the bottom-left panel), you can add an example in the `Test examples` section.  
Click on the `Add kind` button to add an example:

<img src='/img/software-catalog/customize-integrations/addTestExample.png' width='100%' border='1px' />

After adding your example, click on the `Test mapping` button in the bottom-right panel to test your mapping against the example data.

## Mapping relations

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/ovV4bLtX78g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

You can use the mapping YAML file to set the value of a relation between entities. This is very useful when you want to automatically assign an entity to the relation of another entity using a convention of your choice.

For example, say we have a `service` blueprint and a `PagerDuty Service` blueprint with a relation between them:

<img src='/img/software-catalog/customize-integrations/relationExample.png' width='70%' border='1px' />

<br/><br/>

After ingesting all of our services and PagerDuty services, we want to connect each `service` to its corresponding `PagerDuty service`. To achieve this, we have two options:

1. **Option 1** - use the integration's mapping YAML. In our example, we can add an entry to the mapping of the PagerDuty integration:

   - Go to your [data sources page](https://app.getport.io/settings/data-sources) and click on the PagerDuty exporter:

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

2. **Option 2** - manually assign a PagerDuty service to each service using the UI:

   - Go to the [Services page](https://app.getport.io/services) of your software catalog.
   - Choose a service you want to assign a PagerDuty service to. Hover over it, click on the `...` button on the right, and select `Edit`.
   - In the `PagerDuty service` field, select the relevant PagerDuty service from the dropdown list, then click `Update`:

     <img src='/img/software-catalog/customize-integrations/relationManualAssign.png' width='40%' border='1px' />

### Mapping relations using search queries

In the example above we map a relation using a direct reference to the related entity's `identifier`.  

Port also allows you to use a [search query rule](/search-and-query/#rules) to map relations based on a **property** of the related entity.  
This is useful in cases where you don't have the identifier of the related entity, but you do have one of its properties.

For example, consider the following scenario:  
Say we have a `service` blueprint that has a relation (named `service_owner`) to a `user` blueprint. The `user` blueprint has a property named `github_username`.  

Now, we want to map the `service_owner` relation based on the `github_username` property of the `user` entity.  
To achieve this, we can use the following mapping configuration:

```yaml showLineNumbers
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"service"'
        relations:
          #highlight-start
          service_owner:
            combinator: '"and"'
            rules:
              - property: '"github_username"'
                operator: '"="'
                value: .owner.login
          #highlight-end
```
Instead of directly referencing the `user` entity's `identifier`, we use a search query rule to find the `user` entity whose `github_username` property matches the `.owner.login` value returned from GitHub's API.

When using a search query rule to map a relation, Port will query all entities of the related blueprint (in this case - `user`) and return the one/s that match the rule.

#### Limitations

- One or more entities can be returned by the search query rule. Note the relation's type when using this method:
  - A ["single type" relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/#bust_in_silhouette-single) expects a single entity to be returned.
  - A ["many type" relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/#-many) expects an array of entities to be returned.
- The maximum number of entities returned by the search query rule is 100.
- Mirror and calculation properties are currently not supported.
- Only the `=` operator is supported for the search query rule.

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