---
sidebar_position: 6
---

# Migration Guide to GitLab-v2

This guide helps you migrate from Port's GitLab integration to the new GitLab-v2 integration.

## Overview

GitLab-v2 introduces significant authentication and performance improvements:

- **Simplified authentication**: Replace multiple group tokens with a single service account token
- **Enhanced performance**: Faster resync with improved API efficiency  
- **New capabilities**: Support for pipeline jobs and enhanced group handling

## What's changing

### Authentication model

**GitLab approach**: Multiple group access tokens mapped to specific paths
```yaml
integration:
  secrets:
    tokenMapping: |
      {"glpat-token1": ["**/Group1/**"], "glpat-token2": ["**/Group2/**"]}
```

**GitLab-v2 approach**: Single service account token with broad access
```yaml
integration:
  secrets:
    token: "glpat-service-account-token"
```

## Blueprint mapping changes

The blueprints used in GitLab-v2 have evolved to provide cleaner data structures and better relationships between entities. Understanding these changes is essential for a successful migration.

### Kind mapping changes by resource type

#### 1. **project** kind (Required update)

**GitLab configuration:**
```yaml
- kind: project
  selector:
    query: "true"
    includeLabels: "true"  # ❌ Remove: No longer supported
  port:
    entity:
      mappings:
        identifier: .path_with_namespace | gsub(" "; "")
        title: .name
        blueprint: '"service"'  # ✅ Keep: Already uses 'service'
        properties:
          language: .__languages | to_entries | max_by(.value) | .key
          labels: .__labels  # ❌ Remove: Labels no longer available
```

**GitLab-v2 configuration:**
```yaml  
- kind: project
  selector:
    query: "true"
    includeLanguages: "true"  # ✅ Add: New selector for language detection
  port:
    entity:
      mappings:
        identifier: .path_with_namespace | gsub(" "; "")
        title: .name
        blueprint: '"service"'  # ✅ No change needed
        properties:
          language: .__languages | to_entries | max_by(.value) | .key
          # Remove labels property - no longer available
```

#### 2. **merge-request** kind (Configuration update)

**GitLab configuration:**
```yaml
- kind: merge-request
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .title
        blueprint: '"gitlabMergeRequest"'
```

**GitLab-v2 configuration:**
```yaml
- kind: merge-request
  selector:
    query: "true"
    states: ["opened", "merged"]  # ✅ Add: New selector options
    updatedAfter: 90  # ✅ Add: Filter by update time (days)
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .title
        blueprint: '"gitlabMergeRequest"'  # ✅ No change needed
        properties:
          creator: .author.name
          reviewers: .reviewers | map(.name)
```

#### 3. **Member handling changes** (Architecture change)

GitLab and GitLab-v2 handle members differently. GitLab embeds members as properties within projects/groups, while GitLab-v2 treats members as separate entities with relations.

**GitLab approach - Members as embedded properties:**
```yaml
- kind: project-with-members # ❌ Remove: No longer supported
  selector:
    query: 'true'
    includeInheritedMembers: false 
    includeBotMembers: false
    includeVerboseMemberObject: false
  port:
    entity:
      mappings:
        identifier: .path_with_namespace | gsub(" "; "")
        title: .name
        blueprint: '"service"'
        properties:
          members: .__members  # ❌ Members embedded as properties

- kind: group-with-members
  selector:
    query: 'true'
    includeInheritedMembers: false # ❌ Remove: No longer supported
    includeBotMembers: false # ✅ Keep: Still supported
    includeVerboseMemberObject: false # ❌ Remove: No longer supported
  port:
    entity:
      mappings:
        identifier: .full_path
        title: .name
        blueprint: '"gitlabGroup"'
        properties:
          members: .__members  # ❌ Members embedded as properties
```

**GitLab-v2 approach - Members as separate entities with relations:**
```yaml
# ✅ New: Dedicated member entities
- kind: member
  selector:
    query: 'true'
    includeBotMembers: false
  port:
    entity:
      mappings:
        identifier: .username
        title: .name
        blueprint: '"gitlabMember"'
        properties:
          url: .web_url
          state: .state
          email: .email
          locked: .locked

# ✅ Updated: Groups with member relations (not embedded properties)
- kind: group-with-members
  selector:
    query: 'true'
    includeBotMembers: false
  port:
    entity:
      mappings:
        identifier: .full_path
        title: .name
        blueprint: '"gitlabGroup"'
        properties:
          url: .web_url
          visibility: .visibility
          description: .description
        relations:
          gitlabMembers: .__members | map(.username)  # ✅ Relations, not properties
```

