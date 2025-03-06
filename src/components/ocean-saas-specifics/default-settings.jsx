import Markdown from "@theme/Markdown";

const defaultSettings = {
    Jira:
      '- `Resync interval`: Every 2 hours.' + '\n\n' +
      '- `Send raw data examples`: Enabled.',
    GitLab:
      '- `Resync interval`: Every 2 hours.' + '\n\n' +
      '- `Send raw data examples`: Enabled.',
    PagerDuty:
      '- `Resync interval`: Every 1 hour.' + '\n\n' +
      '- `Send raw data examples`: Enabled.',
    Datadog:
      '- `Resync interval`: Every 1 hour.' + '\n\n' +
      '- `Send raw data examples`: Enabled.',
  };

  const OceanSaasDefaultSettings = ({ id }) => {
  
    return (
      <Markdown>
        {defaultSettings[id]}
      </Markdown>
    );
  };
  
  export default OceanSaasDefaultSettings;