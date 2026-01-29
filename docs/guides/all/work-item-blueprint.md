---
displayed_sidebar: null
description: Learn how to implement the work item blueprint pattern for agentic workflows
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Implement the work item blueprint pattern

This guide demonstrates the recommended pattern for managing development workflows in Port using a dedicated `work_item` blueprint which is separate from origin entities like Jira issues or GitHub issues. 

In a scenario where your team wants AI agents to help triage, plan, and create Jira issues, the intuitive approach might be to add custom fields like `ai_suggested_priority`, `ai_plan_approved`, `coding_agent_status`, or `deployment_environment` directly to the `jiraIssue` blueprint, However this creates the following problems:

| Problem | What happens |
|---------|--------------|
| Tight coupling | Your AI logic becomes dependent on Jira's data model. Changing workflows means modifying Jira configurations. |
| Field pollution | Jira tickets accumulate workflow-specific fields that clutter the interface and confuse users. |
| Limited context | Jira doesn't connect to your service catalog, deployment history, or PR status. AI agents lack the context they need. |
| Rigid progression | Stage transitions get hard-coded into Jira workflows, making customization difficult without admin access. |
| Difficult to customize | Automating directly on origin entities creates tight coupling between AI agent logic and external systems. |

The work item blueprint pattern solves these problems by separating workflow state from origin entities. This guide walks through the pattern, its five-stage workflow, scorecard configuration, and self-service actions.

## The workflow blueprint pattern

The workflow entity (`work_item`) maintains a relation to the origin entity while tracking its own execution state and provides the following benefits:

