---
sidebar_position: 6
title: Permissions and access control
sidebar_label: "Permissions"
---

# Permissions and access control

## Run visibility

Run visibility is controlled by the workflow's `allowAnyoneToViewRuns` field and the run creator.

In the workflow-service, a user is allowed to view a workflow run if at least one of the following is true:

- The requester is a machine actor.
- The requester is the user who created the run.
- `allowAnyoneToViewRuns` is set to `true`.
- The requester is an **Admin** in Port.

:::tip Make runs visible for debugging
If you want more users to be able to help debug runs, set `allowAnyoneToViewRuns` to `true` in the workflow definition.
:::


