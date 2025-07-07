---
title: Detect & diagnose incidents
sidebar_position: 3
---

# Detect & diagnose incidents

Modern incident management is broken. Too many tools, too many silos, and not enough context. At Port, we believe incident management should be unified, contextual, and automated—so teams can focus on resolution, not wrangling alerts.

<img src="/img/solutions/incident-management/unify_alerts.png" border="1px" width="100%" />

## Why incident management needs to change

Traditional incident management is reactive and fragmented. Alerts come from everywhere, context is missing, and manual processes slow everything down. This leads to longer outages, frustrated teams, and unhappy users.

## The Port approach: unify, enrich, automate

There's a better way:

1. **Unify Alerts**: Bring all your alerts into a single, actionable stream.
2. **Enrich with Context**: Automatically add relevant metadata, ownership, and dependencies to every incident.
3. **Automate Creation**: Trigger incident workflows, notifications, and remediation steps—no manual handoffs.

## How to put this into practice

### Unify alerts

Connect all your monitoring and alerting tools to Port. Our integrations make it easy to centralize alerts from sources like Datadog, PagerDuty, and more.

- [Prometheus](../../build-your-software-catalog/custom-integration/webhook/examples/prometheus)
- [Grafana](../../build-your-software-catalog/custom-integration/webhook/examples/grafana)
- [Datadog Monitors](../../build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/examples)
- [Dynatrace Problems](../../build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace)
- [New Relic Issues](../../build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic)

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/W4kQ8O2w0WA"
  title="Production Readiness Scorecards"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>


### Enrich with context

:::tip Context is everything
Teams that have rich context on incidents resolve them up to 40% faster. Make sure your catalog is up to date!
:::

Every alert in Port is automatically enriched with context of all the related data: who owns the service, what dependencies are involved, and recent changes. This means faster diagnosis and fewer escalations.

[Learn how to build your software catalog](../../getting-started/overview)

## Real-world benefits

- **Fewer False Positives**: Fewer False Positives - meaning incident teams aren't exhausted from alerts "crying wolf".
- **Better Incident Assignment**: The right people are looped in for an incident, based on context, not just a hardcoded automation rule in your APM tooling.
- **Alert Deduplication**: By grouping alerts by other related data (service, team), we can avoid duplicate incidents for our incoming alerts.
