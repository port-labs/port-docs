# Cursor Rules for Port Documentation

This document explains how we use Cursor rules to maintain documentation quality and consistency.

## What are Cursor Rules?

Cursor rules are special instructions that guide the Cursor AI assistant when working with our codebase. They help enforce our documentation standards and best practices automatically.

The rules are stored in the `.cursor/rules` directory as `.mdc` (Markdown Domain Configuration) files, with each file focusing on specific aspects of our documentation.

## Our Rule Structure

We've organized our Cursor rules into several categories:

1. **Documentation Style** - General writing style, tone, and formatting guidelines
2. **Markdown Components** - Standards for code blocks, images, tabs, and other components
3. **Admonitions** - Guidelines for using callouts effectively
4. **JavaScript/TypeScript Standards** - Code style for our website components
5. **Docusaurus Configuration** - Rules for managing our documentation framework

## Benefits of Using Cursor Rules

- **Consistency**: Ensures all documentation follows Port's style guidelines
- **Efficiency**: Provides automated guidance when writing docs
- **Quality**: Helps maintain high standards across the documentation
- **Onboarding**: Helps new contributors understand our standards

## How to Use Cursor with These Rules

1. Install [Cursor IDE](https://cursor.sh/) if you haven't already
2. Open the Port documentation repository in Cursor
3. The rules will automatically be applied when working with files
4. When editing documentation, ask the Cursor AI for help, and it will follow these guidelines

## Extending the Rules

To suggest improvements to our Cursor rules:

1. Examine the existing rules in `.cursor/rules/*.mdc`
2. Create or modify rule files as needed
3. Submit a pull request with your changes
4. Explain how your changes improve the documentation process

## Reference

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Our detailed contribution guidelines
- [Cursor Documentation](https://docs.cursor.sh/) - Learn more about Cursor features 