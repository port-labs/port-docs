import React from 'react';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

const MCPInstallation = () => {
  return (
    <div>
      <h3>Install MCP server in Cursor</h3>
      
      <ol>
        <li>
          <strong>Open Cursor settings</strong>
          <br />
          Go to Cursor settings, click on <strong>Tools & Integrations</strong>, and add a new MCP server.
          <br />
          <img src="/img/ai-agents/MCPInstallCursorStep1.png" width="80%" style={{border: '1px solid #ccc'}} />
        </li>
        
        <li>
          <strong>Configure the MCP server</strong>
          <br />
          Add the appropriate configuration for your Port region:
          
          <Tabs>
            <TabItem value="eu" label="EU Region">
              <pre><code>{`{
  "mcpServers": {
    "port-eu": {
      "url": "https://mcp.port.io/v1"
    }
  }
}`}</code></pre>
            </TabItem>
            <TabItem value="us" label="US Region">
              <pre><code>{`{
  "mcpServers": {
    "port-us": {
      "url": "https://mcp.us.port.io/v1"
    }
  }
}`}</code></pre>
            </TabItem>
          </Tabs>
          
          <img src="/img/ai-agents/MCPInstallCursorStep2.png" width="80%" style={{border: '1px solid #ccc'}} />
        </li>
        
        <li>
          <strong>Authenticate with Port</strong>
          <br />
          Click on <strong>"Needs login"</strong> and complete the authentication flow in the window that opens.
          <br />
          <img src="/img/ai-agents/MCPInstallCursorStep3.png" width="80%" style={{border: '1px solid #ccc'}} />
        </li>
        
        <li>
          <strong>Verify connection</strong>
          <br />
          After successful authentication, you'll see the list of available tools from the MCP server.
          <br />
          <img src="/img/ai-agents/MCPInstallCursorStep4.png" width="80%" style={{border: '1px solid #ccc'}} />
        </li>
      </ol>
      
      <div className="admonition admonition-tip alert alert--success">
        <div className="admonition-heading">
          <h5>
            <span className="admonition-icon">
              <svg viewBox="0 0 14 16"><path fillRule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path></svg>
            </span>
            Alternative setup options
          </h5>
        </div>
        <div className="admonition-content">
          <p>While this guide focuses on Cursor, you can also set up the MCP server with:</p>
          <ul>
            <li><strong>VSCode</strong>: Using the GitHub Copilot extension with MCP support</li>
            <li><strong>Claude</strong>: Through custom connectors</li>
            <li><strong>Local installation</strong>: Using Docker or Python package managers</li>
          </ul>
          <p>For detailed instructions on other setup methods, see the <a href="/ai-interfaces/port-mcp-server/overview-and-installation">Port MCP server installation guide</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default MCPInstallation;