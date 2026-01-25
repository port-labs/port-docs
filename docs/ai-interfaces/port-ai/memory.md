---
sidebar_position: 6
title: Memory
---

# Memory

Memory allows Port AI to learn and remember your preferences across conversations. Over time, the AI adapts to your working style, providing more personalized and relevant responses without requiring you to repeat yourself.

## What memory does

When you interact with Port AI, it learns patterns from your conversations:

- **Output preferences**: Your preferred formats for responses (e.g., concise summaries vs. detailed explanations).
- **Coding styles**: Language preferences, naming conventions, or framework choices you commonly use.
- **Common workflows**: Repeated tasks or processes specific to your role or team.

In each conversation, the AI selects the most relevant preferences based on your current input and uses them to personalize responses. Not all stored preferences are used in every interaction - only those most relevant to what you're working on.

## How memory works

Memory operates automatically in the background:

1. **Learning**: As you interact with Port AI, it identifies patterns and preferences from your conversations.
2. **Storing**: After conversations, relevant preferences are processed asynchronously and saved to your user account. The system automatically determines what information is valuable to remember.
3. **Applying**: In future conversations, the AI retrieves your preferences and uses them to provide more personalized responses.

Memory generation happens asynchronously after your conversations - preferences don't appear immediately. The system automatically decides what to store based on patterns it identifies; users cannot manually add or control what enters memory.

Memory is enabled by default for all organizations. Users don't need to configure anything to benefit from personalized AI responses.

## Managing your memories

You can view and delete your stored memories using the Memory API.

**User operations:**

- [List user memory records](/api-reference/list-user-memory-records) - View all your stored memories.
- [Delete user memory records](/api-reference/delete-user-memory-records) - Delete specific memories or all at once.

:::info Deletion is asynchronous
Memory deletion is processed asynchronously and may take some time to complete. During this period, deleted records might still appear when listing memories. If deletion fails for some records, the API returns an error indicating which deletions failed.
:::

## Organization settings

Organization administrators can control whether memory is enabled for their organization.

**Admin operations:**

- [Get memory settings](/api-reference/get-memory-settings) - View current memory settings.
- [Update memory settings](/api-reference/update-memory-settings) - Enable or disable memory for the organization.
- [Delete users memory records](/api-reference/delete-users-memory-records) - Delete memories for specific users.

When memory is disabled:

- The AI stops learning new preferences from conversations.
- Existing memories are retained but not used.
- Users can still delete their memories via the API.

## Privacy and data controls

Memory is designed with privacy in mind:

- **User-scoped**: Memories are associated with individual user accounts and are not shared across users.
- **User control**: You can view and delete your memories at any time.
- **Admin control**: Organization administrators can disable memory entirely or delete memories for specific users.
- **Opt-out available**: Organizations can disable memory if it doesn't fit their security or compliance requirements.
