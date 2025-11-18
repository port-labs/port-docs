## Review guidelines

**⚠️ MANDATORY: These guidelines MUST be enforced. Flag ALL violations as blocking issues.**

### Capitalization - CRITICAL

- **REQUIRED**: Headers must have a capital letter only for the first word, rest in lowercase (e.g., "Promote scorecards"). **FLAG** any header with multiple capitalized words.
- **REQUIRED**: Links must not be capitalized unless at the start of a new sentence. **FLAG** capitalized links mid-sentence.
- **REQUIRED**: General product names (Lambda, Kubernetes, ArgoCD) and inisialism must follow standard capitalization. **FLAG** incorrect product name capitalization. So for example: "Create a Cursor API key" is ok.

### Code Examples - CRITICAL STANDARDS

- **REQUIRED**: Code blocks with more than one line must include `showLineNumbers`. **FLAG** code blocks missing `showLineNumbers`.
- **REQUIRED**: Ensure code examples are complete and can be copied directly. **FLAG** incomplete or non-functional code examples.
- **REQUIRED**: Use syntax highlighting by specifying the language after opening backticks. **FLAG** code blocks without language specification.
- **REQUIRED**: For inline code references, use single backticks (e.g., `blueprint`). **FLAG** incorrect inline code formatting.

### Tone & Style - MANDATORY

- **REQUIRED**: Use second-person pronouns (you, your) when addressing the reader. **FLAG** third-person or inconsistent pronoun usage.
- **REQUIRED**: Avoid commanding language like "You will now create...". **FLAG** any instance and require "We will now create..." or "Let's create..." instead.
- **REQUIRED**: Keep sentences concise and direct (aim for 15-25 words per sentence). **FLAG** any sentence exceeding 25 words.
- **REQUIRED**: Use active voice rather than passive voice. **FLAG** passive voice constructions.
- **REQUIRED**: Break up long paragraphs into smaller chunks (3-5 sentences maximum). **FLAG** paragraphs with more than 5 sentences.
- **REQUIRED**: Use consistent terminology throughout; avoid using different terms for the same concept. **FLAG** inconsistent terminology.

### Links - BLOCKING ISSUES

- **REQUIRED**: All links must use full paths, not relative ones. **FLAG** any relative link as a blocking issue.
- **REQUIRED**: Use descriptive link text; avoid generic phrases like "click here" or "learn more". **FLAG** generic link text.
- **REQUIRED**: Verify that all links work correctly. **FLAG** broken links as blocking issues.

### Lists - MANDATORY FORMATTING

- **REQUIRED**: Use `-` for bullet lists and end each item with a `.` (not `;`). **FLAG** lists ending with semicolons or missing periods.
- **REQUIRED**: Keep list items parallel in structure. **FLAG** non-parallel list structures.

### Images - REQUIRED ATTRIBUTES

- **REQUIRED**: Images must have a simple black border and use full path links. **FLAG** images missing borders or using relative paths.
- **REQUIRED**: Images must have proper `width` defined and include alt text. **FLAG** images missing width or alt text.

### Components - MANDATORY CONFIGURATION

- **REQUIRED**: Tabs component must include `queryString` attribute. **FLAG** tabs missing `queryString`.
- **REQUIRED**: Don't use `#` headers inside tabs; use `<h2>` instead. **FLAG** `#` headers inside tabs.
- **REQUIRED**: Admonitions must always include a title. **FLAG** admonitions without titles.
- **REQUIRED**: Use admonitions sparingly and choose the appropriate type (tip, info, caution, warning). **FLAG** overuse or incorrect admonition types.

### File Management - BLOCKING CHECKS

- **REQUIRED**: When moving/deleting/changing file paths, verify URLs aren't used elsewhere. **FLAG** unverified path changes as blocking issues.
- **REQUIRED**: Run `npm run build` before pushing to ensure all links are valid. **FLAG** if build was not run.

### Content Quality - MANDATORY STANDARDS

- **REQUIRED**: Content must be accurate, up-to-date, and free of spelling/grammar errors. **FLAG** any errors.
- **REQUIRED**: Formatting must be consistent with the style guide. **FLAG** inconsistent formatting.
- **REQUIRED**: Technical terms must be explained or linked to definitions on first use. **FLAG** unexplained technical terms.
- **REQUIRED**: Avoid unnecessary jargon or marketing language. **FLAG** jargon or marketing language.
- **REQUIRED**: Use bold text for UI element labels and buttons (e.g., **Save** button). **FLAG** UI elements not in bold.
