---
sidebar_position: 2
sidebar_label: Open/close JIRA issues
---

# Open/close JIRA issues

The [Port message sender](https://github.com/marketplace/actions/port-sender) allows you to automatically create Jira issues for entities with violated scorecard rules, and close them once the violations are fixed.

## Syncing Jira issues

For every scorecard level that is not completed, a Jira task will be created, along with subtasks for the level rules.

Head to the Port sender [Jira section](https://github.com/marketplace/actions/port-sender#manage-scorecards-with-jira-issues) to learn more about the integration and how to use it.

### Created task example

![Create and updateJira Tasks for uncompleted scorecards levels](/img/scorecards/jira/jira-sync-task.png)

<br/>

### Created subtasks example

![Create and update Subtasks for each tasks for uncompleted scorecards rules](/img/scorecards/jira/jira-sync-subtask.png)
