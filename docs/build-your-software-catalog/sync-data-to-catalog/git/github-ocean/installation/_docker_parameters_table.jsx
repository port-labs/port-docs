import React from 'react';

export default function DockerParametersTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Env variable</th>
          <th>Description</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>OCEAN__PORT__CLIENT_ID</code></td>
          <td>Port client id for interacting with the API</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__PORT__CLIENT_SECRET</code></td>
          <td>Port client secret for interacting with the API</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__PORT__BASE_URL</code></td>
          <td>Port's API Base URL</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__BASE_URL</code></td>
          <td>Integration instance base url, real-time live events will be enabled if this is configured.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET</code></td>
          <td>A secret to secure webhooks from GitHub. This is optional but highly recommended for security if you enable live-events.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>OCEAN__EVENT_LISTENER__TYPE</code></td>
          <td>Define the appropriate event listener type to handle incoming events and resync requests from Port. This listener will forward the events to the GitHub Ocean integration. For more details, see the <a href="https://ocean.getport.io/framework/features/event-listener">Port Event Listener documentation</a></td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__CONFIG__GITHUB_HOST</code></td>
          <td>The API endpoint for your GitHub instance. For GitHub Enterprise, this will be <code>https://&lt;org_name.ghe.com&gt;</code>. Defaults to <code>https://api.github.com</code> if not provided.</td>
          <td>❌</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION</code></td>
          <td>The GitHub organization the integration was installed in.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__IDENTIFIER</code></td>
          <td>A unique identifier for the integration instance. Useful if you are running multiple self-hosted GitHub integrations. Defaults to <code>github-ocean</code>.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__CONFIG__GITHUB_APP_ID</code></td>
          <td>Application ID. You can find it in the edit GitHub app page.</td>
          <td>✅</td>
        </tr>
        <tr>
          <td><code>OCEAN__INTEGRATION__CONFIG__GITHUB_APP_PRIVATE_KEY</code></td>
          <td>A base64 encoded Github app private key.</td>
          <td>✅</td>
        </tr>
      </tbody>
    </table>
  );
}
