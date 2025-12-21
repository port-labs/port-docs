---
sidebar_position: 9
title: Context Lake
sidebar_label: Context Lake
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Context lake

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />

Port's Context Lake is your unified engineering knowledge layer—connecting data from across your entire toolchain into a single, semantically-rich source of truth. It's not a separate feature, but rather the powerful result of Port's core capabilities working together to provide organizational context that AI agents, developers, and workflows can understand and act upon.

## What comprises the context lake

The context lake transforms scattered data across your engineering tools into unified organizational knowledge. It is built from four core components:

### Software catalog - your data

The [software catalog](/build-your-software-catalog) is where you define YOUR organization's data model using blueprints (services, environments, teams, deployments, incidents, etc.) and populate it with entities from all your tools. This catalog becomes your organizational semantic layer—teaching Port what "service," "deployment," or "incident" means specifically in your context, providing the schema and structure that gives meaning to your data.

### Business context - organizational priorities

Beyond technical metadata, the Context Lake enriches your software catalog with **business context**—the organizational, financial, and operational signals that help prioritize work, assess risk, and align engineering decisions with business objectives. This business layer transforms technical catalogs into decision-making platforms by answering: *"What matters most to the business?"*

Business context in Port includes:

#### Cost & financial context
- **Cost center attribution** - Track which department or budget owns each resource via [AWS Cost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost) or [Kubecost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/kubecost)
- **Revenue impact** - Tag services that directly generate revenue or support revenue-generating features
- **Cloud spending patterns** - Understand resource costs to inform optimization and prioritization decisions

