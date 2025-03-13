:::info Closed Beta Feature
This feature is currently in closed beta with limited availability.   Access is provided on an application basis.


{props.accessRequestMethod && (
  <>To request access, {props.accessRequestMethod}</>
)}
:::

<!-- 
Usage instructions:
1. Copy this template to your document
2. You can provide optional access request information using the accessRequestMethod prop:

Example with access request info:
<ClosedBetaFeatureNotice 
  accessRequestMethod={
    <span>please reach out to us by filling <a href='https://forms.gle/example'>this form</a>.</span>
  } 
/>

Example without access request info:
<ClosedBetaFeatureNotice />
-->