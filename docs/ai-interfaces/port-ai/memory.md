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

## Frequently asked questions

<details>
<summary><b>How are memories used? (Click to expand)</b></summary>

When you start a conversation with Port AI, the system retrieves your most relevant stored preferences based on your current input. These preferences are then used to personalize the AI's responses - for example, if you've previously preferred concise answers, the AI will provide shorter responses. Only the most relevant memories are selected for each interaction, not your entire memory history.

</details>

<details>
<summary><b>Where are memories stored? Can I bring my own? (Click to expand)</b></summary>

Memories are built from your AI inputs and outputs, and are stored as part of Port's infrastructure to improve your future interactions. Memory works the same way whether you use Port's managed AI or bring your own LLM provider (BYOL) - memories are stored in Port regardless of which LLM processes your requests.

If you prefer not to have memories stored, organization administrators can disable the memory feature entirely.

</details>

<details>
<summary><b>What are some examples of memories? How are they helpful? (Click to expand)</b></summary>

Examples of memories that might be stored:

- "Prefers concise code reviews with bullet points."
- "Uses Python with FastAPI for backend services."
- "Works primarily with the payments team's services."
- "Prefers YAML format for configuration examples."

These memories help Port AI provide more relevant responses without you having to repeat your preferences. For instance, if you've consistently asked for Python examples, the AI will default to Python in future code suggestions.

</details>

<details>
<summary><b>What control do I have over memories? Can I adjust or remove them? (Click to expand)</b></summary>

You can view and delete your memories using the Memory API:

- **View memories**: Use the [List user memory records](/api-reference/list-user-memory-records) endpoint to see all stored preferences.
- **Delete memories**: Use the [Delete user memory records](/api-reference/delete-user-memory-records) endpoint to remove specific memories or all at once.

You cannot manually add or edit memories - the system automatically determines what to store based on your interactions. If a memory is incorrect or unhelpful, you can delete it.

</details>

<details>
<summary><b>Is memory shared? Can I access another user's memories? (Click to expand)</b></summary>

No, memories are completely private and user-scoped:

- Each user's memories are associated only with their account.
- You cannot view or access another user's memories.
- Memories are not shared across users, even within the same organization.
- Organization administrators can delete memories for specific users but cannot view their contents.

</details>