#### Criticality & risk context
- **Business criticality levels** - Classify services (e.g., mission-critical, customer-facing, internal tooling) to drive different [SLA requirements](/guides/all/track-slos-and-slis-for-services), triage workflows, and [automation policies](/solutions/security/prioritise-vulnerabilities#policy-as-code)
- **Disaster recovery tier** - Define RTO/RPO requirements based on business impact to inform backup strategies and incident response priorities
- **Data sensitivity** - Mark resources handling PII, financial data, or regulated information to enforce compliance controls
- **Compliance scope** - Tag services subject to SOC 2, GDPR, HIPAA, or PCI-DSS to ensure audit readiness

#### Operational context
- **SLAs & SLOs** - Define service-level agreements and objectives to measure reliability, track [MTTR](/guides/all/track-and-show-mtbf-for-services), and ensure [SLA compliance](/solutions/security/prioritise-vulnerabilities#sla-visibility)
- **On-call ownership** - Integrate [PagerDuty schedules](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) to understand who's responsible right now for incident response
- **Escalation policies** - Define who to notify and when for different severity levels based on business impact
- **Incident captain & responder roles** - Track who's currently leading incidents or available for triage

#### Organizational context
- **Team affiliation** - Connect services to teams via [GitHub CODEOWNERS](/build-your-software-catalog/sync-data-to-catalog/git/github) or [Jira project mappings](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples) for clear ownership
- **Reporting hierarchy** - Map organizational structure (team → department → division) for escalation paths
- **Business unit alignment** - Associate services with product lines or business units to understand impact radius

#### Customer & product context
- **Customer tier** - Identify which customer segments are affected (e.g., enterprise, gold-tier, freemium) to prioritize incidents and features affecting high-value customers
- **Product lifecycle stage** - Tag services by maturity (closed beta, open beta, GA, deprecated) to set appropriate expectations and SLAs—a closed beta feature with 10 freemium users has different urgency than a GA feature serving enterprise customers

**Why business context matters:**

When AI agents and workflows understand business context, they can:
- **Prioritize vulnerabilities** affecting revenue-generating production services over internal dev tools
- **Route incidents** to the right on-call engineer based on service ownership and escalation policies
- **Estimate blast radius** of a deployment by understanding dependent services and their business criticality
- **Automatically enforce policies** like "critical services must have SLOs defined" or "PII-handling services require SOC 2 compliance checks"
- **Calculate risk scores** that combine technical severity (CVSS) with business impact (criticality + revenue + SLA + customer tier)
- **Adjust incident response** based on affected customer tier—a P1 incident affecting enterprise customers triggers immediate executive notification, while the same issue in closed beta may follow standard on-call procedures

**Example use cases:**

<Tabs groupId="business-context-examples" queryString>
<TabItem value="vulnerability-triage" label="Risk-based vulnerability triage">

**Scenario:** A critical CVE is discovered in a library used by multiple services.

**Without business context:** Security team gets hundreds of alerts—no clear way to prioritize which services to patch first.

**With Port's business context:**
1. Port enriches each vulnerability with:
   - Service **business criticality** (mission-critical vs. internal)
   - **Revenue impact** (directly revenue-generating or not)
   - **SLA requirements** (99.99% uptime vs. best-effort)
   - **Data sensitivity** (handles customer PII or not)
   - **Compliance scope** (subject to SOC 2 audit)
   - **Customer tier** (enterprise vs. freemium)

2. AI agent or automation calculates **risk score**:
   ```
   Risk = CVE Severity × (Business Criticality + Revenue Impact + SLA Weight + Compliance Factor + Customer Tier)
   ```

3. Results in prioritized triage queue:
   - **Fix immediately**: Payment service (mission-critical, revenue-generating, 99.99% SLA, PCI-DSS scope, enterprise customers)
   - **Fix this sprint**: Customer portal (customer-facing, revenue-supporting, 99.5% SLA, gold-tier customers)
   - **Backlog**: Internal dev tools (low criticality, no SLA, internal users only)

*Learn more:* [Prioritize vulnerabilities with business context](/solutions/security/prioritise-vulnerabilities)

</TabItem>
<TabItem value="incident-routing" label="Context-aware incident routing">

**Scenario:** Production API starts returning 500 errors during business hours.

**Without business context:** Generic "production down" alert → manual escalation → wasted time finding the right owner.

**With Port's business context:**
1. Port's incident automation queries Context Lake for:
   - Service **on-call schedule** from PagerDuty
   - Service **business criticality** and **SLA** (99.99% uptime)
   - **Revenue impact** (payment processing = revenue-blocking)
   - **Customer tier affected** (enterprise customers experiencing errors)
   - **Product lifecycle stage** (GA with 10,000+ active users)
   - **Recent deployments** (was there a recent change?)
   - **Dependent services** (what else might be affected?)

2. Automation takes action based on context:
   - **Closed beta, freemium users**: Page on-call engineer via standard PagerDuty workflow
   - **GA, enterprise customers**: Immediate P1 escalation → page incident captain + notify VP Engineering → create executive war room

3. Result: **Faster MTTR and appropriate response** because both responders and escalation paths match business impact

*Learn more:* [Generate incident updates with n8n and Port](/guides/all/generate-incident-updates-with-n8n-and-port)

</TabItem>
<TabItem value="aep-disaster-recovery" label="Disaster recovery policy enforcement">

**Scenario:** Platform team needs to ensure all mission-critical services have disaster recovery plans.

**Without business context:** Manual spreadsheet tracking → inconsistent enforcement → audit findings.

**With Port's business context:**
1. Services are tagged with:
   - **Business criticality** (mission-critical, high, medium, low)
   - **Disaster recovery tier** (Tier 1: RTO < 1hr, Tier 2: RTO < 4hr, Tier 3: RTO < 24hr)
   - **Backup schedule** (daily, weekly, none)
   - **Customer tier impact** (affects enterprise vs. freemium)
   - **Product lifecycle** (GA services have stricter DR requirements than beta)

2. Port automation enforcement policy (AEP):
   ```
   IF service.businessCriticality == "mission-critical"
   AND service.productLifecycle == "GA"
   AND service.disasterRecoveryTier != "Tier 1"
   THEN fail_scorecard("Missing DR Plan")
   AND create_jira_ticket(owner, "Define DR plan with RTO < 1hr for GA mission-critical service")
   ```

3. Scorecard dashboard shows:
   - 12/15 mission-critical GA services have Tier 1 DR plans
   - 3 services out of compliance → auto-created tickets assigned to owners
   - Beta services excluded from strict DR requirements until GA launch

*Learn more:* [Compliance as code](/solutions/security/compliance-as-code)

</TabItem>
</Tabs>

**Ingesting business context into Port:**

Business context comes from many sources:
- **Cloud providers** (cost data via [AWS Cost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost), [Kubecost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/kubecost))
- **Incident management** (on-call schedules via [PagerDuty](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty), [ServiceNow](/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow))
- **Source control** (team ownership via [GitHub CODEOWNERS](/build-your-software-catalog/sync-data-to-catalog/git/github), [GitLab](/build-your-software-catalog/sync-data-to-catalog/git/gitlab))
- **Project management** (business unit, stakeholders via [Jira](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples))
- **Manual enrichment** (business criticality, revenue impact, SLAs, customer tier, product lifecycle added as blueprint properties and updated via [self-service actions](/actions-and-automations/setup-backend/github-workflow/) or [API](/api-reference/port-api))

The Context Lake unifies all these sources so AI agents, workflows, and dashboards can make business-aware decisions.

### Access controls - data governance

[RBAC and permissions](/sso-rbac/rbac-overview) ensure that the right people and systems see the right data. Teams, roles, and policies control who can view, edit, or act on catalog data, maintaining security while enabling collaboration and providing governed access to your organizational knowledge.

### Scorecards - your standards

[Scorecards](/scorecards/overview) define and track your engineering standards, KPIs, and quality metrics. They encode organizational expectations—production readiness requirements, security compliance rules, operational best practices—as measurable criteria within the Context Lake, providing the organizational standards and quality signals that inform decisions.

### Interface layer - how you access it

Context Lake data becomes actionable through multiple interfaces: **[AI Interfaces](/ai-interfaces/overview)** where AI agents and assistants query through [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) to understand your organization, **[API](/api-reference/port-api)** for programmatic access, and **[Interface Designer](/customize-pages-dashboards-and-plugins/dashboards/overview)** with dashboards and visualizations that surface insights to your teams—providing multiple ways to query, visualize, and act on your organizational context.

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

## External agents and AI workflows

External AI agents and automation workflows can leverage Port's Context Lake to make intelligent, context-aware decisions without needing direct access to your entire toolchain. Instead of building custom integrations for each tool, external systems can query Port's unified knowledge layer to understand your organization's structure, relationships, and standards.

### n8n integration

Port provides a custom n8n node that simplifies integration with Port's AI agents and Context Lake. To get started:

1. **[Set up Port's n8n custom node](/ai-interfaces/port-n8n-node)** — Install and configure the Port node in your n8n instance
2. **[Build automation workflows](/guides/all/remediate-vulnerability-with-n8n-and-port)** — See an example of using Port as a context lake for vulnerability management workflows

## Getting started

Building your Context Lake is a natural part of setting up Port:

1. **[Define your data model](/build-your-software-catalog)** - Create blueprints that represent your organization's entities.
2. **[Connect your tools](/build-your-software-catalog/sync-data-to-catalog)** - Ingest data from GitHub, Kubernetes, PagerDuty, and 100+ other integrations.
3. **[Set up relationships](/build-your-software-catalog/customize-integrations/configure-mapping#relations)** - Define how entities connect to each other.
4. **[Configure access controls](/sso-rbac/rbac-overview)** - Ensure proper data governance.
5. **[Define standards](/scorecards/overview)** - Create scorecards that encode your quality requirements.

As you build your catalog, you're simultaneously building your Context Lake—the unified knowledge layer that powers intelligent automation and AI-driven workflows.



