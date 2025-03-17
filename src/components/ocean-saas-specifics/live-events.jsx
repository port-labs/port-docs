import Markdown from "@theme/Markdown";

const defaultLiveEvents = {
  unsupported:
    `Currently, live events are not supported for integrations hosted by Port.<br/> \
    Resyncs will be performed **periodically** (with a configurable interval), or **manually** triggered by you via Port's UI.<br/> \
    <br/> \ 
    Therefore, real-time events (including GitOps) will not be ingested into Port immediately.<br/>\
    Live events support for this integration is WIP and will be supported in the near future.`,
  supported:
    'This integration supports live events, allowing real-time updates to your software catalog without waiting for the next scheduled sync.',
};

const liveEvents = {
  Jira: '**Supported event triggers for user-token based installations:** \
    \n- Issue: \
    \n\t- jira:issue_created \
    \n\t- jira:issue_updated \
    \n\t- jira:issue_deleted \
    \n- Project: \
    \n\t- project_created \
    \n\t- project_updated \
    \n\t- project_deleted \
    \n- User: \
    \n\t- user_created \
    \n\t- user_updated \
    \n\t- user_deleted',
  Jira_OAuth:
    '\n\n**Supported event triggers for OAuth based installations:** \
    \n- Issue: \
    \n\t- jira:issue_created \
    \n\t- jira:issue_updated \
    \n\t- jira:issue_deleted',
  Snyk: '**Supported event triggers:** \
    \n- Project related events \
    \n- Target related events',
  PagerDuty:
    '**Supported event triggers:** \
    \n- Service: \
    \n\t- service.created \
    \n\t- service.deleted \
    \n\t- service.updated \
    \n- Incident: \
    \n\t- incident.acknowledged \
    \n\t- incident.annotated \
    \n\t- incident.delegated \
    \n\t- incident.escalated \
    \n\t- incident.priority_updated \
    \n\t- incident.reassigned \
    \n\t- incident.reopened \
    \n\t- incident.resolved \
    \n\t- incident.status_update_published \
    \n\t- incident.responder.added \
    \n\t- incident.responder.replied \
    \n\t- incident.triggered \
    \n\t- incident.unacknowledged',
  PagerDuty_OAuth:
    '**Supported event triggers:** \
    \n- Service: \
    \n\t- service.created \
    \n\t- service.deleted \
    \n\t- service.updated \
    \n- Incident: \
    \n\t- incident.acknowledged \
    \n\t- incident.annotated \
    \n\t- incident.delegated \
    \n\t- incident.escalated \
    \n\t- incident.priority_updated \
    \n\t- incident.reassigned \
    \n\t- incident.reopened \
    \n\t- incident.resolved \
    \n\t- incident.status_update_published \
    \n\t- incident.responder.added \
    \n\t- incident.responder.replied \
    \n\t- incident.triggered \
    \n\t- incident.unacknowledged',
};

export const OceanSaasLiveEventsTriggers = ({ id, isOAuth = false }) => {
  return (
    <Markdown>
      {liveEvents[id]
        ? isOAuth
          ? `\n\n<details><summary><b>Supported live event triggers</b></summary>\n\n${liveEvents[id + "_OAuth"]}\n\n</details><br></br>`
          : `\n\n<details><summary><b>Supported live event triggers</b></summary>\n\n${liveEvents[id]}\n\n</details><br></br>`
        : ""}
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
