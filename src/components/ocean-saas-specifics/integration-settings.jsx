import Markdown from "@theme/Markdown";

const integrationSettings = {
    Jira:
      '- `Jira host`: The URL of your Jira account, e.g `https://example.atlassian.net/`.<br/>When installing via OAuth, the url will be in this format: `https://api.atlassian.com/ex/jira/<jira_cloud_id>`.' + '\n\n' +
      '- `Atlassian user email`: The email of the user used to query Jira.' + '\n\n' +
      '- `Atlassian user token`: The API token used to query Jira, can be configured on the [Atlassian account page](https://id.atlassian.com/manage-profile/security/api-tokens).',
    GitLab:
      '- `GitLab host`: The host of the Gitlab instance. If not specified, the default will be `https://gitlab.com`.' + '\n\n' +
      '- `Token mapping`: Mapping of GitLab tokens to the group scopes to ingest data from into port.<br/>For example:<br/>```{"THE_GROUP_TOKEN":["getport-labs/**", "GROUP/PROJECT PATTERN TO RUN FOR"]}```.<br/>To create a group token, see the [GitLab documentation](https://docs.gitlab.com/ee/user/group/settings/group_access_tokens.html#create-a-group-access-token-using-ui).' + '\n\n' +
      '- `Use system hook`: If enabled, the integration will use a system hook instead of project hooks.<br/>For a list of available system hooks, see the [GitLab documentation](https://docs.gitlab.com/ee/administration/system_hooks.html).' + '\n\n' +
      '- `Token Group Hooks Override Mapping`: Mapping of Gitlab tokens to groups in which to create webhooks with specific events, if not set, it will create webhooks containing all the events, and only on root groups.<br/>For example:<br/>```{"THE_GROUP_ADMIN_TOKEN":{"GROUP1_FULL_PATH": {"events": ["merge-requests_events"]}, "GROUP2_FULL_PATH": {"events": ["push_events", "pipeline_events"]}}}.```<br/>Supported event types:<br/>```["push_events", "merge_requests_events", "issues_events", "job_events", "pipeline_events", "releases_events", "tag_push_events", "subgroup_events", "confidential_issues_events"]```',
    PagerDuty:
      '- `Token`: The API token used to query PagerDuty. To create a token, see the [PagerDuty documentation](https://support.pagerduty.com/docs/api-access-keys).' + '\n\n' +
      '- `API URL`: The host of the PagerDuty instance. If not specified, the default will be `https://api.pagerduty.com` (or `https://api.eu.pagerduty.com` for EU customers).',
    Datadog:
      '- `Datadog Base Url`: For example, https://api.datadoghq.com or https://api.datadoghq.eu. To identify your base URL, see the [Datadog documentation](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site).' + '\n\n' +
      '- `Datadog Api Key` - To create an API key, see the [Datadog documentation](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).' + '\n\n' +
      '- `Datadog Application Key` - To create an application key, see the [Datadog documentation](https://docs.datadoghq.com/account_management/api-app-keys/#add-application-keys).' + '\n\n' +
      '- `Datadog Webhook Token` - *Optional*. This token is used to secure webhook communication between Datadog and Port. To learn more, see the [Datadog documentation](https://docs.datadoghq.com/integrations/webhooks/#setup).' + '\n\n' +
      '- `Datadog Access Token` - *Optional*. This is used to authenticate with Datadog using OAuth2. You should not set this value manually.',
  };

  const OceanSaasIntegrationSettings = ({ id }) => {
  
    return (
      <Markdown>
      {integrationSettings[id]}
      </Markdown>
    );
  };
  
  export default OceanSaasIntegrationSettings;