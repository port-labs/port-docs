---
sidebar_position: 6
title: Troubleshooting
---

# Troubleshooting

If you encounter issues while setting up or using the Port MCP Server, expand the relevant section below:

<details>
<summary>How can I connect to the MCP? (Click to expand)</summary>

Refer back to the [setup instructions](/ai-agents/port-mcp-server#setup) for your specific application (Cursor, VSCode, or Claude). Make sure you're using the correct regional URL for your Port organization.

</details>

<details>
<summary>I completed the connection but nothing happens (Click to expand)</summary>

Check that you've followed all the [setup steps](/ai-agents/port-mcp-server#setup) correctly for your application. Ensure you're authenticated with Port and have the necessary permissions. If you've followed all the steps and still have issues, please reach out to our support team.

</details>

<details>
<summary>Why do I see an error about too many tools? (Click to expand)</summary>

Each self-service action in your Port instance becomes an individual tool (as `run_<action_identifier>`). If your organization has many actions, this can result in a large number of tools being available.

While most AI models handle this well, some have restrictions and may limit you to around 40 tools total. If you encounter errors about tool limits:

1. **Reduce the number of tools** by customizing which tools are enabled (see [Select which tools to use](available-tools#select-which-tools-to-use) section above)
2. **Focus on essential tools** by only enabling the read-only tools you need plus a few key actions
3. **Contact your Port Admin** to review which actions are essential for your workflow

This is completely normal behavior and doesn't indicate a problem with Port MCP - it's just a limitation of some AI models.

</details>

:::tip Getting Help
If you continue to experience issues, please reach out to Port support with:
- Your IDE/application version
- The specific error messages you're seeing
- Your Port region (EU/US)
- Steps you've already tried

This information will help us provide more targeted assistance.
:::
