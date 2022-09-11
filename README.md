- [Getting started with the docs](#getting-started-with-the-docs)
- [Docs Styling and Content Guidelines](#docs-styling-and-content-guidelines)

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Getting started with the docs

Install nodejs, it is recommended to use [NVM](https://github.com/nvm-sh/nvm#install--update-script):

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# After this, you can use nvm to install the latest version of node:
nvm install node
```

If you are not using NVM, just install the latest version of [Node](https://nodejs.org/en/) LTS

Once you have Node installed, Create a new branch in this repository and install package dependencies by running the following command in the project directory:

```
npm install
```

Then you can start looking at the docs and editing them using:

```
npm run start
```

### Docs Styling and Content Guidelines

**Capital Letters**

1. **Headlines** - All titles should look the same throughout the whole document. Please make sure that capital letters in headlines adhere to the following rules (Most of these rules are already enforced using CSS)
   1. **Section headlines (H1)** - capital letters throughout the headlines (including propositions). For example, "Port Platform Overview".
   2. **Subtitles (H2-4)** - capital letters only for the first word of the subtitle. The rest of the sentence will be in lowercase letters. For example: "Our building-space".
   3. **Notice/tip/info boxes** - All letters will be capital letters.
   4. **Other** - discuss the matter with the rest of the team and decide together.
2. **Links** - unless the link is at a start of a new sentence, it should not be with capital letters.
3. **Port terms** - the only words that can be capitalized, not within the start of the a new sentence or headline, are specific Port terms, agreed upon in advance. Throughout the docs, these words should always be capitalized (also in subtitles). The terms:
   1. Port;
   2. Blueprint;
   3. Entity;
   4. Relation;
   5. Mirror-Properties;
   6. Lambda;
   7. Software Catalog;
   8. Other code lines and terms (agreed upon in advance).
4. **Button names** - will be capitalized according to the exact way the term is written in Port.
5. **After brackets or a colon (`:`)** - there is no need to put a capital letter.

**Punctuation**

1. Every sentence must end with a period, including the sentences in tip/notice boxes.
2. Before an image/code line example is displayed, put a colon (`:`).
3. Lists: a short list (any list in which each line is less than 2 sentences) should appear as shown below. The mark `;`, at the end of each line, and a period at the last line.
   1. One;
   2. Two;
   3. Three.

**Writing Style**

1. Pay attention to writing "the … **will** look like this", instead of "the … should **look** like this". It shows more confidence.
2. Write the docs in second person grammar, and not in third person grammar. For example: "**you** should do this" instead of "**we** will do this".
3. Write small numbers (up to 10), in a word and not in a number. For example **two** instead of **2**.
4. Make sure the spacing between different types of lines is the same throughout the whole document.
5. When referring to someone performing an action that isn’t the docs reader, refer to them in a plural word, and not in second body grammer. For example, “they can use”, instead of “he can use”.
6. Try avoiding adding “ing” to actions. FOr example, “reacting to” compared to “react to”.
