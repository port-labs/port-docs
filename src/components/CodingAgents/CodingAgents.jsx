import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const CodingAgents = () => {
  return (
    <>
      <p>This guide supports multiple AI coding agents:</p>
      
      <Tabs groupId="coding-agent" defaultValue="claude">
        <TabItem value="claude" label="Claude Code">
          AI-powered coding assistant by Anthropic follow the <a href="/guides/all/trigger-claude-code-from-port">→ Setup guide</a>
        </TabItem>
        
        <TabItem value="copilot" label="GitHub Copilot">
          GitHub's native AI coding assistant follow the <a href="/guides/all/trigger-github-copilot-from-port">→ Setup guide</a>
        </TabItem>
        
        <TabItem value="gemini" label="Google Gemini">
          Google's AI coding assistant follow the <a href="/guides/all/trigger-gemini-assistant-from-port">→ Setup guide</a>
        </TabItem>
      </Tabs>
    </>
  );
};

export default CodingAgents;

