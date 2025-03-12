export const ClosedBetaFeatureNotice = ({ accessRequestMethod }) => (
  <div className="admonition admonition-info alert alert--info">
    <div className="admonition-heading">
      <h5>Closed Beta Feature</h5>
    </div>
    <div className="admonition-content">
      <p>
        This feature is currently in closed beta with limited availability.<br />
        Access is provided on an application basis.
        {accessRequestMethod && (
          <>
            {" "}If you'd like to apply for access, {accessRequestMethod}
          </>
        )}
      </p>
    </div>
  </div>
);

export default ClosedBetaFeatureNotice; 