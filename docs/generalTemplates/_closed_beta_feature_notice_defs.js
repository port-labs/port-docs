import Markdown from "@theme/Markdown";

const actions = {
    'ai-form':
      'To request access, please reach out to us by filling <a href="https://forms.gle/D2Uwp72U6uBBwwBdA">this form</a>.',
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