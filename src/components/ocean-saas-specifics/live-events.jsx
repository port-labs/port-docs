import Markdown from "@theme/Markdown";

const defaultLiveEvents = {
  unsupported: `Currently, live events are not supported for this integration. \
    \nResyncs will be performed **periodically** (with a configurable interval), or **manually** triggered by you via Port's UI. \
    \n\nTherefore, real-time events (including GitOps) will not be ingested into Port immediately. \
    \nLive events support for this integration is WIP and will be supported in the near future.`,
  supported:
    "This integration supports live events, allowing real-time updates to your software catalog without waiting for the next scheduled sync.",
};

export const liveEvents = {
  Jira: "**Issue:** \
    \n- jira:issue_created \
    \n- jira:issue_updated \
    \n- jira:issue_deleted \
    \n\n**Project:** \
    \n- project_created \
    \n- project_updated \
    \n- project_deleted \
    \n\n**User:** \
    \n- user_created \
    \n- user_updated \
    \n- user_deleted",
  Jira_OAuth:
    "**Issue:** \
    \n- jira:issue_created \
    \n- jira:issue_updated \
    \n- jira:issue_deleted",
  Snyk: "\n- Project related events \
    \n- Target related events",
  BitbucketCloud:
    "**Repository:** \
    \n- repository:created \
    \n- repository:updated \
    \n- repository:push \
    \n\n**Pull Request:** \
    \n- pullrequest:created \
    \n- pullrequest:updated \
    \n- pullrequest:approved \
    \n- pullrequest:unapproved \
    \n- pullrequest:fulfilled \
    \n- pullrequest:rejected",
  PagerDuty:
    "**Service:** \
    \n- service.created \
    \n- service.deleted \
    \n- service.updated \
    \n\n**Incident:** \
    \n- incident.acknowledged \
    \n- incident.annotated \
    \n- incident.delegated \
    \n- incident.escalated \
    \n- incident.priority_updated \
    \n- incident.reassigned \
    \n- incident.reopened \
    \n- incident.resolved \
    \n- incident.status_update_published \
    \n- incident.responder.added \
    \n- incident.responder.replied \
    \n- incident.triggered \
    \n- incident.unacknowledged",
  PagerDuty_OAuth:
    "**Service:** \
    \n- service.created \
    \n- service.deleted \
    \n- service.updated \
    \n\n**Incident:** \
    \n- incident.acknowledged \
    \n- incident.annotated \
    \n- incident.delegated \
    \n- incident.escalated \
    \n- incident.priority_updated \
    \n- incident.reassigned \
    \n- incident.reopened \
    \n- incident.resolved \
    \n- incident.status_update_published \
    \n- incident.responder.added \
    \n- incident.responder.replied \
    \n- incident.triggered \
    \n- incident.unacknowledged",
  SonarQube:
    "\n- Analysis completion events \
     \n- Quality gate status change events",
  Datadog:
    "**Monitoring Alerts:** \
    \n- ci_pipelines_alert \
    \n- ci_tests_alert \
    \n- composite_monitor \
    \n- error_tracking_alert \
    \n- event_alert \
    \n- event_v2_alert \
    \n- log_alert \
    \n- monitor_slo_alert \
    \n- metric_slo_alert \
    \n- outlier_monitor \
    \n- process_alert \
    \n- query_alert_monitor \
    \n- rum_alert \
    \n- service_check \
    \n- synthetics_alert \
    \n- trace_analytics_alert",
  Datadog_OAuth:
    "**Monitoring Alerts:** \
    \n- ci_pipelines_alert \
    \n- ci_tests_alert \
    \n- composite_monitor \
    \n- error_tracking_alert \
    \n- event_alert \
    \n- event_v2_alert \
    \n- log_alert \
    \n- monitor_slo_alert \
    \n- metric_slo_alert \
    \n- outlier_monitor \
    \n- process_alert \
    \n- query_alert_monitor \
    \n- rum_alert \
    \n- service_check \
    \n- synthetics_alert \
    \n- trace_analytics_alert",
  GitLab_v2:
    "**Groups:** \
    \n- group_create \
    \n- group_destroy \
    \n- subgroup_create \
    \n- subgroup_destroy \
    \n\n**Projects:** \
    \n- push \
    \n\n**Issues:** \
    \n- issue \
    \n\n**Merge Requests:** \
    \n- merge_request \
    \n\n**Files and Folders:** \
    \n- push \
    \n\n**Members:** \
    \n- user_remove_from_group \
    \n- user_update_for_group \
    \n- user_add_to_group \
    \n\n**Jobs:** \
    \n- build \
    \n\n**Pipelines:** \
    \n- pipeline ",
  Linear:
    "\n- Issue \
    \n- IssueLabel",
  LaunchDarkly:
    "\n- flag \
    \n- environment \
    \n- project \
    \n- auditlog",
  Octopus:
    "\n- spaces \
    \n- projects \
    \n- deployments \
    \n- releases \
    \n- machines",
  NewRelic:
    "**Issues:** \
    \n- issue_created \
    \n- issue_updated \
    \n- issue_closed",
  AzureDevOps:
    "**Code Events:** \
    \n- git.pullrequest.created \
    \n- git.pullrequest.updated \
    \n- git.push",
  BitbucketServer:
    "**Pull Request:** \
    \n- pr:modified \
    \n- pr:opened \
    \n- pr:merged \
    \n- pr:reviewer:updated \
    \n- pr:declined \
    \n- pr:deleted \
    \n- pr:comment:deleted \
    \n- pr:from_ref_updated \
    \n- pr:comment:edited \
    \n- pr:reviewer:unapproved \
    \n- pr:reviewer:needs_work \
    \n- pr:reviewer:approved \
    \n- pr:comment:added \
    \n\n**Repository:** \
    \n- repo:modified \
    \n- repo:refs_changed \
    \n\n**Project:** \
    \n- project:modified",
  Aikido: 
    '**Issues:** \
    \n- issue.open.created \
    \n- issue.snoozed \
    \n- issue.ignored.manual \
    \n- issue.closed',
  GithubOcean:
    " **Repository:** \
    \n - created \
    \n - edited \
    \n - renamed \
    \n - transferred \
    \n - unarchived \
    \n - publicized \
    \n - privatized \
    \n - archived \
    \n - deleted \
    \n\n **pull_request:** \
    \n - opened \
    \n - edited \
    \n - ready_for_review \
    \n - reopened \
    \n - synchronize \
    \n - unassigned \
    \n - review_request_removed \
    \n - closed \
    \n\n **push** \
    \n\n **workflow_run:** \
    \n - in_progress \
    \n - requested \
    \n - completed \
    \n\n **dependabot_alert** \
    \n - created \
    \n - reopened \
    \n - auto_reopened \
    \n - reintroduced \
    \n - dismissed \
    \n - auto_dismissed \
    \n - fixed \
    \n\n **code_scanning_alert** \
    \n - appeared_in_branch \
    \n - reopened \
    \n - created \
    \n - fixed \
    \n - closed_by_user ",
};

export const OceanSaasLiveEventsTriggersOAuth = ({ id, isOAuth = false }) => {
  return <Markdown>{liveEvents[id + "_OAuth"]}</Markdown>;
};

export const OceanSaasLiveEventsTriggersManual = ({ id, isOAuth = false }) => {
  return <Markdown>{liveEvents[id]}</Markdown>;
};

export const OceanSaasLiveEventsDescription = ({ id }) => {
  return (
    <Markdown>
      {liveEvents[id]
        ? defaultLiveEvents["supported"]
        : defaultLiveEvents["unsupported"]}
    </Markdown>
  );
};
