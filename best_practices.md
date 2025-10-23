
<b>Pattern 1: Always standardize collapsible details with bold titles and "(click to expand)" for consistency and usability across docs.</b>

Example code before:
```
<details>
<summary>ArgoCD Application</summary>
...
</details>
```

Example code after:
```
<details>
<summary><b>ArgoCD Application (click to expand)</b></summary>
...
</details>
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/port-labs/port-docs/pull/2834#discussion_r2413145776
- https://github.com/port-labs/port-docs/pull/2822#discussion_r2366195599
- https://github.com/port-labs/port-docs/pull/2813#discussion_r2357848292
- https://github.com/port-labs/port-docs/pull/2728#discussion_r2415797338
- https://github.com/port-labs/port-docs/pull/2719#discussion_r2365971202
</details>


___

<b>Pattern 2: Enforce consistent typography and punctuation in headings and lists, using sentence case for headers and periods at the end of bullet items.</b>

Example code before:
```
## Sync Approaches
- Track security vulnerabilities and findings from ArmorCode in Port
```

Example code after:
```
## Sync approaches
- Track security vulnerabilities and findings from ArmorCode in Port.
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/port-labs/port-docs/pull/2710#discussion_r2314035337
- https://github.com/port-labs/port-docs/pull/2728#discussion_r2365980940
- https://github.com/port-labs/port-docs/pull/2728#discussion_r2365982642
- https://github.com/port-labs/port-docs/pull/2710#discussion_r2314053052
- https://github.com/port-labs/port-docs/pull/2763#discussion_r2319415746
</details>


___

<b>Pattern 3: Use consistent installation method labels (“Self-hosted” and “CI”) and avoid outdated phrasing like “Real-time (self-hosted)” or “Scheduled (CI)”.</b>

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

- https://github.com/port-labs/port-docs/pull/2728#discussion_r2365983918
- https://github.com/port-labs/port-docs/pull/2728#discussion_r2365984328
- https://github.com/port-labs/port-docs/pull/2719#discussion_r2358856796
</details>


___

<b>Pattern 4: Add showLineNumbers to multi-line code blocks and specify language for all code fences to improve readability and copy experience.</b>

Example code before:
```
```javascript
const eventSource = new EventSource(apiUrl);
```
```

Example code after:
```
```javascript showLineNumbers
const eventSource = new EventSource(apiUrl);
```
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/port-labs/port-docs/pull/2762#discussion_r2318606757
- https://github.com/port-labs/port-docs/pull/2710#discussion_r2314081477
- https://github.com/port-labs/port-docs/pull/2710#discussion_r2314083388
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

- https://github.com/port-labs/port-docs/pull/2862#discussion_r2429017631
- https://github.com/port-labs/port-docs/pull/2719#discussion_r2358973002
</details>


___

<b>Pattern 6: Standardize product phrasing and section structure for overviews; merge redundant “Overview” sections into the introduction and avoid repetitive wording.</b>

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

- https://github.com/port-labs/port-docs/pull/2719#discussion_r2365976073
- https://github.com/port-labs/port-docs/pull/2745#discussion_r2312467084
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

- https://github.com/port-labs/port-docs/pull/2721#discussion_r2312491246
- https://github.com/port-labs/port-docs/pull/2763#discussion_r2319409588
- https://github.com/port-labs/port-docs/pull/2811#discussion_r2348607115
</details>


___
