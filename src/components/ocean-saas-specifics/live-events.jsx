import Markdown from "@theme/Markdown";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

const defaultLiveEvents = {
  unsupported:
    `Currently, live events are not supported for this integration. \
    \nResyncs will be performed **periodically** (with a configurable interval), or **manually** triggered by you via Port's UI. \
    \n\nTherefore, real-time events (including GitOps) will not be ingested into Port immediately. \
    \nLive events support for this integration is WIP and will be supported in the near future.`,
  supported:
    'This integration supports live events, allowing real-time updates to your software catalog without waiting for the next scheduled sync.',
};

export const liveEvents = {
  Jira:
    '**Issue:** \
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
    \n- user_deleted',
  Jira_OAuth:
    '**Issue:** \
    \n- jira:issue_created \
    \n- jira:issue_updated \
    \n- jira:issue_deleted',
  Snyk:
   '\n- Project related events \
    \n- Target related events',
  BitbucketCloud:
    '**Repository:** \
    \n- repository:created \
    \n- repository:updated \
    \n- repository:deleted \
    \n\n**Pull Request:** \
    \n- pullrequest:created \
    \n- pullrequest:updated \
    \n- pullrequest:approved \
    \n- pullrequest:unapproved \
    \n- pullrequest:fulfilled \
    \n- pullrequest:rejected',
  PagerDuty:
    '**Service:** \
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
    \n- incident.unacknowledged',
  PagerDuty_OAuth:
    '**Service:** \
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
    \n- incident.unacknowledged',
};

export const OceanSaasLiveEventsTriggersOAuth = ({ id, isOAuth = false }) => {
  return (
    <Markdown>
    {liveEvents[id + "_OAuth"]}
    </Markdown>
  );
};

export const OceanSaasLiveEventsTriggersManual = ({ id, isOAuth = false }) => {
  return (
    <Markdown>
    {liveEvents[id]}
    </Markdown>
  );
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
