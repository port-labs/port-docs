---
sidebar_position: 1
---

# Markdown

With Port, you can import and display [Markdown](https://en.wikipedia.org/wiki/Markdown) files as tabs.

By using the combination of `"type": "string` and `"format": "markdown"` in a [Blueprint property](../../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/properties.md#structure), Port will format and display the markdown text in the [Specific Entity Page](../../build-your-software-catalog/sync-data-to-catalog/understand-entities-structure/understand-entities-structure.md#entity-page).

## Definition in Blueprint

```json showLineNumbers
{
  "title": "Markdown Property",
  "type": "string",
  "format": "markdown",
  "description": "A Markdown property"
}
```

## Example

Here is how the Markdown tab in the Specific Entity Page appears when markdown text is provided:

![Markdown Example](../../../static/img/software-catalog/widgets/markdown.png)

![Markdown Edit Example](../../../static/img/software-catalog/widgets/markdownEdit.png)
