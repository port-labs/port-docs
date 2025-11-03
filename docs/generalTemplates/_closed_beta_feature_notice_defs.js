import Markdown from "@theme/Markdown";

const actions = {
    'slack-app':
      'We are not accepting new applications at the moment and will update once it moves to open beta.'
  };

const ClosedBetaFeatureNotice = ({ id }) => {

return (
    <Markdown>
    {actions[id]}
    </Markdown>
);
};

export default ClosedBetaFeatureNotice;
