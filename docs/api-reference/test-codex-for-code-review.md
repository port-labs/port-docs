# Test Document For Code Review

## Create A Blueprint In Port

You will now create a blueprint that will be used to represent your services in the software catalog, and this blueprint will contain all the necessary properties and relations that you need to track your services effectively throughout their lifecycle.

The blueprint was created by the user and it contains various properties that are defined by the administrator. The services are tracked by Port and the data is synchronized by the integration.

This is a very long paragraph that contains multiple sentences and should be broken up into smaller chunks according to the style guide. This paragraph has more than five sentences which violates the guidelines. Each sentence here adds to the length. The paragraph continues to grow longer. This is the sixth sentence. And here is yet another sentence that makes this paragraph even longer than it should be.

Here is a sentence without a period at the end

Here is another very long sentence that definitely exceeds the recommended 15-25 word limit and should be flagged by the code review process because it is too verbose and difficult to read in a single breath.

## Working With Entities

You can find more information [here](../getting-started/overview.md) and also [click here](overview.md) for additional details.

Check out the [Learn More](getting-started.md) link for documentation.

### Lists Examples

Here are some items:
- First item without period
- Second item;
- Third item with semicolon instead of period
- Fourth item

Here are some non-parallel items:
- Creating blueprints
- You should update entities
- The integration syncs data

### Code Examples

```yaml
resources:
  - kind: repository
    identifier: my-repo
```

```json
{
  "title": "Example",
  "description": "Test"
}
```

```python
def example():
    return True
```

### Images

<img src='../img/example.png' />

<img src='/img/example.png' width='50%' />

<img src='/img/example.png' width='50%' border='1px' alt='Example image' />

### Tabs

<Tabs groupId="example">
  <TabItem value="tab1" label="Tab 1">
    # Header inside tab
    Content here
  </TabItem>
  <TabItem value="tab2" label="Tab 2">
    More content
  </TabItem>
</Tabs>

### Admonitions

:::
This admonition is missing a title which violates the guidelines.
:::

:::tip
This admonition also lacks a title.
:::

:::info
Content without title
:::

### Terminology Issues

The service catalog contains various services. The software catalog also has entities. The catalog includes blueprints and the catalog items are synchronized.

### Product Names

You can use kubernetes to deploy your services. The lambda function will process the data. Make sure to configure argocd properly.

### Inline Code

You can use `blueprint` or [blueprint](link) or `BLUEPRINT` in your code.

### UI Elements

Click the save button to continue. Use the cancel option if needed.

