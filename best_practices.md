# Port documentation style guide

This document details guidelines for contributing to Port's documentation, and demonstrates how to correctly write and review documentation content.

<b>Pattern 1: Always standardize collapsible details with bold titles and "(click to expand)" for consistency and usability across docs.</b>

Example code before:

```
<details>
<summary>Repository blueprint</summary>

Content goes here

</details>
```

Example code after:

```
<details>
<summary><b>Repository blueprint (click to expand)</b></summary>

Content goes here

</details>
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2834#discussion_r2413145776 -->

</details>

___

<b>Pattern 2: Enforce consistent typography and punctuation in headings and lists, using sentence case for headers and periods at the end of bullet items.</b>

Example code before:

```
## Sync Approaches

- Track security vulnerabilities and findings from ArmorCode in Port
- Monitor application deployments
```

Example code after:

```
## Sync approaches

- Track security vulnerabilities and findings from ArmorCode in Port.
- Monitor application deployments.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2710#discussion_r2314035337 -->

</details>

___

<b>Pattern 3: Use consistent installation method labels ("Self-hosted" and "CI") and avoid outdated phrasing like "Real-time (self-hosted)" or "Scheduled (CI)".</b>

Example code before:

```
<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">
<TabItem value="one-time-ci" label="Scheduled (CI)">
```

Example code after:

```
<TabItem value="real-time-self-hosted" label="Self-hosted">
<TabItem value="one-time-ci" label="CI">
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2728#discussion_r2365983918 -->

</details>

___

<b>Pattern 4: Add showLineNumbers to multi-line code blocks and specify language for all code fences to improve readability and copy experience.</b>

Example code before:

```javascript
const eventSource = new EventSource(apiUrl);
const eventSource2 = new EventSource(apiUrl2);
```

Example code after:

```javascript showLineNumbers
const eventSource = new EventSource(apiUrl);
const eventSource2 = new EventSource(apiUrl2);
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2762#discussion_r2318606757 -->

</details>

___

<b>Pattern 5: Replace ambiguous or duplicated admonitions and notes with concise single admonitions, ensuring they are properly closed and titled.</b>

Example code before:

```
:::tip
Transform vulnerability management...

:::

:::tip
Unify security strategy...

:::
```

Example code after:

```
:::tip Key takeaways
Transform vulnerability management and unify security strategy...

:::
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2862#discussion_r2429017631 -->

</details>

___

<b>Pattern 6: Standardize product phrasing and section structure for overviews; merge redundant "Overview" sections into the introduction and avoid repetitive wording.</b>

Example code before:

```
# Checkmarx One

Port's Checkmarx One integration allows...

## Overview

This integration allows you to:
```

Example code after:

```
# Checkmarx One

This integration allows you to model Checkmarx One resources in your catalog and ingest their data. It lets you map and organize the desired resources and metadata (see supported resources below).
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2719#discussion_r2365976073 -->

</details>

___

<b>Pattern 7: Clarify tables and examples to reduce redundancy and ambiguity; prefer single strong example over duplicate variants and ensure explanatory text matches examples.</b>

Example code before:

```
# Option 1: Separate blocks...

# Option 2: Single block with multiple relationships

(both shown sequentially)
```

Example code after:

```
# Recommended: Separate blocks for better performance

(Show the performant approach and explain why; remove the duplicate single-block variant)
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->
<!-- Example: https://github.com/port-labs/port-docs/pull/2721#discussion_r2312491246 -->

</details>

___

<b>Pattern 8: Use sentence case for headers with only the first word capitalized, and ensure links follow capitalization rules based on their position in the sentence.</b>

Example code before:

```
## Sync Approaches And Methods

Check out our [Guide](docs/guide.md) for more information.
```

Example code after:

```
## Sync approaches and methods

Check out our [guide](docs/guide.md) for more information.
```

Note: Well-known product names such as Lambda, Kubernetes, ArgoCD, etc. should follow their standard capitalization rules and styling.

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 9: Use "We" language instead of commanding "You" language to create a collaborative, guiding tone rather than issuing commands.</b>

Example code before:

```
You will now create a blueprint. In this guide you will create a service catalog.
```

Example code after:

```
We will now create a blueprint. Let's create a service catalog together.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 10: Use active voice instead of passive voice for clearer, more direct communication.</b>

Example code before:

