---
title: Security champions & initiatives
sidebar_position: 4
---

# Security champions & initiatives

:::tip Scale security culture
**Port empowers organizations to scale security culture by making secure development measurable, actionable, and rewarding.**
:::

:::tip Turn security into shared responsibility
**Port helps you turn security from a siloed function into a shared, measurable responsibility across your entire organization.**
:::

## Introduction

The most successful security programs are **not built by security teams alone**—they are built by empowering every developer to take part in protecting the business.  

Traditional approaches rely on:
- Mandatory training sessions,
- Security checklists,
- Penalty-driven compliance.

These often create friction between security and engineering teams and fail to build sustainable engagement.

The reality: most developers **want** to build secure software but are overwhelmed by:
- Conflicting security requirements,
- Unclear guidance,
- Tools that slow them down.

The solution is to **make security the easy and rewarding choice** through:
- Clear standards and expectations,
- Automated guardrails,
- Recognition and motivation for security-positive behaviors.

Port provides the foundation to scale these efforts by connecting **people, processes, and technology** in one platform.

## Why many security champion programs fail

Most security champion programs start with enthusiasm but fizzle out due to poor execution.

| Common Failure | Impact on the Program |
|----------------|-----------------------|
| **Unclear expectations** | Champions are unsure of their role beyond vague directives like "promote security." |
| **No measurable outcomes** | Progress is tracked by activity (training hours) rather than meaningful results (vulnerabilities reduced). |
| **Tool friction** | Security tools create extra work without providing developers clear value or context. |
| **Recognition gaps** | Champions take on extra responsibilities without career incentives or visibility. |
| **Unsustainable model** | Programs rely on a few motivated individuals who eventually burn out. |

## Port's approach: measurable, sustainable, scalable

Port turns security champions programs from volunteer-driven efforts into **systematic, measurable cultural transformation initiatives**.

It does this through three pillars:
1. **Scorecards** – to set clear standards and expectations.
2. **Initiatives** – to create momentum and shared goals.
3. **Guardrails & Automation** – to make secure development frictionless.

## 1. Scorecards: defining security success

Scorecards in Port translate abstract security principles into **concrete, trackable practices** for teams and services.  
Each scorecard contains criteria that teams can directly influence.

### Application security scorecard
Track practices that prevent vulnerabilities from reaching production:
- **Dependency management** – Vulnerable dependencies are updated promptly.
- **Secure coding practices** – Security linters and SAST integrated into CI/CD.
- **Access controls** – Proper authentication and authorization in place.
- **Data protection** – Sensitive data handled according to policy.
- **Security testing** – Security tests included in CI/CD pipelines.

![Application Security](/img/guides/security-solution/owasp-scorecard.png)

### Infrastructure security scorecard
Ensure infrastructure is deployed and maintained securely:
- **Network security** – Proper segmentation and firewall rules.
- **IAM hygiene** – Enforcing least-privilege principles.
- **Encryption standards** – Data encryption at rest and in transit.
- **Configuration management** – Systems hardened consistently.
- **Logging & monitoring** – Security events captured and monitored.

### Operational security scorecard
Measure preparedness and response capabilities:
- **Incident response readiness** – Runbooks updated and teams trained.
- **Vulnerability management** – Vulnerabilities triaged and remediated within SLA.
- **Access reviews** – Regular audits of permissions and roles.
- **Backup and recovery** – Recovery processes tested regularly.
- **Compliance tracking** – Audit trails maintained and up-to-date.

:::tip
**Start small and iterate:**  
Focus scorecards on practices that teams directly control to ensure quick wins and early adoption.
:::

## 2. Initiatives: driving momentum and engagement

Scorecards define **what good looks like**.  
**Initiatives** provide the **why and when**, turning goals into campaigns that drive real change.

### Progressive improvement campaigns
Rather than demanding 100% compliance immediately, focus on specific, achievable improvements.

Examples:
- **Zero critical vulnerabilities** – Eliminate critical vulnerabilities in production systems.
- **Secrets management adoption** – Drive adoption of secure secrets storage practices.
- **Branch protection compliance** – Ensure all production repos enforce branch protection rules.

