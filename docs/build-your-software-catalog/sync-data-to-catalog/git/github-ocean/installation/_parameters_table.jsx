import React from 'react';

export default function ParametersTable({ showingApp }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Description</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>port.clientId</code></td>
          <td>Your Port client ID.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>port.clientSecret</code></td>
          <td>Your Port client secret.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>port.baseUrl</code></td>
          <td>Your Port API URL (<code>https://api.getport.io</code> for EU, <code>https://api.us.getport.io</code> for US).</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>integration.identifier</code></td>
          <td>A unique identifier for your integration.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>integration.type</code></td>
          <td>The integration type.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>integration.eventListener.type</code></td>
          <td>The event listener type.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>integration.config.githubOrganization</code></td>
          <td>The GitHub organization to sync data from.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>integration.config.githubHost</code></td>
          <td>The API endpoint for your GitHub instance. For GitHub Enterprise Cloud, this will be <code>https://api.&lt;SUBDOMAIN&gt;.ghe.com</code>. Defaults to <code>https://api.github.com</code> if not provided.</td>
          <td>❌</td>
        </tr>
        {!showingApp && <tr>
          <td><code>integration.secrets.githubToken</code></td>
          <td>A GitHub Personal Access Token (PAT) to authenticate with your GitHub Organization. Only required when you're not authenticating as a <a href="../github-app.mdx">Github app</a></td>
          <td>✅</td>
        </tr>}
        <tr>
          <td><code>scheduledResyncInterval</code></td>
          <td>The number of minutes between each resync.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>initializePortResources</code></td>
          <td>When <code>true</code>, the integration will create default blueprints and port-app-config.yml mapping.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>sendRawDataExamples</code></td>
          <td>When <code>true</code>, sends raw data examples from the third-party API to Port for testing and managing the integration mapping.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>liveEvents.baseUrl</code></td>
          <td>The base url of the instance where the GitHub integration is hosted, used for real-time updates (e.g. <code>https://mygithuboceanintegration.com</code>).</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>integration.config.webhookSecret</code></td>
          <td>A secret to secure webhooks from GitHub. This is optional but highly recommended for security if you enable live-events.</td>
          <td>❌</td>
        </tr>
        {showingApp && <>
          <tr>
            <td><code>integration.config.githubAppId</code></td>
            <td>The app id or client id of your GitHub App. Required if you are authenticating as a <a href="../github-app.mdx">GitHub App</a> instead of using a PAT.</td>
            <td>❌</td>
          </tr>
          <tr>
            <td><code>integration.secrets.githubAppPrivateKey</code></td>
            <td>The base64 encoded private key of your GitHub App. Required if you are authenticating as a GitHub App.</td>
            <td>❌</td>
          </tr>
        </>}
      </tbody>
    </table>
  );
}