#### 4. **file** kind (Search API and repository format changes)

For file resync, GitLab-v2 now uses GitLab's Advanced Search API with its specific syntax and limitations:

**GitLab format:**
```yaml
- kind: file
  selector:
    files:
      path: '**/package.json'  # ❌ Custom glob patterns
      repos:
        - "backend-service"  # ❌ Simple repository name
        - "frontend-app"
```

**GitLab-v2 format:**
```yaml
- kind: file
  selector:
    files:
      path: 'package.json'  # ✅ GitLab Advanced Search syntax (https://docs.gitlab.com/user/search/advanced_search/#use-advanced-search)
      repos:
        - "my-org/backend-service"  # ✅ Full namespace/project path
        - "my-org/frontend-app"
      skipParsing: false  # ✅ New option to skip parsing and return raw content
```

#### 5. **folder** kind (Repository selector changes)

For folder resync, GitLab-v2 changes the repository specification format to support branch-specific folder mapping:

**GitLab format:**
```yaml
- kind: folder
  selector:
    folders:
      - path: "src"
        repos:
          - "backend-service"  # ❌ Simple repository name
          - "frontend-app"
        branch: "main"  # ❌ Single branch for all repos
```

**GitLab-v2 format:**
```yaml
- kind: folder
  selector:
    folders:
      - path: "src"
        repos:
          - name: "my-org/backend-service"  # ✅ Full namespace/project path
            branch: "main"  # ✅ Branch specified per repository
          - name: "my-org/frontend-app"
            branch: "develop"  # ✅ Different branches per repository
```

#### 6. **New kinds available in GitLab-v2**

GitLab-v2 introduces several new kinds not available in GitLab:

**pipeline** kind (New):
```yaml
- kind: pipeline
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"gitlabPipeline"'
```

**job** kind (New):
```yaml
- kind: job
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"gitlabJob"'
        properties:
          status: .status
          stage: .stage
          duration: .duration
```

**issue** kind (Enhanced):
```yaml
- kind: issue
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .title
        blueprint: '"gitlabIssue"'
        properties:
          creator: .author.name
          status: .state
          labels: "[.labels[]]"
        relations:
          project: .references.full | gsub("#.+"; "")
```

## Configuration selector changes

GitLab-v2 introduces new selector options while removing some GitLab-specific configurations that are no longer needed.

### Removed selectors

The following selectors from GitLab are no longer available in GitLab-v2:

- **includeLabels**: Filtered projects based on labels but was rarely used and added unnecessary complexity
- **includeInheritedMembers**: Member inheritance is now handled differently in GitLab-v2, making this selector obsolete
- **includeVerboseMemberObject**: The member object structure has been standardized in GitLab-v2, eliminating the need for this verbose option

### New selectors in GitLab-v2

GitLab-v2 introduces several new selector options that provide better control over data resync:

- **includeLanguages**: Enables language detection and inclusion in project entities. When set to true, the integration will analyze repository languages and include the primary language in the project properties
- **states**: Available for merge requests, allows you to specify which merge request states to resync (opened, closed, merged)
- **updatedAfter**: For merge requests, helps limit resync to recently updated merge requests by specifying the number of days to look back

## Summary of key changes

The following table summarizes all the major differences between GitLab and GitLab-v2 to help you prepare for migration:

| Kind/Feature | GitLab | GitLab-v2 | Action Required |
|---------|----|----|----------------|
| **project** kind | `includeLabels` selector | `includeLanguages` selector | Replace `includeLabels: true` with `includeLanguages: true` |
| **merge-request** kind | Basic configuration | Enhanced selectors | Add `states` and `updatedAfter` selectors |
| **Member handling** | `project-with-members` + `group-with-members` (embedded) | `member` kind + `group-with-members` (relations) | Add dedicated `member` kind, update group relations |
| **project-with-members** kind | ✅ Supported | ❌ Not available | Remove and use separate `member` + `project` kinds |
| **file** kind | Custom glob patterns + simple repo names | GitLab Advanced Search syntax + full namespace paths + `skipParsing` option | Update to GitLab search syntax, update repo names to `org/repo` format |
| **folder** kind | Simple repo names + single branch | Repository objects with name/branch pairs | Update repos to objects with `name` and `branch` properties |
| **pipeline** kind | ❌ Not available | ✅ New kind | Add pipeline mapping if needed |
| **job** kind | ❌ Not available | ✅ New kind | Add job mapping if needed |
| **issue** kind | ❌ Limited support | ✅ Enhanced | Update to new issue mapping |

