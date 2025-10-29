import Markdown from "@theme/Markdown";

const actions = {
    'ai-form':
      'To get access, please fill out <a href="https://forms.gle/XtTR9R9pzo8tMYDT8" target="_blank">this form</a> with your organization details.'
  };

const OpenBetaFeatureNotice = ({ id }) => {

return (
    <Markdown>
    {actions[id]}
    </Markdown>
);
};

export default OpenBetaFeatureNotice;