```
Your Git provider is connected to by Port. The blueprint is created by the user.
```

Example code after:

```
Port connects to your Git provider. The user creates the blueprint.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 11: Add queryString to Tabs components and use HTML heading tags instead of markdown headers inside tabs to prevent TOC issues.</b>

Example code before:

```
<Tabs groupId="example">
<TabItem value="tab1" label="Tab 1">
## Header inside tab
Content here
</TabItem>
</Tabs>
```

Example code after:

```
<Tabs groupId="example" queryString>
<TabItem value="tab1" label="Tab 1">
<h2>Header inside tab</h2>
Content here
</TabItem>
</Tabs>
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 12: Always use full paths for links and images, and use descriptive link text instead of generic phrases.</b>

Example code before:

```
Check out [this page](../guide.md) for more details. [Click here](docs/tutorial.md) to learn more.
```

Example code after:

```
Check out the [setup guide](/docs/getting-started/set-up-service-catalog.md) for more details. Learn how to [configure blueprints](/docs/tutorial.md).
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 13: Format images with proper width, border, and full path to ensure consistent display and prevent blending with background.</b>

Example code before:

```
<img src='../img/screenshot.png' />
<img src='./images/example.png' />
```

Example code after:

```
<img src='/img/software-catalog/pages/excludePropertiesForm.png' width='50%' border='1px' alt='Form showing property exclusion options' />
```

Note: Images should be saved under `/static/img/` in the relevant directory. Always include alt text for accessibility.

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 14: Always specify the language for code blocks and use single backticks for inline code references to ensure proper syntax highlighting and formatting.</b>

Example code before (inline code):

```
To create a blueprint, use the Blueprint class.
```

Example code after (inline code):

```
To create a blueprint, use the `Blueprint` class.
```

Example code before (code block):

```
resources:
  - kind: repository
```

Example code after (code block):

```yaml showLineNumbers
resources:
  - kind: repository
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 15: Always include a title with admonitions to make their purpose clear and increase readability.</b>

Example code before:

```
:::tip
This feature is available in Port 2.0 and later.
:::
```

Example code after:

```
:::tip Version compatibility
This feature is available in Port 2.0 and later.
:::
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 16: Use bold text for UI element labels and buttons when documenting interface elements.</b>

Example code before:

```
Click the Save button to save your changes.
```

Example code after:

```
Click the **Save** button to save your changes.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 17: Keep list items parallel in structure and avoid adding "etc." items to maintain clarity and professionalism.</b>

Example code before:

```
The integration supports:
- Sync repositories
- You can track deployments
- Monitoring of services, etc.
```

Example code after:

```
The integration supports:
- Syncing repositories.
- Tracking deployments.
- Monitoring services.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 18: Break up long paragraphs into smaller chunks (3-5 sentences maximum) and keep sentences concise (15-25 words) for better readability.</b>

Example code before:

```
This integration allows you to connect your GitLab instance to Port and automatically sync repository data, including commits, branches, pull requests, and merge requests, which enables you to maintain an up-to-date view of your codebase and development activities in your software catalog without manual intervention, providing real-time visibility into your development workflow and code changes.

```

Example code after:

```
This integration allows you to connect your GitLab instance to Port. It automatically syncs repository data, including commits, branches, and merge requests. This maintains an up-to-date view of your codebase in your software catalog. The integration provides real-time visibility into your development workflow without manual intervention.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 19: Choose clear, straightforward language over clever or marketing-oriented phrasing, and define technical terms on first use.</b>

Example code before:

```
Leverage our revolutionary orchestration platform to supercharge your DevOps journey and unlock unprecedented agility through our cutting-edge catalog management solution.
```

Example code after:

```
Use Port to manage your software catalog. A catalog is a centralized inventory of all your software resources, including services, environments, and infrastructure components.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 20: Begin guide steps with action verbs and provide context to help users understand why they're performing each step.</b>

Example code before:

```
1. Go to the settings page.
2. Blueprint configuration.
3. Then save it.
```

Example code after:

```
1. Navigate to the settings page to access blueprint configuration options.
2. Configure your blueprint properties to define the resource structure.
3. Click **Save** to apply your changes and update the blueprint.
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 21: To make an internal link open in a new tab, prefix it with https://docs.port.io.</b>

Example code before:

```
Check out the [setup guide](/docs/getting-started/set-up-service-catalog.md) for more details.
```