## File and folder mapping updates

The way you specify repositories for file and folder resync has changed significantly between versions.

| Repository Specification | GitLab Format | GitLab-v2 Format |
|--------------------------|-----------|-----------|
| File repos | `"backend-service"` | `"my-org/backend-service"` |
| Folder repos | `"frontend-app"` | `"my-org/frontend-app"` |

The namespace path format follows GitLab's standard `group/project` or `group/subgroup/project` structure, ensuring accurate repository identification even when multiple projects share the same name across different groups.

## Migration steps

### Step 1: Create a GitLab service account

Choose the appropriate setup method for your GitLab instance:

**For GitLab.com (SaaS):**
1. Navigate to your top-level group settings
2. Go to **Access Tokens** under the group settings
3. Create a **Group Service Account**

**For GitLab self-managed:**
1. Create a new user account (e.g., `port-integration-bot`)
2. Add this user to all relevant groups with **Developer** permissions or higher

### Step 2: Generate the access token

1. Sign in to your service account
2. Navigate to **User Settings > Access Tokens**
3. Create a new personal access token with:
   - **Name**: `Port Integration Token`
   - **Scopes**: `api` (or `read_api` + `read_repository` for read-only)
   - **Expiration**: Set according to your security policy
4. Save the generated token securely

:::tip Token permissions
The service account needs access to all groups and projects you want to sync. For webhook functionality, it also needs permission to create webhooks.
:::

### Step 3: Update your integration configuration

Replace your current token mapping configuration with the new single token approach. This step eliminates the complexity of managing multiple tokens while ensuring the service account has appropriate access across your GitLab instance.

<details>
<summary>Before: GitLab configuration with token mapping</summary>

```yaml
integration:
  secrets:
    tokenMapping: |
      {
        "glpat-old-token-1": ["**/DevTeam/**", "**/BackendServices/**"],
        "glpat-old-token-2": ["**/FrontendApps/**"]
      }
```

</details>

<details>
<summary>After: GitLab-v2 configuration with single token</summary>

```yaml
integration:
  secrets:
    token: "glpat-your-new-service-account-token"
```

</details>

### Step 4: Update resource selectors and blueprints

Review your mapping configuration for deprecated selectors and blueprint references:

**Update each kind mapping specifically:**

1. **For `project` kinds:**
   - Remove `includeLabels: true` from selectors
   - Add `includeLanguages: true` to selectors
   - Remove `labels: .__labels` from property mappings

2. **For `merge-request` kinds:**
   - Add `states: ["opened", "merged"]` to selectors (optional)
   - Add `updatedAfter: 90` to selectors (optional)
   - Simplify reviewer mappings to `reviewers: .reviewers | map(.name)`

3. **For member handling (architecture change):**
   - Remove `project-with-members` kind configurations
   - Update `group-with-members` to use relations instead of embedded properties
   - Add new `member` kind with `includeBotMembers: false` selector
   - Remove deprecated selectors: `includeInheritedMembers`, `includeVerboseMemberObject`

4. **For `file` kinds:**
   - Update file paths to use GitLab Advanced Search syntax (change `'**/package.json'` to `'*package.json'`)
   - Update all repo specifications from `"repo-name"` to `"org/repo-name"` format
   - Optionally add `skipParsing: false` to selector if you want to control content parsing

5. **For `folder` kinds:**
   - Update all repo specifications from simple strings to objects with `name` and `branch` properties
   - Change from `repos: ["repo-name"]` to `repos: [{"name": "org/repo-name", "branch": "main"}]`
   - Take advantage of per-repository branch specification for more flexible folder mapping

6. **Add new kinds if needed:**
   - Add `pipeline` kind for CI/CD pipeline tracking
   - Add `job` kind for individual job monitoring  
   - Add `issue` kind for issue tracking

### Step 5: Update file and folder mappings

Update any file or folder mappings to use GitLab's Advanced Search API syntax and repository formats required by GitLab-v2:

1. **Update file paths to GitLab Advanced Search syntax:**
   - Change `path: '**/package.json'` to `path: 'package.json'`
   - Change `path: '**/*.yml'` to `path: '*.yml'`
   - GitLab-v2 uses [GitLab's Advanced Search API](https://docs.gitlab.com/user/search/advanced_search/#use-advanced-search) which supports `*` wildcards but follows GitLab's search syntax

2. **Update repository specifications:**
   - Change repository names to include the full group path
   - Review all `repos` specifications in your file and folder kinds

3. **Test the updated configuration with a small subset first**

**Example file kind transformation:**
```yaml
# GitLab format
- kind: file
  selector:
    files:
      path: '**/package.json'  # ❌ Custom glob pattern
      repos:
        - "backend-service"    # ❌ Simple name

# GitLab-v2 format  
- kind: file
  selector:
    files:
      path: '*package.json'         # ✅ GitLab Advanced Search syntax
      repos:
        - "my-org/backend-service"   # ✅ Full namespace
      skipParsing: false             # ✅ Optional parsing control
```

**Example folder kind transformation:**
```yaml
# GitLab format
- kind: folder
  selector:
    folders:
      - path: "src"
        repos:
          - "backend-service"  # ❌ Simple name
        branch: "main"         # ❌ Single branch for all repos

# GitLab-v2 format  
- kind: folder
  selector:
    folders:
      - path: "src"
        repos:
          - name: "my-org/backend-service"  # ✅ Full namespace with branch object
            branch: "main"
          - name: "my-org/frontend-app"     # ✅ Different branches per repo
            branch: "develop"
```

:::tip GitLab Advanced Search capabilities
GitLab-v2 follows [GitLab's Advanced Search syntax](https://docs.gitlab.com/user/search/advanced_search/#use-advanced-search) which supports:
- `*` for partial matches (e.g., `*package.json` or `*.yml`)  
- `filename:` prefix for filename searches
- Other advanced search operators

See GitLab's documentation for the complete list of supported search patterns and limitations.
:::

This change ensures accurate repository identification and prevents conflicts when multiple repositories share the same name across different GitLab groups.

### Step 6: Deploy and verify

1. **Deploy the GitLab-v2 integration** with your updated configuration
2. **Trigger a manual resync** from Port's UI to initiate data resync
3. **Verify data consistency**:
   - Check that all expected projects are resynced
   - Confirm merge requests and issues are updating correctly
   - Test webhook functionality if enabled
4. **Monitor the logs** for any authentication or permission issues

:::tip Parallel testing
Consider running both GitLab and GitLab-v2 integrations temporarily to compare results before fully switching over.
:::

### Step 7: Clean up GitLab integration

Once GitLab-v2 is working correctly:

1. **Disable the GitLab integration**
2. **Revoke the old group access tokens** 
3. **Remove GitLab configuration files**
4. **Update any documentation** referencing the old setup

This cleanup ensures security by removing unused tokens and prevents confusion from having multiple configurations.

## New features in GitLab-v2

### Pipeline jobs support

GitLab-v2 introduces comprehensive pipeline job tracking, allowing you to monitor CI/CD job status, stages, and duration. This feature provides detailed insight into your build and deployment processes.

```yaml
- kind: job
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"gitlabJob"'
        properties:
          status: .status
          stage: .stage
          duration: .duration
```

### Enhanced group management

Groups in GitLab-v2 provide cleaner member resync and better hierarchy handling. The separation of member and group concerns allows for more flexible data modeling and improved relationship management between users, groups, and projects.

## Troubleshooting common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Authentication errors** | Service account lacks access to required groups | Verify service account has been added to all relevant groups with appropriate permissions |
| **Missing repositories** | Incorrect namespace formatting in GitLab-v2 | Ensure repository paths use the full `namespace/project` format |
| **Missing member data** | Using old `project-with-members` kind | Remove `project-with-members` kinds and add dedicated `member` kind mapping |
| **Member relation errors** | Members configured as properties instead of relations | Update `group-with-members` to use relations, not embedded member properties |
| **Webhook failures** | Service account lacks webhook creation permissions | Check that service account has sufficient privileges to create and manage webhooks |
| **File sync issues** | Incorrect search syntax | Update file paths to use GitLab Advanced Search syntax (e.g., `*package.json` instead of `**/package.json`) |
| **Repository not found errors** | Outdated repository names in file/folder selectors | Update repo names to use full namespace format (`org/repo`) |

## Getting help

If you encounter issues during migration:

1. Check the integration logs in Port's UI for specific error messages
2. Verify your service account permissions in GitLab to ensure proper access
3. Contact Port support with your specific error messages and configuration details

This migration ensures your GitLab integration benefits from improved security through centralized token management, enhanced performance with optimized API calls, and new capabilities including pipeline job tracking while maintaining all your existing data resync patterns. 