- **A clean Jira ticket.** The Jira issue stays focused on requirements and no workflow-specific fields are needed.
- **Rich context aggregation.** The `work_item` [connects to related entities](#how-relations-provide-context), giving AI agents access to relevant context needed for decision making.
- **A flexible AI integration.** Each workflow stage has a specific [AI agent](/ai-interfaces/ai-agents/overview) with a focused responsibility.
- **Customizable progression.** [Scorecard](/scorecards/overview) rules enforce prerequisites without modifying the origin system.

:::info How relations provide context

The `work_item` blueprint connects to entities across your software catalog: the origin Jira ticket, the service being modified, the team and owner responsible, the repository and PR where code changes happen, and the deployment record.

These relations matter because AI agents need context to make good decisions. When a planning agent suggests priority, it can check the service tier. When a deploy agent assesses risk, it can look at the service's dependencies and recent incidents. The work item doesn't store this data, it gets access to it through [mirror properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property), so everything stays in sync.
:::

## The five-stage workflow

The `work_item` blueprint uses a scorecard to manage progression through the following five stages:

```
Draft → Plan → Develop → Deploy → Completed
```

Each stage represents a distinct phase with specific requirements and AI integration points.

<Tabs groupId="workflow-stage" queryString>

<TabItem value="draft" label="Draft">

**Purpose:** Capture new work that needs attention.

Work items enter this stage when created from a Jira ticket or other source. They contain minimal information and await triage.

**Requirements:** None (starting state).

**AI integration:** AI can suggest initial categorization based on the ticket description.

</TabItem>

<TabItem value="plan" label="Plan">

**Purpose:** Triage and prepare work for development.

During this stage, the team assigns ownership, sets priority, and determines the AI augmentation level.

**Requirements to enter:**
- Owner assigned.
- Priority set.
- AI augmentation level defined.

**AI integration:** AI can analyze the ticket, suggest priority based on service tier and historical patterns, and draft a technical plan.

</TabItem>

<TabItem value="develop" label="Develop">

**Purpose:** Execute the implementation work.

Code changes happen during this stage. AI coding agents can generate PRs, and human developers review and refine the work.

**Requirements to enter:**
- Plan approved by a human.
- Pull request created.

**AI integration:** Coding agents (Claude Code, Devin, Codex) generate implementation. AI can also nudge reviewers and summarize PR changes.

</TabItem>

<TabItem value="deploy" label="Deploy">

**Purpose:** Promote changes to production safely.

After the PR merges, the work item enters the deploy stage. Teams can review blast radius and approve production deployment.

**Requirements to enter:**
- PR merged.

**AI integration:** AI can assess deployment risk based on service dependencies and suggest deployment timing.

</TabItem>

<TabItem value="completed" label="Completed">

**Purpose:** Mark work as done and capture metrics.

The final stage records completion time and enables cycle time analysis.

**Requirements to enter:**
- Deployment successful in production.

</TabItem>

</Tabs>



## Scorecard configuration

The scorecard evaluates work item properties and relations to determine the current stage. Rules at each level act as gates.

```json showLineNumbers
{
  "identifier": "work_item_stage",
  "title": "Work Item Stage",
  "levels": [
    { "title": "Draft", "color": "lightGray" },
    { "title": "Plan", "color": "bronze" },
    { "title": "Develop", "color": "silver" },
    { "title": "Deploy", "color": "gold" },
    { "title": "Completed", "color": "green" }
  ]
}
```

<h3>Rules by stage</h3>

<Tabs groupId="scorecard-rules" queryString>

<TabItem value="draft-plan" label="Draft → Plan">

- Has owner (relation not empty).
- Has priority (property not empty).
- Has AI augmentation level (property not empty).

</TabItem>

<TabItem value="plan-develop" label="Plan → Develop">

- All Plan requirements met.
- Plan approved (`plan_approved` = true).
- Has PR (relation not empty).

</TabItem>

<TabItem value="develop-deploy" label="Develop → Deploy">

- All Develop requirements met.
- PR merged (`pr_status` = "merged").

</TabItem>

<TabItem value="deploy-completed" label="Deploy → Completed">

- All Deploy requirements met.
- Deployment successful (`deployment_status` = "Success").
- Deployed to production (`deployment_environment` = "Production").

</TabItem>

</Tabs>



## Self-service actions

Self-service actions (SSAs) enable stage transitions and AI agent triggers. Each action operates at a specific stage.

<Tabs groupId="self-service-actions" queryString>

<TabItem value="triage" label="Triage work item">

**Stage:** Draft → Plan

Updates the work item with triage decisions:

- Assigns owner and team.
- Sets priority and work type.
- Defines AI augmentation level.
- Records `triaged_at` timestamp.

</TabItem>

<TabItem value="approve-plan" label="Approve plan">

**Stage:** Plan → Develop

Human approval gate for the technical plan:

- Sets `plan_approved` to true.
- Optionally captures reviewer comments.

:::tip Human-in-the-loop
This action ensures a human reviews the AI-generated plan before development begins. It's a governance checkpoint.
:::

</TabItem>

<TabItem value="trigger-coding-agent" label="Trigger coding agent">

**Stage:** Develop

Initiates an AI coding session:

- Creates a `codingAgentRun` entity.
- Links to the selected coding agent (Claude Code, Devin, etc.).
- Passes the prompt/instructions.
- Automation links the run back to the work item.

</TabItem>

<TabItem value="promote" label="Promote to environment">

**Stage:** Deploy

Creates a deployment record:

- Specifies target environment (Staging, Production).
- Captures release notes.
- Sets deployment strategy.
- Automation links the deployment back to the work item.

</TabItem>

</Tabs>


## Make it your own

Port's demo uses a five-stage workflow optimized for autonomous development. Adapt it to fit your process.

<h4>Stage names</h4>

Rename stages to match your terminology—"Plan" becomes "Refinement," "Develop" becomes "In Progress," "Deploy" becomes "Release."

<h4>Progression rules</h4>

Change what gates each transition. Require code review approval before Deploy. Add a "Testing" stage between Develop and Deploy. Remove Plan approval for low-priority items.

<h4>Relations</h4>

Connect to entities relevant to your workflow—design documents, testing environments, feature flags.

<h4>AI levels</h4>

Define what each level means for your team:

- **Human:** No AI involvement.
- **AI-assisted:** AI suggests, human implements.
- **AI-led:** AI implements, human reviews.
- **Autonomous:** AI implements and deploys with monitoring.



## Conclusion

The workflow blueprint pattern separates execution state from origin entities:

- **Jira stays clean.** Requirements live in Jira. Workflow state lives in Port.
- **Relations enable context.** Work items connect to services, repos, PRs, and deployments.
- **Scorecards drive progression.** Rules enforce prerequisites without external system changes.
- **AI agents integrate cleanly.** Each stage has specific AI responsibilities with focused context.
- **Teams can customize.** Stages, rules, and SSAs adapt to your development process.

This pattern forms the foundation for agentic workflows. With the workflow blueprint in place, you can add AI-powered self-service actions that automate triage, coding, review, and deploy.



## Next steps

- Explore the [Autonomous Ticket Resolution demo](https://demo.getport.io/my_work_items) to see this pattern in action.


