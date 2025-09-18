import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# Azure DevOps

Port's Azure DevOps integration allows you to model Azure DevOps resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and orgaize your desired Azure DevOps resources and their metadata in Port (see supported resources below).
- Watch for Azure DevOps object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.


### Supported Resources

The resources that can be ingested from Azure DevOps into Port are listed below.

  <AzureDevopsResources/>


## Setup

To install Port's Azure DevOps integration, see the [installation](./installation.md#setup) page.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: project
  selector:
    query: 'true'
    defaultTeam: 'false'
  port:
    entity:
      mappings:
        identifier: .id | gsub(" "; "")
        blueprint: '"project"'
        title: .name
        properties:
          state: .state
          revision: .revision
          visibility: .visibility
          defaultTeam: .defaultTeam.name
          link: .url | gsub("_apis/projects/"; "")
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: >-
          "\(.project.name | ascii_downcase | gsub("[ ();]"; ""))/\(.name | ascii_downcase | gsub("[ ();]"; ""))"
        title: .name
        blueprint: '"service"'
        properties:
          url: .remoteUrl
          readme: file://README.md
          id: .id
          last_activity: .project.lastUpdateTime
        relations:
          project: .project.id | gsub(" "; "")
- kind: repository-policy
  selector:
    query: .type.displayName=="Minimum number of reviewers"
  port:
    entity:
      mappings:
        identifier: >-
          "\(.__repository.project.name | ascii_downcase | gsub("[ ();]"; ""))/\(.__repository.name | ascii_downcase | gsub("[ ();]"; ""))"
        blueprint: '"service"'
        properties:
          minimumApproverCount: .settings.minimumApproverCount
- kind: repository-policy
  selector:
    query: .type.displayName=="Work item linking"
  port:
    entity:
      mappings:
        identifier: >-
          "\(.__repository.project.name | ascii_downcase | gsub("[ ();]"; ""))/\(.__repository.name | ascii_downcase | gsub("[ ();]"; ""))"
        blueprint: '"service"'
        properties:
          workItemLinking: .isEnabled and .isBlocking
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .user.displayName
        blueprint: '"azureDevopsMember"'
        properties:
          url: .user.url
          email: .user.mailAddress
