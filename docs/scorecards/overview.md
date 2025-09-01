---
sidebar_position: 1
title: Overview
sidebar_label: Overview
---

# Scorecards

## What is a Scorecard?

**Scorecards** are used to define and track metrics and standards for Port entities, based on their properties.
Each scorecard consists of a set of rules, where each rule defines one or more conditions that need to be met.

Each rule has a `level` property whose value can be defined per to the way you define standards in your organization,
for example:

- Service maturity can be defined as `Basic`, `Bronze`, `Silver`, `Gold`.
- Security standards can be defined as `Low`, `Medium`, `High`, `Critical`.
- Production readiness can be defined as traffic light colors `Red`, `Orange`, `Yellow`, `Green`.
- Engineering quality can be defined as `Poor`, `Fair`, `Good`, `Excellent`.
- Service response time can be defined as `A`, `B`, `C`, `D`, `F`.

## Scorecard use cases

Scorecards can be used to evaluate the maturity, production readiness and engineering quality of any entity in your software catalog, for example:

- Does a service have an on-call defined?
- Does a README.md file exist in the repository?
- Is Grafana defined for the K8s cluster?
- Is the relation of a certain entity empty?

In this [live demo](https://demo.getport.io/serviceEntity?identifier=authentication&activeTab=2) example, you can see the scorecards defined on a service and their evaluation. 🎬

## Next steps

Now that we know what scorecards are and what are their use cases, let's dive into some [concepts and the scorecard's structure](/scorecards/concepts-and-structure).