import React from 'react';
import Admonition from '@theme/Admonition';

const notices = {
  aiAgents: {
    content: <>
      This feature is currently in closed beta with limited availability. Access is provided on an application basis.
      <br/><br/>
      To request access, please reach out to us by filling <a href="https://forms.gle/BygmbCWcf1Vy4KPW9">this form</a>.
    </>
  },
  default: {
    content: <>
      This feature is currently in closed beta with limited availability. Access is provided on an application basis.
    </>
  }
};

const ClosedBetaFeatureNotice = ({ id }) => {
  const notice = notices[id] || notices.default;
  
  return (
    <Admonition type="info" title="Closed Beta Feature">
      {notice.content}
    </Admonition>
  );
};

export default ClosedBetaFeatureNotice; 