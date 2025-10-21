---
sidebar_position: 9
title: Context Lake
sidebar_label: Context Lake
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Context lake

Port's Context Lake is your unified engineering knowledge layer—connecting data from across your entire toolchain into a single, semantically-rich source of truth. It's not a separate feature, but rather the powerful result of Port's core capabilities working together to provide organizational context that AI agents, developers, and workflows can understand and act upon.

## What comprises the context lake

The context lake transforms scattered data across your engineering tools into unified organizational knowledge. It is built from four core components:

### Software catalog - your data

The [software catalog](/build-your-software-catalog) is where you define YOUR organization's data model using blueprints (services, environments, teams, deployments, incidents, etc.) and populate it with entities from all your tools. This catalog becomes your organizational semantic layer—teaching Port what "service," "deployment," or "incident" means specifically in your context, providing the schema and structure that gives meaning to your data.

### Access controls - data governance

[RBAC and permissions](/sso-rbac/rbac-overview) ensure that the right people and systems see the right data. Teams, roles, and policies control who can view, edit, or act on catalog data, maintaining security while enabling collaboration and providing governed access to your organizational knowledge.

### Scorecards - your standards

[Scorecards](/scorecards/overview) define and track your engineering standards, KPIs, and quality metrics. They encode organizational expectations—production readiness requirements, security compliance rules, operational best practices—as measurable criteria within the Context Lake, providing the organizational standards and quality signals that inform decisions.

### Interface layer - how you access it

Context Lake data becomes actionable through multiple interfaces: **[AI Interfaces](/ai-interfaces/overview)** where AI agents and assistants query through [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) to understand your organization, **[API](/api-reference/port-api)** for programmatic access, and **[Interface Designer](/customize-pages-dashboards-and-plugins/dashboards/)** with dashboards and visualizations that surface insights to your teams—providing multiple ways to query, visualize, and act on your organizational context.

## Why the context lake matters

<Tabs groupId="context-lake-value" queryString>
<TabItem value="ai-agents" label="For AI agents">

Generic AI doesn't understand what "production-ready" means in YOUR organization, who owns which services, or how your deployment pipeline works. Context Lake provides this semantic understanding, enabling AI agents to:

- Answer ownership questions with definitive data (not guesses from code comments).
- Understand dependencies and relationships between services.
- Follow your organization's standards and guardrails when taking actions.
- Make decisions based on real-time operational context.

</TabItem>
<TabItem value="developers" label="For developers">

Instead of hunting across 10 different tools to understand a service's dependencies, ownership, deployment history, or incident timeline, developers get unified context in one place. The Context Lake connects the dots automatically.

**Benefits:**
- Quick access to service ownership and team information.
- Understand dependencies without switching between tools.
- See complete deployment and incident history in context.
- Get AI-powered insights based on your organization's actual data.

</TabItem>
<TabItem value="platform-teams" label="For platform teams">

Define your organizational semantics once—service definitions, environment types, team structures, standards—and every tool, workflow, and AI agent can consume this shared knowledge. No more syncing configurations across systems.

**Benefits:**
- Single source of truth for organizational definitions.
- Consistent standards across all tools and automations.
- Reduced maintenance overhead from duplicate configurations.
- Enable self-service while maintaining governance.

</TabItem>
</Tabs>

## Context lake in action

<Tabs groupId="context-lake-examples" queryString>
<TabItem value="ownership" label="AI agent understanding ownership">

**Developer asks:** "Who owns the payments service?"

- **Without Context Lake:** AI guesses based on code comments or recent contributors.
- **With Context Lake:** AI queries the catalog → sees Team relation → returns the owning team with Slack channel and on-call schedule.

</TabItem>
<TabItem value="provisioning" label="Autonomous service provisioning">

**AI agent needs to provision a dev environment:**

- **Without Context Lake:** Agent doesn't know company's cloud standards, naming conventions, or cost limits.
- **With Context Lake:** Agent queries blueprints → understands allowed regions, naming patterns, tagging requirements → provisions correctly within organizational guardrails.

</TabItem>
<TabItem value="incident" label="Incident response">

**Alert fires:** "payments-api pod crashing"

- **Without Context Lake:** Engineer hunts through Slack, wiki, runbooks across multiple tools.
- **With Context Lake:** Port surfaces: recent deployments, related PRs, dependent services, ownership, SLOs, past incidents—all in unified context for faster resolution.

</TabItem>
</Tabs>

## Getting started

Building your Context Lake is a natural part of setting up Port:

1. **[Define your data model](/build-your-software-catalog)** - Create blueprints that represent your organization's entities.
2. **[Connect your tools](/build-your-software-catalog/sync-data-to-catalog)** - Ingest data from GitHub, Kubernetes, PagerDuty, and 100+ other integrations.
3. **[Set up relationships](/build-your-software-catalog/customize-integrations/configure-mapping#relations)** - Define how entities connect to each other.
4. **[Configure access controls](/sso-rbac/rbac-overview)** - Ensure proper data governance.
5. **[Define standards](/scorecards/overview)** - Create scorecards that encode your quality requirements.

As you build your catalog, you're simultaneously building your Context Lake—the unified knowledge layer that powers intelligent automation and AI-driven workflows.



