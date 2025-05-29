# Local Tools for Port Documentation

This directory contains local tools for bulk operations on Port integration documentation. These tools are separate from the GitHub workflow automation and are designed for local development and bulk updates.

## Bulk Sync Tool

### `bulk_sync_all_integrations.py`

A comprehensive tool that discovers and processes ALL integrations from both repositories:
- **Port-monorepo** (TypeScript configurations) 
- **ocean-test** (YAML configurations)

### Features

- 🔍 **Auto-discovery**: Finds all integrations automatically
- 🔷 **TypeScript Priority**: Uses TypeScript configs when available (no fallback)
- 🔶 **YAML Fallback**: Uses YAML configs when TypeScript doesn't exist
- 📊 **Detailed Reporting**: Shows what was processed, updated, and any failures
- 🎯 **Filtering**: Process only specific integrations
- 🔍 **Dry Run**: Preview what would be processed without making changes

### Installation

```bash
cd port-docs/local-tools
pip install -r requirements.txt
```

### Usage

#### Process ALL integrations:
```bash
python bulk_sync_all_integrations.py
```

#### Dry run (see what would be processed):
```bash
python bulk_sync_all_integrations.py --dry-run
```

#### Process only specific integrations (filter):
```bash
python bulk_sync_all_integrations.py --filter jira
python bulk_sync_all_integrations.py --filter github
```

#### Custom repository paths:
```bash
python bulk_sync_all_integrations.py \
  --port-monorepo-path /path/to/Port-monorepo \
  --ocean-test-path /path/to/ocean-test \
  --docs-repo-path /path/to/port-docs
```

### Default Paths

The tool assumes this directory structure:
```
Named Directory/
├── Port-monorepo/           # TypeScript configs
├── ocean/              # YAML configs  
└── port-docs/               # Documentation (this repo)
    └── local-tools/         # This directory
```

### Example Output

```
🚀 Starting bulk integration documentation sync
📁 Port-monorepo path: ../Port-monorepo
📁 Ocean-test path: ../ocean-test
📁 Docs repo path: .

🔍 Discovering integrations...
📊 Found 45 integrations: argocd, aws, azure, bitbucket-cloud, datadog, ...

🔄 Processing 45 integrations...

🔄 Processing integration: jira
  🔷 TypeScript file found - using TypeScript config (no YAML fallback)
  📄 Extracting TypeScript config from ../Port-monorepo/apps/provision-service/src/core/Integrations/resources/jira.ts
  ✅ Extracted TypeScript config with 3 resources
  📝 Found documentation file: ./docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/jira.md
  📝 Updating YAML section in: jira.md
  ✅ Updated YAML block in jira.md
  ✅ Successfully processed jira

================================================================================
📊 BULK SYNC SUMMARY REPORT
================================================================================
✅ Successfully processed: 42/45 integrations
📝 Documentation updated: 38 integrations
❌ Failed: 3 integrations

📊 Configuration sources:
  🔷 TypeScript: 35 integrations
  🔶 YAML: 7 integrations

📝 Updated documentation for:
  🔷 jira (TypeScript)
  🔷 github (TypeScript)
  🔶 argocd (YAML)
  ...

🎉 Bulk sync completed!
```

### Key Differences from GitHub Workflow

| Feature | GitHub Workflow | Local Bulk Tool |
|---------|----------------|-----------------|
| **Trigger** | Repository changes | Manual execution |
| **Scope** | Changed integrations only | ALL integrations |
| **Environment** | GitHub Actions | Local development |
| **Output** | Creates PR | Direct file updates |
| **Reporting** | Basic logs | Detailed summary report |
| **Filtering** | N/A | Filter by integration name |
| **Dry Run** | N/A | Preview mode available |

### Use Cases

- **Initial Setup**: Bulk update all documentation when setting up the system
- **Migration**: When moving from YAML to TypeScript configurations
- **Validation**: Check which integrations have configs vs documentation
- **Development**: Test changes locally before pushing to GitHub
- **Maintenance**: Periodic bulk updates to ensure consistency 