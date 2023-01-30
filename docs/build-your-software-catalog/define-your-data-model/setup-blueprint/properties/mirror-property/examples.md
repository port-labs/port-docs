# Examples

Let's look at some examples for basic mirror property definitions to better understand how mirror properties work

### Regular mirror property

This is a standard Mirror Property created from a property in the `target` blueprint.

In the following example, we create a Mirror Property called `RepositoryUrl`, which is mapped to the `repo_url` property in the `target` blueprint (in this example the name of the relation is `deployment-to-microservice`)

```json showLineNumbers
"RepositoryUrl": {
    "title": "Repository URL",
    "path": "deployment-to-microservice.repo_url"
}
```
