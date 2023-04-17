---
sidebar_position: 1
---

# Installation

:::note Prerequisites

- A registered organization in Port;
- Your Port user role is set to `Admin`.
- A GitLab `group access token`.
- Your `Group ID` in GitLab

:::

1. Go to Port Website and Add GitLab Integration.

   - On DevPortal Builder Page click the `Add` and then click `Choose from template`.

   ![Choose From Template](../../../../../static/img/build-your-software-catalog/sync-data-to-catalog/gitlab/choose-from-template-button.png)

   - On Template Center choose `Map your git ecosystem`.

   ![Choose a use case](../../../../../static/img/build-your-software-catalog/sync-data-to-catalog/gitlab/template-center.png)

   - Select `GitLab` and click on the `Get this template` button.

   ![Choose a use case](../../../../../static/img/build-your-software-catalog/sync-data-to-catalog/gitlab/get-this-template.png)

2. Copy the bash commands and enter your:

   - `GITLAB_API_TOKEN` - which is group access token.
   - `GROUP_ID` (you can find it on the main page of your GitLab Group under the main title)

   ![Choose a use case](../../../../../static/img/build-your-software-catalog/sync-data-to-catalog/gitlab/gitlab-script-step.png)

3. Run the bash commands and that it, you're done!

   :::note
   Notice a webhook will be created in order to listen to new changes.
   :::
