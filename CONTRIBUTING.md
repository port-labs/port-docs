# Contributing to Port's documentation

Here you can find resources and guidelines on how to contribute to Port's documentation and how to correctly write and fix documentation content.

## How to contribute

The best way to suggest edits for an existing page is by using the "Edit this page" button at the bottom of most docs, this button will take you to the GitHub interface to make and propose changes.

If you want to add a new documentation page, please fork the repository and after adding the new docs, create a PR which will be reviewed by our team.

Contributions are very welcome. If you need help planning your contribution, feel free to ask us by opening an issue in this repository or by writing in our [community Slack](https://join.slack.com/t/getport/shared_invite/zt-1v5z1z1v-3~1Q1Q1).

## Styling guidelines

### Capital letters

1. **Headers** - generally, all headers should have a capital letter only for the first word. The rest of the sentence will be in lowercase letters. For example: "Promote scorecards".
2. **Links** - unless the link is at a start of a new sentence, it should not be capitalized.
3. **General product names** - well known products such as Lambda, Kubernetes, ArgoCD, etc. should follow their standard capitalization rules and styling.

### Tone & style

**General docs**

- Avoid using gender-specific language.
- When addressing the reader, use second-person pronouns (you, your). For example "You can achieve this by…".
- Don’t use commanding language such as "You will now create a blueprint…" or "In this guide you will create...".
Instead use "We will now create a blueprint…" or "Let’s create…"
- Use emojis 🥸 when you see fit. It can lighten a complex topic, and generally convey a friendly experience. Be careful not to overuse.
- Be search-oriented, ensure the proper keywords that users will likely search for in the page are present.

**Guides & examples**

When writing guides and guide-like content:
- Use "We" language to convey to the readers that we are guiding them along and not just telling them what to do.
- Include screenshots and/or GIFs to improve clarity.

### Tabs

- General rule - add `queryString` to <Tabs> component to ensure each tab can be accessed directly from their URL. Example:
`<Tabs groupId="example" queryString>`
- General rule - don’t use `#` headers inside tabs since they are rendered in the table of contents on the right side of the page, but can’t be accessed unless the tab they’re in is selected.
If you want to use headers inside tabs, use `<h>` , for example `<h2>Header text</h2>`.

### Links

- All links must use full paths and not relative ones, to ensure safer code.
- Decide if you want your link to open in the same tab or a new one. To make an internal link* open in a new tab, add [`https://docs.port.io`](https://docs.port.io) to the beginning of the link.
*Internal link - a link that leads to another page **within** the docs site.

### Lists

- Use `-` for bullets.
- End each item with a `.` rather than a `;`.
- Do not add an `etc.` item.

### Images & GIFs

- Images should have a simple black border, otherwise they can blend in with the background, making for unclear docs. See **full example** below.
- Images should be saved under `/static/img/` in the relevant directory. Create a new directory if the relevant one does not exist.
- Like links, images should always be specified using **full path links** and not relative ones.
- Images should have a proper `width` defined, so they are scaled properly. See **full example** below.
- **Full example:**
`<img src='/img/software-catalog/pages/excludePropertiesForm.png' width='50%' border='1px' />`
- Consider using GIFs when you think they will better convey what you’re trying to demonstrate.

### Hierarchy changes

- If you move/delete/change the path of a file, check to see if its URL is used in other places such as:
    - The main Port monorepo.
    - Port’s marketing site.
    - Port’s Github action.
    - Any other place that may be relevant to the page you’re changing.
- Consider adding a redirect in our Amplify (hosting service), this is especially useful when moving/changing entire directories. Talk to @Hadar to achieve this.

### Admonitions

- Use the type that best fits the nature of your text. The available types can be found [here](https://docusaurus.io/docs/markdown-features/admonitions).
- Always include a title, this makes the admonition’s purpose clearer and increases the chance that readers will not skip it if it’s relevant to them.
- Full example:
:::tip Supported versions
Content goes here
:::

### Tips

- Docusaurus doesn’t allow broken internal links, so run `npm run build` before pushing to ensure all links are valid.

### Summary/details

- General rule - use **bold** and (click to expand). For example:
<details>
<summary><b>Repository blueprint (Click to expand)</b></summary>

Content goes here

</summary>

### Formatting Standards

- Spacing! <br /> is your friend, use it sparingly to make pages easier on the eyes.
- Add `showLineNumbers`  to all code snippets, except one-liners, for example:
```yaml showLineNumbers
resources:
  - kind: repository
```