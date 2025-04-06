import Markdown from "@theme/Markdown";

const defaultLimitations = {
  ttl:
    '- The maximum time for a full sync to run is based on the configured resync interval. For very large amounts of data where a resync operation is expected to take longer, please use a longer interval.',
};

const limitations = {
  Snyk:
    defaultLimitations.ttl + '\n' +
    '- Due to Snyk\'s v1 + REST API [limitations](https://docs.snyk.io/snyk-api/api-endpoints-index-and-tips/issue-ids-in-snyk-apis), only project and target related events are supported.' + '\n' +
    '- No deletion events are supported in Snyk.',
  Jira:
    defaultLimitations.ttl + '\n' +
    '- For OAuth based installations:'+ '\n' +
    '    - Due to restrictions on the [Jira OAuth Dynamic Webhooks API](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-webhooks/#api-group-webhooks), Only issue related live events are supported.' + '\n' +
    '    - Due to restrictions on the [Jira OAuth2 App](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-webhooks/#api-rest-api-2-webhook-post), Only a single OAuth Jira installation will recieve live events.' + '\n',
  Gitlab:
    defaultLimitations.ttl + '\n' +
    '- For OAuth based installations:' + '\n' +
    '    - Resync times are limited to 1 hour.' + '\n'
}

const OceanSaasLimitations = ({ id }) => {

  return (
    <Markdown>
      {limitations[id] || defaultLimitations["ttl"]}
    </Markdown>
  );
};

export default OceanSaasLimitations;