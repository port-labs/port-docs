---
sidebar_position: 12
title: Ask AI
sidebar_label: Ask AI
sidebar_class_name: custom-sidebar-item sidebar-menu-ai-agents
---

# Ask AI

Port's AI assistant is here to help you get the most out of your portal by answering your questions, creating resources, and assisting with troubleshooting. 

To use the AI assistant, click on the `Ask AI` button in the top-right corner ↗️ and ask a question.

## Ways to use the assistant

➙ **Ask documentation questions**  
  You can ask the assistant about any aspect of Port’s documentation, features, or concepts.  
  For example:
  - "How do I create a new blueprint?"
  - "What is a relation in Port?"
  - "What configuration options are available when creating a self-service action?"

➙ **Request resource definitions**  
  The assistant can generate JSON definitions for Port resources.  
  Try prompts like:
  - "Write a blueprint definition for a YouTube video with properties for title, description, likes, and views"
  - "Write an automation definition that sends a Slack message to a channel when a new user is created"

➙ **Debugging help**  
  If you have an error in a JSON/YAML definition, paste it in and ask for help:
  - "Why is this entity definition invalid?"
    ```json
    {
      "identifier": "provision",
      "title": "Provision",
      "icon": "Microservice",
      "team": "myTeam",
      "properties": {},
      "relations": {
        "repository": "provision"
      }
    }
    ```
  - "I'm trying to ingest a YAML file using the GitHub integration into a property called `spec`, but I'm getting an error saying that `spec` must be string.  
  Here is the data source mapping:"
    ```yaml
    - kind: file
      selector:
        query: 'true'
        files:
          - path: '**/openapi.yaml'
      port:
        entity:
          mappings:
            identifier: .repo.full_name
            blueprint: '"api_specs"'
            properties:
              spec: .file.content
          relations:
            repository: .repo.full_name
    ```

➙ **Step-by-step guidance**  
  The assistant can walk you through processes:
  - "Guide me through setting up a webhook integration"
  - "How do I map properties from my data source to Port entities?"

➙ **Troubleshooting**  
  If you encounter issues, describe the problem and the assistant can suggest solutions or point you to the relevant documentation.
  
## Tips for getting the best results

➙ **Be specific**  
  The more details you provide, the better the assistant can help. Include relevant context, error messages, or code snippets when possible.

➙ **Iterate and clarify**  
  If the first answer isn’t quite right, ask follow-up questions or clarify your request.

➙ **Use examples**  
  When asking for definitions or debugging, include your current JSON/YAML or the error message you’re seeing.

➙ **Look ahead**  
  The assistant can provide insights into new features, in-progress work, or upcoming changes.

➙ **Provide feedback**  
  After receiving an answer, you can upvote or downvote it to help improve the assistant's responses.

## Privacy & security

➙ The assistant is trained only on public sources, including:
- Port's documentation & API reference
- Port's roadmap
- Port's Terraform provider
- Port's Pulumi provider

➙ The assistant does not have access to any private data or data from any Port instance.
 