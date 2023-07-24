---
sidebar_position: 1
---

# Installation

:::note Prerequisites

- A gitlab account with admin privileges.;
- A gitlab group account with api privileges. (Refer to the [permissions](./gitlab.md#permissions) section for more information);
- A kubernetes cluster to install the integration on;
- Your Port user role is set to `Admin`.

:::

1. Sign in to GitLab and go to your desired group's settings.

   ![GitLab group settings](../../../../../static/img/integrations/gitlab/GitLabGroupSettings.png)

2. In the "Access Tokens" section, click "Create access token."

   ![GitLab group access tokens](../../../../../static/img/integrations/gitlab/GitLabGroupAccessTokens.png)

3. Fill in the token details: name, expiration (optional), and select API scope.
4. Click "Create group access token."
5. Copy the generated token and use it in the integration installation process.
6. Click the ingest button for the blueprint you want to ingest using GitLab.

   ![DevPortal Builder ingest button](../../../../../static/img/integrations/gitlab/DevPortalBuilderIngestButton.png)

7. Select GitLab under the Git providers category.

   ![DevPortal Builder GitLab option](../../../../../static/img/integrations/gitlab/DevPortalBuilderGitLabOption.png)

8. Copy the helm installation command and set the missing parameters.

   ### tokenMapping

   GitLab integration support fetching data related to specific paths in your gitlab groups. In order to do so, you need to map the desired paths to the relevant access tokens.
   The `tokenMapping` support specifying the path using [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] that the integration will search the files in.
   Example: `{"*/MyImportantProjects/**": "myImportantProjectsToken", "*/NotImportatn/*": "OtherToken"}`

   #### appHost

   Inorder for the GitLab integration to be able to update the data in port on every change in the gitlab repository, you need to specify the `appHost` parameter.
   The `appHost` parameter should be set to the url of your gitlab integration instance.

9. Run the helm command over your kubernetes cluster

# Self-hosted GitLab

In case you are using a self-hosted GitLab instance, you need to add the following line to your helm installation command:

```bash
	--set integration.config.gitlabHost="https://you-gitlab-url"
```
