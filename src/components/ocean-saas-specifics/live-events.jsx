import Markdown from "@theme/Markdown";

const defaultLiveEvents = {
  unsupported:
    'Currently, live events are not supported for integrations hosted by Port.<br/> \
    Resyncs will be performed **periodically** (with a configurable interval), or **manually** triggered by you via Port\'s UI.<br/> \
    <br/>\
    Therefore, real-time events (including GitOps) will not be ingested into Port immediately.<br/>\
    Live events support for this integration is WIP and will be supported in the near future.',
    supported: 'By enabling live events, you will receive real-time updates in Port without waiting for the next scheduled sync.',
};

const liveEvents = {
  Jira: '**Supported event triggers for user-token based installations:** \
    \n- created (jira:issue_created) \
    \n- updated (jira:issue_updated) \
    \n- deleted (jira:issue_deleted) \
    \n- created (project_created) \
    \n- updated (project_updated) \
    \n- deleted (project_deleted) \
    \n- created (user_created) \
    \n- updated (user_updated) \
    \n- deleted (user_deleted) \
    \n\n**Supported event triggers for OAuth based installations:** \
    \n- created (jira:issue_created) \
    \n- updated (jira:issue_updated) \
    \n- deleted (jira:issue_deleted)',
  Snyk: '**Supported event triggers:** \
    \n- Project related events \
    \n- Target related events',
  PagerDuty: '**Supported event triggers:** \
    \n- service.deleted \
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

const OceanSaasLiveEvents = ({ id }) => {

  return (
    <Markdown>
      {liveEvents[id] 
        ? `${defaultLiveEvents["supported"]}\n\n${liveEvents[id]}`
        : defaultLiveEvents["unsupported"]
      }
    </Markdown>
  );
};

export default OceanSaasLiveEvents;