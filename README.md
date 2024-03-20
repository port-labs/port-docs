<h1 align="center">
  <p align="center">Port Documentation</p>
  <a href="https://docs.getport.io"><img src="https://port-graphical-assets.s3.eu-west-1.amazonaws.com/Port+Logo.svg" alt="Port" width="15%"></a>
</h1>

<p align="center">
  <a href="https://github.com/port-labs/port-docs/actions/workflows/verify-docs-build.yml"><img src="https://github.com/port-labs/port-docs/actions/workflows/verify-docs-build.yml/badge.svg" alt="GitHub Actions status"></a>
  <a href= "https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"></a>

</p>

## Introduction

Port is a Developer Platform made to make life easier for developers and DevOps in an organization, by creating a single platform that acts as a single source-of-truth for all of the infrastructure assets and operations existing in the organization's tech stack.

## Port's documentation

This is the repository for Port's documentation website (available at [https://docs.getport.io](https://docs.getport.io))

Port's documentation is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

Our documentation is hosted using [AWS Amplify](https://aws.amazon.com/amplify/).

## Installation

Install [NodeJS](https://nodejs.org), it is recommended to use [NVM](https://github.com/nvm-sh/nvm#install--update-script) to make installation and management of different NodeJS versions on the same machine easier:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

If you prefer to install NodeJS manually, please refer to the [`.nvmrc`](./.nvmrc) file to see what version the docs are currently using.

Now, clone the repository of Port's documentation and follow the instructions:

### If you use `nvm`

```bash
# cd to the directory of the docs and run
nvm install
nvm use
npm install
npm run start
```

### If you installed NodeJS manually

```bash
# cd to the directory of the docs and run
npm install
npm run start
```

The docs will start running locally on [https://localhost:4000](https://localhost:4000)

## Contributing

Port's documentation is open source because we want the documentation to be the most comprehensive resource for users to learn how to use Port. We believe that developers and DevOps professionals who use Port on a daily basis will want to contribute and help make it that comprehensive resource.

In order to learn how you can contribute to Port's documentation, read our [contributing guide](./CONTRIBUTING.md)