Example code after:

```
Check out the [setup guide](https://docs.port.io/docs/getting-started/set-up-service-catalog.md) for more details.
```

Note: Internal links are links that lead to another page **within** the docs site.

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

<b>Pattern 22: Include comments in code examples to explain complex or non-obvious parts for better understanding.</b>

Example code before:

```javascript showLineNumbers
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

Example code after:

```javascript showLineNumbers
// Make API request to create a new blueprint
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`, // Include authentication token
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data) // Convert object to JSON string
});
```

<details><summary>Examples for relevant past discussions:</summary>

<!-- Add links to relevant PR discussions here -->

</details>

___

## Additional guidelines

### Tone & style

**General docs**

- Avoid using gender-specific language.
- When addressing the reader, use second-person pronouns (you, your). For example "You can achieve this by…".
- Use emojis 🥸 when you see fit. It can lighten a complex topic, and generally convey a friendly experience. Be careful not to overuse.
- Be search-oriented, ensure the proper keywords that users will likely search for in the page are present.
- Use consistent terminology throughout the documentation. Avoid using different terms to refer to the same concept.

**Guides & examples**

When writing guides and guide-like content:
- Include screenshots and/or GIFs to improve clarity.
- Structure guides with clear steps, using numbered lists for sequential actions.
- Provide context for each step to help users understand why they're performing it.
- Include expected outcomes after completing important steps.
- Add troubleshooting tips for common issues users might encounter.

### Technical writing best practices

- **Consistency**: Use the same terms, formatting, and patterns throughout the documentation.
- **Accuracy**: Ensure all technical information, code examples, and procedures are accurate and tested.
- **Completeness**: Include all necessary information without assuming too much prior knowledge.
- **Use examples**: Provide real-world examples to illustrate concepts.
- **Versioning awareness**: Clearly indicate when features are version-specific.

### Lists

- Use `-` for bullets.
- For numbered lists, use `1.` for all items (Markdown will automatically number them correctly).

### Images & GIFs

- Consider using GIFs when you think they will better convey what you're trying to demonstrate.
- Ensure screenshots are current and reflect the latest UI.

### Code examples

- Ensure code examples are complete and can be copied and used directly when possible.
- Test all code examples to ensure they work as documented.

### Links

- Decide if you want your link to open in the same tab or a new one.
- Check that all links work before submitting your contribution.

### Hierarchy changes

- If you move/delete/change the path of a file, check to see if its URL is used in other places such as:
    - The main Port monorepo.
    - Port's marketing site.
    - Port's Github action.
    - Any other place that may be relevant to the page you're changing.
- Consider adding a redirect in our Amplify (hosting service), this is especially useful when moving/changing entire directories. Talk to @Hadar to achieve this.

### Admonitions

- Use the type that best fits the nature of your text. The available types can be found [here](https://docusaurus.io/docs/markdown-features/admonitions).
- Use admonitions sparingly to highlight important information. Overuse reduces their effectiveness.
- Choose the appropriate admonition type based on the content:
  - `tip`: For helpful suggestions
  - `info`: For additional context
  - `caution`: For potential issues
  - `warning`: For critical information

### Tips

- Docusaurus doesn't allow broken internal links, so run `npm run build` before pushing to ensure all links are valid.
- Preview your changes locally using `npm start` to see how they will appear on the live site.
- Consider the reading flow and information hierarchy when structuring your content.
- Use headings to create a logical structure that helps readers navigate the content.

### Formatting standards

- Spacing! <br /> is your friend, use it sparingly to make pages easier on the eyes.
- Use consistent formatting for similar elements throughout the documentation.
- Maintain a clear visual hierarchy with appropriate spacing between sections.
- Use tables for comparing multiple items or presenting structured data.
- For complex procedures, consider using a numbered list with clear, concise steps.

### Document review checklist

Before submitting your contribution, review it against this checklist:

- [ ] Content is accurate and up-to-date
- [ ] Spelling and grammar are correct
- [ ] Formatting is consistent with the guidelines
- [ ] Links work correctly
- [ ] Images display properly
- [ ] Code examples are functional and follow best practices
- [ ] Tone is consistent with Port's documentation style
- [ ] Content is organized logically
- [ ] Technical terms are explained or linked to definitions
- [ ] No unnecessary jargon or marketing language