import React from 'react';
import Markdown from "@theme/Markdown";

const notices = {
  aiAgents:
    ':::info Closed Beta Feature\n' +
    'This feature is currently in closed beta with limited availability. Access is provided on an application basis.\n\n' +
    'To request access, please reach out to us by filling [this form](https://forms.gle/BygmbCWcf1Vy4KPW9).\n' +
    ':::',
  default:
    ':::info Closed Beta Feature\n' +
    'This feature is currently in closed beta with limited availability. Access is provided on an application basis.\n' +
    ':::'
};

const ClosedBetaFeatureNotice = ({ id }) => {
  return (
    <Markdown>
      {notices[id] || notices.default}
    </Markdown>
  );
};

export default ClosedBetaFeatureNotice; 