- kind: team
  selector:
    query: 'true'
    includeMembers: true
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"azureDevopsTeam"'
        properties:
          url: .url
          description: .description
        relations:
          project: .projectId | gsub(" "; "")
          members: .__members | map(.identity.id)
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: >-
          "\(.repository.project.name | ascii_downcase | gsub("[ ();]"; ""))/\(.repository.name | ascii_downcase | gsub("[ ();]"; ""))/\(.pullRequestId | tostring)"
        blueprint: '"azureDevopsPullRequest"'
        properties:
          status: .status
          createdAt: .creationDate
          leadTimeHours: (.creationDate as $createdAt | .status as $status | .closedDate as $closedAt | ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | ($closedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $closedTimestamp | if $status == "completed" and $closedTimestamp != null then (((($closedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) else null end)
        relations:
          repository: .repository.project.name + "/" + .repository.name | gsub(" "; "")
          service:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"ado_repository_id"'
              value: .repository.id
          creator:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"$identifier"'
              value: .createdBy.uniqueName
          reviewers:
            combinator: '"and"'
            rules:
            - operator: '"in"'
              property: '"$identifier"'
              value: '[.reviewers[].uniqueName]'
          azure_devops_reviewers: '[.reviewers[].id]'
          azure_devops_creator: .createdBy.id
- kind: build
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .__project.id + "-" + (.id | tostring) | gsub(" "; "")
        title: .buildNumber
        blueprint: '"build"'
        properties:
          status: .status
          result: .result
          queueTime: .queueTime
          startTime: .startTime
          finishTime: .finishTime
          definitionName: .definition.name
          requestedFor: .requestedFor.displayName
          link: ._links.web.href
        relations:
          project: .__project.id | gsub(" "; "")
- kind: pipeline-stage
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: >-
          .__project.id + "-" + (.__buildId | tostring) + "-" + (.id |
          tostring) | gsub(" "; "")
        title: .name
        blueprint: '"pipeline-stage"'
        properties:
          state: .state
          result: .result
          startTime: .startTime
          finishTime: .finishTime
          stageType: .type
        relations:
          project: .__project.id | gsub(" "; "")
          build: (.__project.id + "-" + (.__buildId | tostring)) | gsub(" "; "")
- kind: pipeline-run
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: >-
          .__project.id + "-" + (.__pipeline.id | tostring) + "-" + (.id |
          tostring) | gsub(" "; "")
        blueprint: '"pipeline-run"'
        properties:
          state: .state
          result: .result
          createdDate: .createdDate
          finishedDate: .finishedDate
          pipelineName: .pipeline.name
        relations:
          project: .__project.id | gsub(" "; "")
```

</details>

<MetricsAndSyncStatus/>

## Capabilities

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories, and create entities from them in your software catalog.    
This is done using the `file` kind in your Azure DevOps mapping configuration.

For example, say you want to manage your `package.json` files in Port.  
You will need to create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from `my-project` and `my-other-project`, and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        repos:
          # Replace with your repository's path_with_namespace (e.g., "group/project" or "group/subgroup/project")
          - group/my-project
          - group/my-other-project

```

The `file` kind follows [Azure DevOps's Items Batch File Retrieval](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get-items-batch?view=azure-devops-rest-7.1&tabs=HTTP), adhering to its syntax, limitations, and capabilities.

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button.  
When you open the mapping configuration again, you will see real examples of files fetched from your Azure DevOps organization.

This will help you see what data is available to use in your `jq` expressions.  
Click on the `Test mapping` button to test your mapping against the example data.

The structure of the available data is as follows:
<details>
<summary><b>Available data example (click to expand)</b></summary>

```json showLineNumbers
{
  "file": {
    "path": "integrations/services/configs/package.json",
    "objectId": "a8c19f9dba99f830e0b01d94b3bf17f4fa291b4f",
    "size": 9780,
    "isFolder": false,
    "commitId": "3ac12c7de037d7302a4be5204c9d4c5853ed6e20",
    "encoding": 1252,
    "contentType": "application/octet-stream",
    "fileName": "package.json",
    "extension": "json",
    "vsLink": "vsweb://vs/?Product=Visual_Studio&Gen=2013&EncFormat=UTF8&tfslink=dnN0ZnM6Ly8vR2l0L0xhdW5jaExhdGVzdFZlcnNpb25lZEl0ZW0vJTJmJTdiMDllOTQ5ZjktYWJhYy00OGFmLWE3MzYtNTc0OGJhZjc2OTlhJTdkJTJmJTJmaW50ZWdyYXRpb25zJTJmc2VydmljZXMlMmZjb25maWdzJTJmcGFja2FnZS5qc29uP3Byb2plY3Q9Nzc1NDk0OTItNjk4NC00Mzg5LWEyMDUtZGU0ZDc5NDE0MmFlJnVybD1odHRwcyUzQSUyRiUyRmRldi5henVyZS5jb20lMkZud2FvbWFjJTJG",
    "content": {
      "raw": "{\n  \"name\": \"code-oss-dev\",\n  \"version\": \"1.102.0\",\n  \"distro\": \"969a2e84edcb47f53fbc4f8aa419dc7c062c71cf\",\n  \"author\": {\n    \"name\": \"Microsoft Corporation\"\n  },\n  \"license\": \"MIT\",\n  \"main\": \"./out/main.js\",\n  \"type\": \"module\",\n  \"private\": true,\n  \"scripts\": {\n    \"test\": \"echo Please run any of the test scripts from the scripts folder.\",\n    \"test-browser\": \"npx playwright install && node test/unit/browser/index.js\",\n    \"test-browser-no-install\": \"node test/unit/browser/index.js\",\n    \"test-node\": \"mocha test/unit/node/index.js --delay --ui=tdd --timeout=5000 --exit\",\n    \"test-extension\": \"vscode-test\",\n    \"preinstall\": \"node build/npm/preinstall.js\",\n    \"postinstall\": \"node build/npm/postinstall.js\",\n    \"compile\": \"node ./node_modules/gulp/bin/gulp.js compile\",\n    \"watch\": \"npm-run-all -lp watch-client watch-extensions\",\n    \"watchd\": \"deemon npm run watch\",\n    \"watch-webd\": \"deemon npm run watch-web\",\n    \"kill-watchd\": \"deemon --kill npm run watch\",\n    \"kill-watch-webd\": \"deemon --kill npm run watch-web\",\n    \"restart-watchd\": \"deemon --restart npm run watch\",\n    \"restart-watch-webd\": \"deemon --restart npm run watch-web\",\n    \"watch-client\": \"node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js watch-client\",\n    \"watch-clientd\": \"deemon npm run watch-client\",\n    \"kill-watch-clientd\": \"deemon --kill npm run watch-client\",\n    \"watch-extensions\": \"node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js watch-extensions watch-extension-media\",\n    \"watch-extensionsd\": \"deemon npm run watch-extensions\",\n    \"kill-watch-extensionsd\": \"deemon --kill npm run watch-extensions\",\n    \"precommit\": \"node build/hygiene.js\",\n    \"gulp\": \"node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js\",\n    \"electron\": \"node build/lib/electron\",\n    \"7z\": \"7z\",\n    \"update-grammars\": \"node build/npm/update-all-grammars.mjs\",\n    \"update-localization-extension\": \"node build/npm/update-localization-extension.js\",\n    \"smoketest\": \"node build/lib/preLaunch.js && cd test/smoke && npm run compile && node test/index.js\",\n    \"smoketest-no-compile\": \"cd test/smoke && node test/index.js\",\n    \"download-builtin-extensions\": \"node build/lib/builtInExtensions.js\",\n    \"download-builtin-extensions-cg\": \"node build/lib/builtInExtensionsCG.js\",\n    \"monaco-compile-check\": \"tsc -p src/tsconfig.monaco.json --noEmit\",\n    \"tsec-compile-check\": \"node node_modules/tsec/bin/tsec -p src/tsconfig.tsec.json\",\n    \"vscode-dts-compile-check\": \"tsc -p src/tsconfig.vscode-dts.json && tsc -p src/tsconfig.vscode-proposed-dts.json\",\n    \"valid-layers-check\": \"node build/checker/layersChecker.js && tsc -p build/checker/tsconfig.browser.json && tsc -p build/checker/tsconfig.worker.json && tsc -p build/checker/tsconfig.node.json && tsc -p build/checker/tsconfig.electron-browser.json && tsc -p build/checker/tsconfig.electron-main.json && tsc -p build/checker/tsconfig.electron-utility.json\",\n    \"define-class-fields-check\": \"node build/lib/propertyInitOrderChecker.js && tsc -p src/tsconfig.defineClassFields.json\",\n    \"update-distro\": \"node build/npm/update-distro.mjs\",\n    \"web\": \"echo 'npm run web' is replaced by './scripts/code-server' or './scripts/code-web'\",\n    \"compile-cli\": \"gulp compile-cli\",\n    \"compile-web\": \"node ./node_modules/gulp/bin/gulp.js compile-web\",\n    \"watch-web\": \"node ./node_modules/gulp/bin/gulp.js watch-web\",\n    \"watch-cli\": \"node ./node_modules/gulp/bin/gulp.js watch-cli\",\n    \"eslint\": \"node build/eslint\",\n    \"stylelint\": \"node build/stylelint\",\n    \"playwright-install\": \"npm exec playwright install\",\n    \"compile-build\": \"node ./node_modules/gulp/bin/gulp.js compile-build-with-mangling\",\n    \"compile-extensions-build\": \"node ./node_modules/gulp/bin/gulp.js compile-extensions-build\",\n    \"minify-vscode\": \"node ./node_modules/gulp/bin/gulp.js minify-vscode\",\n    \"minify-vscode-reh\": \"node ./node_modules/gulp/bin/gulp.js minify-vscode-reh\",\n    \"minify-vscode-reh-web\": \"node ./node_modules/gulp/bin/gulp.js minify-vscode-reh-web\",\n    \"hygiene\": \"node ./node_modules/gulp/bin/gulp.js hygiene\",\n    \"core-ci\": \"node ./node_modules/gulp/bin/gulp.js core-ci\",\n    \"core-ci-pr\": \"node ./node_modules/gulp/bin/gulp.js core-ci-pr\",\n    \"extensions-ci\": \"node ./node_modules/gulp/bin/gulp.js extensions-ci\",\n    \"extensions-ci-pr\": \"node ./node_modules/gulp/bin/gulp.js extensions-ci-pr\",\n    \"perf\": \"node scripts/code-perf.js\",\n    \"update-build-ts-version\": \"npm install typescript@next && tsc -p ./build/tsconfig.build.json\"\n  },\n  \"dependencies\": {\n    \"@microsoft/1ds-core-js\": \"^3.2.13\",\n    \"@microsoft/1ds-post-js\": \"^3.2.13\",\n    \"@parcel/watcher\": \"2.5.1\",\n    \"@types/semver\": \"^7.5.8\",\n    \"@vscode/deviceid\": \"^0.1.1\",\n    \"@vscode/iconv-lite-umd\": \"0.7.0\",\n    \"@vscode/policy-watcher\": \"^1.3.2\",\n    \"@vscode/proxy-agent\": \"^0.32.0\",\n    \"@vscode/ripgrep\": \"^1.15.13\",\n    \"@vscode/spdlog\": \"^0.15.2\",\n    \"@vscode/sqlite3\": \"5.1.8-vscode\",\n    \"@vscode/sudo-prompt\": \"9.3.1\",\n    \"@vscode/tree-sitter-wasm\": \"^0.1.4\",\n    \"@vscode/vscode-languagedetection\": \"1.0.21\",\n    \"@vscode/windows-mutex\": \"^0.5.0\",\n    \"@vscode/windows-process-tree\": \"^0.6.0\",\n    \"@vscode/windows-registry\": \"^1.1.0\",\n    \"@xterm/addon-clipboard\": \"^0.2.0-beta.95\",\n    \"@xterm/addon-image\": \"^0.9.0-beta.112\",\n    \"@xterm/addon-ligatures\": \"^0.10.0-beta.112\",\n    \"@xterm/addon-progress\": \"^0.2.0-beta.18\",\n    \"@xterm/addon-search\": \"^0.16.0-beta.112\",\n    \"@xterm/addon-serialize\": \"^0.14.0-beta.112\",\n    \"@xterm/addon-unicode11\": \"^0.9.0-beta.112\",\n    \"@xterm/addon-webgl\": \"^0.19.0-beta.112\",\n    \"@xterm/headless\": \"^5.6.0-beta.112\",\n    \"@xterm/xterm\": \"^5.6.0-beta.112\",\n    \"http-proxy-agent\": \"^7.0.0\",\n    \"https-proxy-agent\": \"^7.0.2\",\n    \"jschardet\": \"3.1.4\",\n    \"kerberos\": \"2.1.1\",\n    \"minimist\": \"^1.2.8\",\n    \"native-is-elevated\": \"0.7.0\",\n    \"native-keymap\": \"^3.3.5\",\n    \"native-watchdog\": \"^1.4.1\",\n    \"node-pty\": \"^1.1.0-beta33\",\n    \"open\": \"^10.1.2\",\n    \"tas-client-umd\": \"0.2.0\",\n    \"v8-inspect-profiler\": \"^0.1.1\",\n    \"vscode-oniguruma\": \"1.7.0\",\n    \"vscode-regexpp\": \"^3.1.0\",\n    \"vscode-textmate\": \"9.2.0\",\n    \"yauzl\": \"^3.0.0\",\n    \"yazl\": \"^2.4.3\"\n  },\n  \"devDependencies\": {\n    \"@playwright/test\": \"^1.52.0\",\n    \"@stylistic/eslint-plugin-ts\": \"^2.8.0\",\n    \"@types/cookie\": \"^0.3.3\",\n    \"@types/debug\": \"^4.1.5\",\n    \"@types/eslint\": \"^9.6.1\",\n    \"@types/gulp-svgmin\": \"^1.2.1\",\n    \"@types/http-proxy-agent\": \"^2.0.1\",\n    \"@types/kerberos\": \"^1.1.2\",\n    \"@types/minimist\": \"^1.2.1\",\n    \"@types/mocha\": \"^9.1.1\",\n    \"@types/node\": \"22.x\",\n    \"@types/sinon\": \"^10.0.2\",\n    \"@types/sinon-test\": \"^2.4.2\",\n    \"@types/trusted-types\": \"^1.0.6\",\n    \"@types/vscode-notebook-renderer\": \"^1.72.0\",\n    \"@types/webpack\": \"^5.28.5\",\n    \"@types/wicg-file-system-access\": \"^2020.9.6\",\n    \"@types/windows-foreground-love\": \"^0.3.0\",\n    \"@types/winreg\": \"^1.2.30\",\n    \"@types/yauzl\": \"^2.10.0\",\n    \"@types/yazl\": \"^2.4.2\",\n    \"@typescript-eslint/utils\": \"^8.8.0\",\n    \"@vscode/gulp-electron\": \"^1.37.1\",\n    \"@vscode/l10n-dev\": \"0.0.35\",\n    \"@vscode/telemetry-extractor\": \"^1.10.2\",\n    \"@vscode/test-cli\": \"^0.0.6\",\n    \"@vscode/test-electron\": \"^2.4.0\",\n    \"@vscode/test-web\": \"^0.0.62\",\n    \"@vscode/v8-heap-parser\": \"^0.1.0\",\n    \"@vscode/vscode-perf\": \"^0.0.19\",\n    \"@webgpu/types\": \"^0.1.44\",\n    \"ansi-colors\": \"^3.2.3\",\n    \"asar\": \"^3.0.3\",\n    \"chromium-pickle-js\": \"^0.2.0\",\n    \"cookie\": \"^0.7.2\",\n    \"copy-webpack-plugin\": \"^11.0.0\",\n    \"css-loader\": \"^6.9.1\",\n    \"debounce\": \"^1.0.0\",\n    \"deemon\": \"^1.13.4\",\n    \"electron\": \"35.6.0\",\n    \"eslint\": \"^9.11.1\",\n    \"eslint-formatter-compact\": \"^8.40.0\",\n    \"eslint-plugin-header\": \"3.1.1\",\n    \"eslint-plugin-jsdoc\": \"^50.3.1\",\n    \"eslint-plugin-local\": \"^6.0.0\",\n    \"event-stream\": \"3.3.4\",\n    \"fancy-log\": \"^1.3.3\",\n    \"file-loader\": \"^6.2.0\",\n    \"glob\": \"^5.0.13\",\n    \"gulp\": \"^4.0.0\",\n    \"gulp-azure-storage\": \"^0.12.1\",\n    \"gulp-bom\": \"^3.0.0\",\n    \"gulp-buffer\": \"0.0.2\",\n    \"gulp-filter\": \"^5.1.0\",\n    \"gulp-flatmap\": \"^1.0.2\",\n    \"gulp-gunzip\": \"^1.0.0\",\n    \"gulp-gzip\": \"^1.4.2\",\n    \"gulp-json-editor\": \"^2.5.0\",\n    \"gulp-plumber\": \"^1.2.0\",\n    \"gulp-rename\": \"^1.2.0\",\n    \"gulp-replace\": \"^0.5.4\",\n    \"gulp-sourcemaps\": \"^3.0.0\",\n    \"gulp-svgmin\": \"^4.1.0\",\n    \"gulp-untar\": \"^0.0.7\",\n    \"husky\": \"^0.13.1\",\n    \"innosetup\": \"^6.4.1\",\n    \"istanbul-lib-coverage\": \"^3.2.0\",\n    \"istanbul-lib-instrument\": \"^6.0.1\",\n    \"istanbul-lib-report\": \"^3.0.0\",\n    \"istanbul-lib-source-maps\": \"^4.0.1\",\n    \"istanbul-reports\": \"^3.1.5\",\n    \"lazy.js\": \"^0.4.2\",\n    \"merge-options\": \"^1.0.1\",\n    \"mime\": \"^1.4.1\",\n    \"minimatch\": \"^3.0.4\",\n    \"mocha\": \"^10.8.2\",\n    \"mocha-junit-reporter\": \"^2.2.1\",\n    \"mocha-multi-reporters\": \"^1.5.1\",\n    \"npm-run-all\": \"^4.1.5\",\n    \"os-browserify\": \"^0.3.0\",\n    \"p-all\": \"^1.0.0\",\n    \"path-browserify\": \"^1.0.1\",\n    \"pump\": \"^1.0.1\",\n    \"rcedit\": \"^1.1.0\",\n    \"rimraf\": \"^2.2.8\",\n    \"sinon\": \"^12.0.1\",\n    \"sinon-test\": \"^3.1.3\",\n    \"source-map\": \"0.6.1\",\n    \"source-map-support\": \"^0.3.2\",\n    \"style-loader\": \"^3.3.2\",\n    \"ts-loader\": \"^9.5.1\",\n    \"ts-node\": \"^10.9.1\",\n    \"tsec\": \"0.2.7\",\n    \"tslib\": \"^2.6.3\",\n    \"typescript\": \"^5.9.0-dev.20250613\",\n    \"typescript-eslint\": \"^8.8.0\",\n    \"util\": \"^0.12.4\",\n    \"webpack\": \"^5.94.0\",\n    \"webpack-cli\": \"^5.1.4\",\n    \"webpack-stream\": \"^7.0.0\",\n    \"xml2js\": \"^0.5.0\",\n    \"yaserver\": \"^0.4.0\"\n  },\n  \"overrides\": {\n    \"node-gyp-build\": \"4.8.1\",\n    \"kerberos@2.1.1\": {\n      \"node-addon-api\": \"7.1.0\"\n    }\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/microsoft/vscode.git\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/microsoft/vscode/issues\"\n  },\n  \"optionalDependencies\": {\n    \"windows-foreground-love\": \"0.5.0\"\n  }\n}",
      "parsed": {
        "name": "code-oss-dev",
        "version": "1.102.0",
        "distro": "969a2e84edcb47f53fbc4f8aa419dc7c062c71cf",
        "author": {
          "name": "Microsoft Corporation"
        },
        "license": "MIT",
        "main": "./out/main.js",
        "type": "module",
        "private": true,
        "scripts": {
          "test": "echo Please run any of the test scripts from the scripts folder.",
          "test-browser": "npx playwright install && node test/unit/browser/index.js",
          "test-browser-no-install": "node test/unit/browser/index.js",
          "test-node": "mocha test/unit/node/index.js --delay --ui=tdd --timeout=5000 --exit",
          "test-extension": "vscode-test",
          "preinstall": "node build/npm/preinstall.js",
          "postinstall": "node build/npm/postinstall.js",
          "compile": "node ./node_modules/gulp/bin/gulp.js compile",
          "watch": "npm-run-all -lp watch-client watch-extensions",
          "watchd": "deemon npm run watch",
          "watch-webd": "deemon npm run watch-web",
          "kill-watchd": "deemon --kill npm run watch",
          "kill-watch-webd": "deemon --kill npm run watch-web",
          "restart-watchd": "deemon --restart npm run watch",
          "restart-watch-webd": "deemon --restart npm run watch-web",
          "watch-client": "node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js watch-client",
          "watch-clientd": "deemon npm run watch-client",
          "kill-watch-clientd": "deemon --kill npm run watch-client",
          "watch-extensions": "node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js watch-extensions watch-extension-media",
          "watch-extensionsd": "deemon npm run watch-extensions",
          "kill-watch-extensionsd": "deemon --kill npm run watch-extensions",
          "precommit": "node build/hygiene.js",
          "gulp": "node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js",
          "electron": "node build/lib/electron",
          "7z": "7z",
          "update-grammars": "node build/npm/update-all-grammars.mjs",
          "update-localization-extension": "node build/npm/update-localization-extension.js",
          "smoketest": "node build/lib/preLaunch.js && cd test/smoke && npm run compile && node test/index.js",
          "smoketest-no-compile": "cd test/smoke && node test/index.js",
          "download-builtin-extensions": "node build/lib/builtInExtensions.js",
          "download-builtin-extensions-cg": "node build/lib/builtInExtensionsCG.js",
          "monaco-compile-check": "tsc -p src/tsconfig.monaco.json --noEmit",
          "tsec-compile-check": "node node_modules/tsec/bin/tsec -p src/tsconfig.tsec.json",
          "vscode-dts-compile-check": "tsc -p src/tsconfig.vscode-dts.json && tsc -p src/tsconfig.vscode-proposed-dts.json",
          "valid-layers-check": "node build/checker/layersChecker.js && tsc -p build/checker/tsconfig.browser.json && tsc -p build/checker/tsconfig.worker.json && tsc -p build/checker/tsconfig.node.json && tsc -p build/checker/tsconfig.electron-browser.json && tsc -p build/checker/tsconfig.electron-main.json && tsc -p build/checker/tsconfig.electron-utility.json",
          "define-class-fields-check": "node build/lib/propertyInitOrderChecker.js && tsc -p src/tsconfig.defineClassFields.json",
          "update-distro": "node build/npm/update-distro.mjs",
          "web": "echo 'npm run web' is replaced by './scripts/code-server' or './scripts/code-web'",
          "compile-cli": "gulp compile-cli",
          "compile-web": "node ./node_modules/gulp/bin/gulp.js compile-web",
          "watch-web": "node ./node_modules/gulp/bin/gulp.js watch-web",
          "watch-cli": "node ./node_modules/gulp/bin/gulp.js watch-cli",
          "eslint": "node build/eslint",
          "stylelint": "node build/stylelint",
          "playwright-install": "npm exec playwright install",
          "compile-build": "node ./node_modules/gulp/bin/gulp.js compile-build-with-mangling",
          "compile-extensions-build": "node ./node_modules/gulp/bin/gulp.js compile-extensions-build",
          "minify-vscode": "node ./node_modules/gulp/bin/gulp.js minify-vscode",
          "minify-vscode-reh": "node ./node_modules/gulp/bin/gulp.js minify-vscode-reh",
          "minify-vscode-reh-web": "node ./node_modules/gulp/bin/gulp.js minify-vscode-reh-web",
          "hygiene": "node ./node_modules/gulp/bin/gulp.js hygiene",
          "core-ci": "node ./node_modules/gulp/bin/gulp.js core-ci",
          "core-ci-pr": "node ./node_modules/gulp/bin/gulp.js core-ci-pr",
          "extensions-ci": "node ./node_modules/gulp/bin/gulp.js extensions-ci",
          "extensions-ci-pr": "node ./node_modules/gulp/bin/gulp.js extensions-ci-pr",
          "perf": "node scripts/code-perf.js",
          "update-build-ts-version": "npm install typescript@next && tsc -p ./build/tsconfig.build.json"
        },
        "dependencies": {
          "@microsoft/1ds-core-js": "^3.2.13",
          "@microsoft/1ds-post-js": "^3.2.13",
          "@parcel/watcher": "2.5.1",
          "@types/semver": "^7.5.8",
          "@vscode/deviceid": "^0.1.1",
          "@vscode/iconv-lite-umd": "0.7.0",
          "@vscode/policy-watcher": "^1.3.2",
          "@vscode/proxy-agent": "^0.32.0",
          "@vscode/ripgrep": "^1.15.13",
          "@vscode/spdlog": "^0.15.2",
          "@vscode/sqlite3": "5.1.8-vscode",
          "@vscode/sudo-prompt": "9.3.1",
          "@vscode/tree-sitter-wasm": "^0.1.4",
          "@vscode/vscode-languagedetection": "1.0.21",
          "@vscode/windows-mutex": "^0.5.0",
          "@vscode/windows-process-tree": "^0.6.0",
          "@vscode/windows-registry": "^1.1.0",
          "@xterm/addon-clipboard": "^0.2.0-beta.95",
          "@xterm/addon-image": "^0.9.0-beta.112",
          "@xterm/addon-ligatures": "^0.10.0-beta.112",
          "@xterm/addon-progress": "^0.2.0-beta.18",
          "@xterm/addon-search": "^0.16.0-beta.112",
          "@xterm/addon-serialize": "^0.14.0-beta.112",
          "@xterm/addon-unicode11": "^0.9.0-beta.112",
          "@xterm/addon-webgl": "^0.19.0-beta.112",
          "@xterm/headless": "^5.6.0-beta.112",
          "@xterm/xterm": "^5.6.0-beta.112",
          "http-proxy-agent": "^7.0.0",
          "https-proxy-agent": "^7.0.2",
          "jschardet": "3.1.4",
          "kerberos": "2.1.1",
          "minimist": "^1.2.8",
          "native-is-elevated": "0.7.0",
          "native-keymap": "^3.3.5",
          "native-watchdog": "^1.4.1",
          "node-pty": "^1.1.0-beta33",
          "open": "^10.1.2",
          "tas-client-umd": "0.2.0",
          "v8-inspect-profiler": "^0.1.1",
          "vscode-oniguruma": "1.7.0",
          "vscode-regexpp": "^3.1.0",
          "vscode-textmate": "9.2.0",
          "yauzl": "^3.0.0",
          "yazl": "^2.4.3"
        },
        "devDependencies": {
          "@playwright/test": "^1.52.0",
          "@stylistic/eslint-plugin-ts": "^2.8.0",
          "@types/cookie": "^0.3.3",
          "@types/debug": "^4.1.5",
          "@types/eslint": "^9.6.1",
          "@types/gulp-svgmin": "^1.2.1",
          "@types/http-proxy-agent": "^2.0.1",
          "@types/kerberos": "^1.1.2",
          "@types/minimist": "^1.2.1",
          "@types/mocha": "^9.1.1",
          "@types/node": "22.x",
          "@types/sinon": "^10.0.2",
          "@types/sinon-test": "^2.4.2",
          "@types/trusted-types": "^1.0.6",
          "@types/vscode-notebook-renderer": "^1.72.0",
          "@types/webpack": "^5.28.5",
          "@types/wicg-file-system-access": "^2020.9.6",
          "@types/windows-foreground-love": "^0.3.0",
          "@types/winreg": "^1.2.30",
          "@types/yauzl": "^2.10.0",
          "@types/yazl": "^2.4.2",
          "@typescript-eslint/utils": "^8.8.0",
          "@vscode/gulp-electron": "^1.37.1",
          "@vscode/l10n-dev": "0.0.35",
          "@vscode/telemetry-extractor": "^1.10.2",
          "@vscode/test-cli": "^0.0.6",
          "@vscode/test-electron": "^2.4.0",
          "@vscode/test-web": "^0.0.62",
          "@vscode/v8-heap-parser": "^0.1.0",
          "@vscode/vscode-perf": "^0.0.19",
          "@webgpu/types": "^0.1.44",
          "ansi-colors": "^3.2.3",
          "asar": "^3.0.3",
          "chromium-pickle-js": "^0.2.0",
          "cookie": "^0.7.2",
          "copy-webpack-plugin": "^11.0.0",
          "css-loader": "^6.9.1",
          "debounce": "^1.0.0",
          "deemon": "^1.13.4",
          "electron": "35.6.0",
          "eslint": "^9.11.1",
          "eslint-formatter-compact": "^8.40.0",
          "eslint-plugin-header": "3.1.1",
          "eslint-plugin-jsdoc": "^50.3.1",
          "eslint-plugin-local": "^6.0.0",
          "event-stream": "3.3.4",
          "fancy-log": "^1.3.3",
          "file-loader": "^6.2.0",
          "glob": "^5.0.13",
          "gulp": "^4.0.0",
          "gulp-azure-storage": "^0.12.1",
          "gulp-bom": "^3.0.0",
          "gulp-buffer": "0.0.2",
          "gulp-filter": "^5.1.0",
          "gulp-flatmap": "^1.0.2",
          "gulp-gunzip": "^1.0.0",
          "gulp-gzip": "^1.4.2",
          "gulp-json-editor": "^2.5.0",
          "gulp-plumber": "^1.2.0",
          "gulp-rename": "^1.2.0",
          "gulp-replace": "^0.5.4",
          "gulp-sourcemaps": "^3.0.0",
          "gulp-svgmin": "^4.1.0",
          "gulp-untar": "^0.0.7",
          "husky": "^0.13.1",
          "innosetup": "^6.4.1",
          "istanbul-lib-coverage": "^3.2.0",
          "istanbul-lib-instrument": "^6.0.1",
          "istanbul-lib-report": "^3.0.0",
          "istanbul-lib-source-maps": "^4.0.1",
          "istanbul-reports": "^3.1.5",
          "lazy.js": "^0.4.2",
          "merge-options": "^1.0.1",
          "mime": "^1.4.1",
          "minimatch": "^3.0.4",
          "mocha": "^10.8.2",
          "mocha-junit-reporter": "^2.2.1",
          "mocha-multi-reporters": "^1.5.1",
          "npm-run-all": "^4.1.5",
          "os-browserify": "^0.3.0",
          "p-all": "^1.0.0",
          "path-browserify": "^1.0.1",
          "pump": "^1.0.1",
          "rcedit": "^1.1.0",
          "rimraf": "^2.2.8",
          "sinon": "^12.0.1",
          "sinon-test": "^3.1.3",
          "source-map": "0.6.1",
          "source-map-support": "^0.3.2",
          "style-loader": "^3.3.2",
          "ts-loader": "^9.5.1",
          "ts-node": "^10.9.1",
          "tsec": "0.2.7",
          "tslib": "^2.6.3",
          "typescript": "^5.9.0-dev.20250613",
          "typescript-eslint": "^8.8.0",
          "util": "^0.12.4",
          "webpack": "^5.94.0",
          "webpack-cli": "^5.1.4",
          "webpack-stream": "^7.0.0",
          "xml2js": "^0.5.0",
          "yaserver": "^0.4.0"
        },
        "overrides": {
          "node-gyp-build": "4.8.1",
          "kerberos@2.1.1": {
            "node-addon-api": "7.1.0"
          }
        },
        "repository": {
          "type": "git",
          "url": "https://github.com/microsoft/vscode.git"
        },
        "bugs": {
          "url": "https://github.com/microsoft/vscode/issues"
        },
        "optionalDependencies": {
          "windows-foreground-love": "0.5.0"
        }
      }
    }
  },
  "repo": {
    "id": "09e949f9-abac-48af-a736-5748baf7699a",
    "name": "first-test",
    "url": "[REDACTED]/77549492-6984-4389-a205-de4d794142ae/_apis/git/repositories/09e949f9-abac-48af-a736-5748baf7699a",
    "project": {
      "id": "77549492-6984-4389-a205-de4d794142ae",
      "name": "first-test",
      "url": "[REDACTED]/_apis/projects/77549492-6984-4389-a205-de4d794142ae",
      "state": "wellFormed",
      "revision": 12,
      "visibility": "public",
      "lastUpdateTime": "2025-05-04T09:34:21.397Z"
    },
    "defaultBranch": "refs/heads/master",
    "size": 1068,
    "remoteUrl": "https://username@dev.azure.com/username/first-test/_git/first-test",
    "sshUrl": "git@ssh.dev.azure.com:v3/username/first-test/first-test",
    "webUrl": "[REDACTED]/first-test/_git/first-test",
    "isDisabled": false,
    "isInMaintenance": false
  }
}
```
</details>
:::



### Create multiple entities from a single file

In some cases, we want to parse a single JSON or YAML file and create multiple entities from it.  
To do this, we can use the `itemsToParse` key in our mapping configuration.

For example, let's say we want to track or manage a project's dependencies in Port.  
We’ll need to create a `package` blueprint, with each entity representing a dependency from a `package.json` file.

The following configuration fetches a `package.json` file from a specific repository and creates an entity for each dependency in the file, based on the `package` blueprint:

The following configuration fetches a `package.json` file from a specific repository and creates an entity for each dependency in the file, based on the `package` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        repos:
          - group/my-project
    port:
      itemsToParse: .file.content.dependencies | to_entries
      entity:
        mappings:
          # Since identifier cannot contain special characters, we are using jq to remove them
          identifier: >-
            .item.key + "_" + if (.item.value | startswith("^")) then
            .item.value[1:] else .item.value end
          title: .item.key + "@" + .item.value
          blueprint: '"package"'
          properties:
            package: .item.key
            version: .item.value
          relations: {}
```

The `itemsToParse` key is used to specify the path to the array of items you want to parse from the file.  
In this case, we are parsing the `dependencies` object from the `package.json` file.

Once the object is parsed, we can use the `item` key to refer to each key-value pair within it — where the key is the dependency name, and the value is the version.

This allows us to create an entity for each dependency dynamically.


### Multi-document YAML files

For multi-document YAML files (a single file containing multiple YAML documents separated by `---`), `.file.content` will not resolve to an object, but to an array of objects.

You can use one of these methods to ingest multi-document YAML files:

1. Use the `itemsToParse` key to create multiple entities from such a file (see example above).
2. Map the result to an `array` property.

:::tip Mixed YAML types
If you have both single-document and multi-document YAML files in your repositories, you can use the `itemsToParse` key like this to handle both cases:

```yaml
itemsToParse: .file.content | if type== "object" then [.] else . end
```
:::

### Example Use Cases

Common scenarios for file mapping include:
- Tracking configuration files (e.g., `deployment.yaml`, `config.json`)
- Monitoring documentation files (e.g., `README.md`, `CONTRIBUTING.md`)
- Tracking infrastructure definitions (e.g., `terraform.tf`, `docker-compose.yml`)

### Best Practices

- **Explicit paths and glob patterns supported**: You can use both explicit file paths relative to the repository root and wildcard/glob patterns (e.g., `*.yaml` or `**/*.json`) to specify which files to ingest.
- **File Types**: Any plain-text or structured file (e.g., `.yaml`, `.json`, `.md`, `.py`) can be ingested.
- **Path Structure**: Only relative paths from the repository root are currently supported. For example:
  - ✅ Correct paths:
    - `README.md`
    - `docs/getting-started.md`
    - `src/config/default.json`
    - `deployment/k8s/production.yaml`
    - `*.json` (glob pattern)
    - `**/*.yaml` (glob pattern)
    - `src/*.json` (glob pattern)
  - ❌ Incorrect paths:
    - `/README.md` (leading slash)
    - `C:/repo/config.json` (absolute path)
    - `../other-repo/file.txt` (parent directory reference)
- **Performance**: For optimal performance, we recommend limiting the number of tracked files per repository.
- **File Tracking**: Each file specified in the configuration will be tracked as a separate entity in Port
- **Change Detection**: Changes to tracked files will be reflected in Port during the next sync

### Limitations

- Only JSON and YAML formats are automatically parsed.  
  Other file formats can be ingested as raw files, however, some special characters in the file (such as `\n`) may be processed and not preserved.

:::tip Learn more
Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get?view=azure-devops-rest-7.1&tabs=HTTP#download) for the Azure DevOps file object structure.
:::

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.


## Let's Test It

This section includes a sample response data from Azure DevOps. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Azure DevOps:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
  "name": "Port Integration",
  "description": "Ocean integration project",
  "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c",
  "state": "wellFormed",
  "revision": 21,
  "_links": {
    "self": {
      "href": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c"
    },
    "collection": {
      "href": "[REDACTED]/_apis/projectCollections/a7db27e5-15a1-4e84-aca5-3de8874e5466"
    },
    "web": {
      "href": "[REDACTED]/Port Integration"
    }
  },
  "visibility": "private",
  "defaultTeam": {
    "id": "da84d6cf-fc6f-4a3a-b9f1-eccaf320589c",
    "name": "Port Integration Team",
    "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c/teams/da84d6cf-fc6f-4a3a-b9f1-eccaf320589c"
  },
  "lastUpdateTime": "2023-11-14T07:24:17.213Z"
}

```

</details>

<details>
<summary> Repository response data</summary>

```json showLineNumbers
{
  "id": "43c319c8-5adc-41f8-8486-745fe2130cd6",
  "name": "final_project_to_project_test",
  "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/git/repositories/43c319c8-5adc-41f8-8486-745fe2130cd6",
  "project": {
    "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "name": "Port Integration",
    "description": "Ocean integration project",
    "url": "[REDACTED]/_apis/projects/fd029361-7854-4cdd-8ace-bb033fca399c",
    "state": "wellFormed",
    "revision": 21,
    "visibility": "private",
    "lastUpdateTime": "2023-11-14T07:24:17.213Z"
  },
  "defaultBranch": "refs/heads/main",
  "size": 724,
  "remoteUrl": "https://isaacpcoffie@dev.azure.com/isaacpcoffie/Port%20Integration/_git/final_project_to_project_test",
  "sshUrl": "git@ssh.dev.azure.com:v3/isaacpcoffie/Port%20Integration/final_project_to_project_test",
  "webUrl": "[REDACTED]/Port%20Integration/_git/final_project_to_project_test",
  "isDisabled": false,
  "isInMaintenance": false
}
```
</details>

<details>
<summary> Work-item response data</summary>

```json showLineNumbers
{
  "id": 1,
  "rev": 2,
  "fields": {
    "System.AreaPath": "Test Project",
    "System.TeamProject": "Test Project",
    "System.IterationPath": "Test Project\\Sprint 1",
    "System.WorkItemType": "Issue",
    "System.State": "To Do",
    "System.Reason": "Added to backlog",
    "System.AssignedTo": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.CreatedDate": "2023-11-14T06:58:16.353Z",
    "System.CreatedBy": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.ChangedDate": "2023-11-14T06:58:32.69Z",
    "System.ChangedBy": {
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm",
      "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
    },
    "System.CommentCount": 0,
    "System.Title": "setup backend infra",
    "System.BoardColumn": "To Do",
    "System.BoardColumnDone": false,
    "Microsoft.VSTS.Common.StateChangeDate": "2023-11-14T06:58:16.353Z",
    "Microsoft.VSTS.Common.Priority": 2,
    "WEF_88F4173AE02645C58988F456A7D828AB_Kanban.Column": "To Do",
    "WEF_88F4173AE02645C58988F456A7D828AB_Kanban.Column.Done": false
  },
  "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/wit/workItems/1",
  "__projectId": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
  "__project": {
    "id": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
    "name": "Test Project",
    "description": "This is a project for Port",
    "url": "[REDACTED]/_apis/projects/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
    "state": "wellFormed",
    "revision": 13,
    "visibility": "private",
    "lastUpdateTime": "2023-11-14T06:56:02.157Z"
  }
}
```
</details>

<details>
<summary> Pipeline response data</summary>

```json showLineNumbers
{
  "_links": {
    "self": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1"
    },
    "web": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_build/definition?definitionId=7"
    }
  },
  "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1",
  "id": 7,
  "revision": 1,
  "name": "health-catalist",
  "folder": "\\",
  "__projectId": "fd029361-7854-4cdd-8ace-bb033fca399c"
}
```
</details>

<details>
<summary> Pull request response data</summary>

```json showLineNumbers
{
  "repository": {
    "id": "075e1870-9a1a-4e3d-a219-6403c2004298",
    "name": "data-analysis",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298",
    "project": {
      "id": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2",
      "name": "Test Project",
      "state": "unchanged",
      "visibility": "unchanged",
      "lastUpdateTime": "0001-01-01T00:00:00"
    }
  },
  "pullRequestId": 1,
  "codeReviewId": 1,
  "status": "active",
  "createdBy": {
    "displayName": "Jaden Kodjo Miles",
    "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "_links": {
      "avatar": {
        "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
      }
    },
    "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "uniqueName": "doe@gmail.com",
    "imageUrl": "[REDACTED]/_api/_common/identityImage?id=40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "descriptor": "msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
  },
  "creationDate": "2023-11-14T06:53:58.355547Z",
  "title": "First Pull Request",
  "description": "some description",
  "sourceRefName": "refs/heads/master",
  "targetRefName": "refs/heads/main",
  "mergeStatus": "conflicts",
  "isDraft": false,
  "mergeId": "6c00586e-ebda-40a3-a09b-66454e4c352d",
  "lastMergeSourceCommit": {
    "commitId": "00ce7ec80fd8ce6cde516432dc9aadf190d5c977",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/commits/00ce7ec80fd8ce6cde516432dc9aadf190d5c977"
  },
  "lastMergeTargetCommit": {
    "commitId": "a5c15f13af7d5f97369163fd76a63502600ada55",
    "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/commits/a5c15f13af7d5f97369163fd76a63502600ada55"
  },
  "reviewers": [
    {
      "reviewerUrl": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/pullRequests/1/reviewers/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "vote": 10,
      "hasDeclined": false,
      "isFlagged": false,
      "displayName": "Jaden Kodjo Miles",
      "url": "https://spsprodcus5.vssps.visualstudio.com/Ac557ed0f-d9a1-4fab-b2fb-95d2f2493d42/_apis/Identities/40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "_links": {
        "avatar": {
          "href": "[REDACTED]/_apis/GraphProfile/MemberAvatars/msa.NDBiZWU1MDItMzBjMS03ZWI1LTk3NTAtZjlkMzVmYTY2ZTZm"
        }
      },
      "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
      "uniqueName": "doe@gmail.com",
      "imageUrl": "[REDACTED]/_api/_common/identityImage?id=40bee502-30c1-6eb5-9750-f9d35fa66e6f"
    }
  ],
  "labels": [
    {
      "id": "68e1d7ae-1784-49fe-8865-2742c25b1993",
      "name": "bitbucket",
      "active": true
    },
    {
      "id": "b11e1538-a984-440c-b756-ddc72e0e786c",
      "name": "auth",
      "active": true
    }
  ],
  "url": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/git/repositories/075e1870-9a1a-4e3d-a219-6403c2004298/pullRequests/1",
  "supportsIterations": true
}
```
</details>





<details>
<summary> Build response data</summary>

```json showLineNumbers
{
  "_links": {
    "self": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/build/builds/123"
    },
    "web": {
      "href": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_build/results?buildId=123"
    }
  },
  "id": 123,
  "buildNumber": "20231114.1",
  "status": "completed",
  "result": "succeeded",
  "queueTime": "2023-11-14T07:00:00.000Z",
  "startTime": "2023-11-14T07:00:15.000Z",
  "finishTime": "2023-11-14T07:05:30.000Z",
  "definition": {
    "id": 7,
    "name": "health-catalist",
    "path": "\\"
  },
  "requestedFor": {
    "displayName": "Jaden Kodjo Miles",
    "id": "40bee502-30c1-6eb5-9750-f9d35fa66e6f",
    "uniqueName": "doe@gmail.com"
  },
  "__project": {
    "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "name": "Port Integration"
  }
}
```

</details>

<details>
<summary> Pipeline-stage response data</summary>

```json showLineNumbers
{
  "id": 1,
  "name": "Build",
  "type": "build",
  "state": "completed",
  "result": "succeeded",
  "startTime": "2023-11-14T07:00:15.000Z",
  "finishTime": "2023-11-14T07:02:45.000Z",
  "__project": {
    "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "name": "Port Integration"
  },
  "__buildId": 123
}
```

</details>

<details>
<summary> Pipeline-run response data</summary>

```json showLineNumbers
{
  "id": 456,
  "state": "completed",
  "result": "succeeded",
  "createdDate": "2023-11-14T07:00:00.000Z",
  "finishedDate": "2023-11-14T07:05:30.000Z",
  "pipeline": {
    "id": 7,
    "name": "health-catalist"
  },
  "__project": {
    "id": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "name": "Port Integration"
  },
  "__pipeline": {
    "id": 7
  }
}
```

</details>




### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "fd029361-7854-4cdd-8ace-bb033fca399c",
  "title": "Port Integration",
  "blueprint": "project",
  "properties": {
    "state": "wellFormed",
    "revision": 21,
    "visibility": "private",
    "defaultTeam": "Port Integration Team",
    "link": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c"
}
  
```

</details>

<details>
<summary> Repository entity in Port </summary>

```json showLineNumbers
{
  "identifier": "portintegration/final_project_to_project_test",
  "title": "final_project_to_project_test",
  "blueprint": "service",
  "properties": {
    "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/git/repositories/43c319c8-5adc-41f8-8486-745fe2130cd6",
    "readme": "<README.md Content>",
    "defaultBranch": "refs/heads/main"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>

<details>
<summary> Work-item entity in Port </summary>

```json showLineNumbers
{
  "identifier": "1",
  "title": "setup backend infra",
  "blueprint": "workItem",
  "properties": {
    "type": "Issue",
    "state": "To Do",
    "effort": null,
    "description": null,
    "link": "[REDACTED]/1b6aba50-6176-4df2-a8e3-f0394ec0b0a2/_apis/wit/workItems/1",
    "reason": "Added to backlog",
    "createdBy": "Jaden Kodjo Miles",
    "changedBy": "Jaden Kodjo Miles",
    "createdDate": "2023-11-14T06:58:16.353Z",
    "changedDate": "2023-11-14T06:58:32.69Z"
  },
  "relations": {
    "project": "1b6aba50-6176-4df2-a8e3-f0394ec0b0a2"
  }
}
```

</details>

<details>
<summary> Pipeline entity in Port </summary>

```json showLineNumbers
{
  "identifier": "7",
  "title": "health-catalist",
  "blueprint": "azureDevopsPipeline",
  "properties": {
    "url": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_apis/pipelines/7?revision=1",
    "revision": 1,
    "folder": "\\"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>

<details>
<summary> Pull request entity in Port </summary>

```json showLineNumbers
{
  "identifier": "TestProject/data-analysis1",
  "blueprint": "azureDevopsPullRequest",
  "properties": {
    "creator": "doe@gmail.com",
    "status": "active",
    "reviewers": [
      "doe@gmail.com"
    ],
    "createdAt": "2023-11-14T06:53:58.355547Z",
    "leadTimeHours": null
  },
  "relations": {
    "repository": "TestProject/data-analysis"
  }
}
```

</details>



<details>
<summary> Build entity in Port </summary>

```json showLineNumbers
{
  "identifier": "fd029361-7854-4cdd-8ace-bb033fca399c-123",
  "title": "20231114.1",
  "blueprint": "build",
  "properties": {
    "status": "completed",
    "result": "succeeded",
    "queueTime": "2023-11-14T07:00:00.000Z",
    "startTime": "2023-11-14T07:00:15.000Z",
    "finishTime": "2023-11-14T07:05:30.000Z",
    "definitionName": "health-catalist",
    "requestedFor": "Jaden Kodjo Miles",
    "link": "[REDACTED]/fd029361-7854-4cdd-8ace-bb033fca399c/_build/results?buildId=123"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>

<details>
<summary> Pipeline-stage entity in Port </summary>

```json showLineNumbers
{
  "identifier": "fd029361-7854-4cdd-8ace-bb033fca399c-123-1",
  "title": "Build",
  "blueprint": "pipeline-stage",
  "properties": {
    "state": "completed",
    "result": "succeeded",
    "startTime": "2023-11-14T07:00:15.000Z",
    "finishTime": "2023-11-14T07:02:45.000Z",
    "stageType": "build"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c",
    "build": "fd029361-7854-4cdd-8ace-bb033fca399c-123"
  }
}
```

</details>

<details>
<summary> Pipeline-run entity in Port </summary>

```json showLineNumbers
{
  "identifier": "fd029361-7854-4cdd-8ace-bb033fca399c-7-456",
  "blueprint": "pipeline-run",
  "properties": {
    "state": "completed",
    "result": "succeeded",
    "createdDate": "2023-11-14T07:00:00.000Z",
    "finishedDate": "2023-11-14T07:05:30.000Z",
    "pipelineName": "health-catalist"
  },
  "relations": {
    "project": "fd029361-7854-4cdd-8ace-bb033fca399c"
  }
}
```

</details>




## Relevant Guides
For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=AzureDevops).

## GitOps

Port's Azure DevOps integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
