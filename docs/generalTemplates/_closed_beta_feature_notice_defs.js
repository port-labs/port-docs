import Markdown from "@theme/Markdown";

const actions = {
    'ai-form':
      'To request access, please reach out to us by filling <a href="https://forms.gle/BygmbCWcf1Vy4KPW9">this form</a>.'
  };

const ClosedBetaFeatureNotice = ({ id }) => {

return (
    <Markdown>
    {actions[id]}
    </Markdown>
);
};

export default ClosedBetaFeatureNotice;