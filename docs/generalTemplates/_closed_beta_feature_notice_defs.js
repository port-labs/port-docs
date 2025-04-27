import Markdown from "@theme/Markdown";

const actions = {
    'ai-form':
      'To request access, please reach out to us by filling <a href="https://forms.gle/D2Uwp72U6uBBwwBdA">this form</a>.'
  };

const ClosedBetaFeatureNotice = ({ id }) => {

return (
    <Markdown>
    {actions[id]}
    </Markdown>
);
};

export default ClosedBetaFeatureNotice;