---
title: Compliance-as-Code
sidebar_position: 5
---

# Compliance-as-Code

> **Port transforms compliance from a manual, reactive burden into an automated, continuous, and measurable practice.**

---

## Introduction

Compliance is critical, but most organizations still rely on outdated, manual methods:
- **Spreadsheets** to track controls and audit status,
- **Email threads** to gather evidence,
- **Periodic checklists** disconnected from production systems.

This creates **painful audits**, stale evidence, and gaps between what's documented and what's actually happening in production.  
By the time auditors arrive, teams scramble to collect last-minute proof of compliance.

**Compliance-as-Code** changes this by embedding compliance directly into your engineering workflows.  
With Port, compliance becomes:

- **Continuous** – Evidence updates automatically as systems change.  
- **Automated** – Manual tasks are replaced with integrations and workflows.  
- **Contextual** – Controls map directly to services, teams, and owners.  
- **Actionable** – Non-compliance triggers immediate alerts and remediation.  

The result: always audit-ready, with **reduced costs, faster certification cycles, and lower regulatory risk**.

---

## Why Traditional Compliance Fails

| Challenge | Legacy Approach | Impact |
|------------|----------------|--------|
| **Stale evidence** | Evidence gathered manually at audit time | Last-minute scrambles, audit failures |
| **No system integration** | Compliance tracked outside production systems | Hidden gaps between paper controls and reality |
| **Siloed data** | Spreadsheets scattered across teams | No single source of truth |
| **Reactive discovery** | Gaps found only during audits | Costly, high-risk surprises |
| **High overhead** | Weeks spent preparing evidence manually | Slower product delivery, higher costs |

> **Problem:** Compliance is treated as a static checkbox exercise instead of a living, continuous practice.

---

## Port’s Approach: Compliance Built Into Your Platform

Port makes compliance **part of your internal developer platform**, using the same building blocks that manage services, security, and ownership.  
This aligns compliance work with how engineering teams already operate.

| Port Pillar | Role in Compliance-as-Code |
|-------------|---------------------------|
| **Blueprints** | Model compliance entities: services, controls, audits, and evidence. |
| **Scorecards** | Measure compliance maturity and track control performance in real-time. |
| **Automations** | Trigger actions when controls fail or gaps are found. |
| **Integrations** | Ingest data from cloud, code, and security tools for continuous updates. |
| **Dashboards** | Visualize compliance status for executives, auditors, and teams. |

> **Key idea:** Compliance isn’t a separate process—it lives alongside service ownership, vulnerabilities, and risk in the same Port platform.

---

## Step 1: Map Compliance to Real Systems

The foundation of Compliance-as-Code is **mapping controls to the actual services and teams they affect**.

With Port:
- Use **Blueprints** to define core compliance entities:
  - *Service* – applications, APIs, infrastructure components.
  - *Control* – specific compliance requirement (e.g., encryption at rest, branch protection).
  - *Audit Evidence* – proof items such as logs, screenshots, or test reports.
- Link services to their controls using **relations**.
- Tag services with key metadata:
  - Regulatory scope (SOC 2, PCI, HIPAA, GDPR),
  - Data sensitivity (PII, payment data, internal-only),
  - Criticality (customer-facing, revenue-generating, internal).

This creates a **single source of truth** for compliance across the organization.

**Example:**
- A PCI DSS encryption control is linked to all services that store cardholder data.
- Ownership is automatically assigned to the teams managing those services.
- Dashboards show which services are compliant and which require attention.

---

## Step 2: Automate Evidence Collection

Collecting compliance evidence manually wastes time and creates stale, unreliable data.  
Port integrates with your systems to **automate evidence ingestion**.

Examples:
- **Cloud services**  
  - [Track AWS storage compliance](/guides/all/visualize-your-aws-storage-configuration/) to ensure encryption and access policies are enforced.
- **Identity and access management**  
  - [Visualize GitHub IAM settings](/guides/all/visualize-your-github-identity-and-access-management/).
- **Vulnerability scanners**  
  - [Ingest Wiz findings](/guides/all/visualize-your-wiz-vulnerabilities/) directly into Port, linked to relevant services.

You can also use the **Port REST API** to ingest custom evidence from other sources:
- Endpoint: `/v1/entities` for evidence records.
- Attach metadata like timestamps, service IDs, and compliance control IDs.

Result: evidence updates **continuously** as your environment evolves.

---

## Step 3: Define Compliance Scorecards

Scorecards turn abstract frameworks into **measurable, trackable outcomes**.

### Example: SOC 2 Control Scorecard
| Control Area | Example Check | Source |
|--------------|---------------|--------|
| Access Control | All production systems enforce MFA | AWS IAM integration |
| Change Management | PRs require branch protection and code reviews | GitHub integration |
| Data Encryption | S3 buckets have encryption enabled | AWS Config integration |
| Incident Response | Runbooks updated and tested quarterly | Manual evidence uploads |
| Logging & Monitoring | Centralized logging enabled for services | Cloud logging integrations |

Each control:
- Is a **scorecard item** with pass/fail logic,
- Is linked to services and teams,
- Updates automatically when integrated systems change.

Dashboards then show:
- Compliance by control area,
- Overall readiness by service or business unit,
- Historical progress over time.

---

## Step 4: Automate Compliance Workflows

Compliance data is most valuable when **it drives action**.  
Use Port **automations** to close the loop.

Examples:
- Create Jira tickets when a control fails.
- Send Slack alerts for critical compliance gaps.
- Escalate overdue controls to leadership after SLA deadlines pass.
- Trigger remediation pipelines automatically for specific failures.

This ensures compliance issues don’t just get logged—they get **fixed**.

---

## Step 5: Enable Continuous Audit Readiness

With all compliance data flowing through Port, audits become **continuous and painless**:
- Evidence is **always current** and linked to the right controls.
- Dashboards show live compliance posture at any time.
- Auditors can review artifacts directly in Port or export reports.
- Historical records make it easy to demonstrate progress.

**Outcome:** Audit preparation time drops from **weeks to hours**, freeing teams to focus on innovation rather than