These campaigns can be **tracked in Port** through:
- Dashboards that visualize campaign progress,
- Automated alerts when thresholds are reached,
- Scorecard metrics tied to completion targets.

### Recognition and gamification
Security is a team sport.  
Recognizing and rewarding improvements encourages ongoing participation.

Examples:
- **Leaderboards** – Rank teams by their improvement scores.
- **Achievement badges** – Reward milestones like "90% scorecard compliance."
- **Improvement showcases** – Share success stories at company all-hands.
- **Cross-team learning sessions** – High-performing teams teach others.

## 3. Guardrails and automation: secure by default

Secure practices must be **built into the development workflow** so teams don’t rely solely on manual checks.

### Automated policy enforcement
Use Port automations to **enforce policies automatically**, reducing human error:
- Auto-enable **branch protection rules** on new repos ([Setup branch protection rules](/guides/all/setup-branch-protection-rules/)).
- Block deployments with **critical vulnerabilities** detected by scanners like Trivy or Wiz.
- Prevent commits with **hardcoded secrets**.
- Require **security scan gates** to pass before production deployments.

### Self-service security actions
Make security tools and processes easily accessible through **self-service actions**:
- Trigger security scans on-demand.
- Submit vulnerability exception requests.
- Request consultations with security teams.
- Check compliance status before releases.

By making security **self-service and embedded**, teams fix issues faster without waiting on central security bottlenecks.

## Putting security champions into practice

### Step 1: identify and empower champions
- **Selection** – Choose respected developers with influence and interest in security.
- **Time allocation** – Dedicate 10–20% of their role to security initiatives.
- **Training** – Provide certifications and ongoing education.
- **Career growth** – Recognize champion contributions in performance reviews and promotions.

### Step 2: define clear expectations
Champions should have **specific, measurable responsibilities**:
- Review code for security issues.
- Lead team-level security training.
- Drive scorecard improvements.
- Report vulnerabilities and guide remediation.

Success is tracked through:
- Team scorecard performance,
- Remediation timelines,
- Training engagement rates.

### Step 3: implement scorecards
Start small with key security practices:
- [Track GitLab project maturity](/guides/all/track-gitlab-project-maturity-with-scorecards/).
- Add service-level scorecards for application, infrastructure, and operational practices.
- Gradually expand to advanced metrics like incident response and compliance readiness.

### Step 4: establish continuous improvement
Create a cycle of **review, plan, and improve**:
- **Monthly reviews** – Assess scorecard performance.
- **Quarterly planning** – Launch new improvement campaigns.
- **Retrospectives** – Analyze incidents to identify systemic fixes.
- **Cross-team forums** – Share practices and lessons learned.

:::caution
**Balance automation and human judgment:**  
Automation accelerates security, but always provide clear escalation paths for exceptions and edge cases.
:::

## Measuring cultural change

Track cultural indicators to understand program health:

| Metric | What It Shows |
|--------|---------------|
| **Proactive issue reporting** | Teams are finding and reporting issues before external discovery. |
| **Training engagement** | Developers are participating actively in security education. |
| **Cross-team collaboration** | Security knowledge is being shared across teams. |
| **Tool adoption** | Teams are adopting security tools voluntarily, not just out of compliance. |

## Success metrics for security champion programs

You’ll know the program is working when:
- Champions are seen as **trusted technical leaders** by their peers.
- Teams **compete to improve scorecard scores** instead of seeing compliance as a burden.
- Security improvements happen **organically**, not only through mandates.
- Security incidents are treated as **learning opportunities**, not blame games.
- New developers are mentored on security by their teams, **not just the central security group**.

## Outcomes with Port

Organizations using Port to power their champions program have achieved:
- **Fewer vulnerabilities reaching production** thanks to proactive team ownership.
- **Faster remediation times** due to automated triage and self-service fixes.
- **Reduced deployment delays** by integrating security earlier in workflows.
- **Improved training completion** driven by peer-to-peer champion-led programs.


Security champions bridge the gap between **security strategy** and **engineering execution**.  
With Port, you can:
- Define clear expectations through scorecards,
- Drive progress with initiatives and campaigns,
- Automate guardrails to make security seamless,
- Measure cultural change with actionable metrics.


