#!/usr/bin/env python3
"""
Bulk sync script for updating ALL integration documentation locally.
This script:
1. Discovers all integrations from both ocean-test and Port-monorepo
2. For each integration, extracts configuration (TypeScript priority, YAML fallback)
3. Updates the corresponding markdown documentation files
4. Provides detailed reporting on what was processed

This is a LOCAL tool for bulk operations, separate from the GitHub workflow.
"""
import os
import sys
import re
import yaml
import subprocess
import tempfile
import argparse
from typing import Dict, Any, List, Optional, Set
import traceback
from pathlib import Path

# Default paths - can be overridden by command line arguments
DEFAULT_PORT_MONOREPO_PATH = '/Users/jadenmiles/work/PortIO/webhook_learnings/Port-monorepo'
DEFAULT_OCEAN_TEST_PATH = '/Users/jadenmiles/work/PortIO/webhook_learnings/ocean-test'
DEFAULT_DOCS_REPO_PATH = '/Users/jadenmiles/work/PortIO/webhook_learnings/port-docs'

# Mapping from TypeScript file names to ocean-test directory names
TS_TO_OCEAN_NAME_MAPPING = {
    'azureDevops': 'azure-devops',
    'newRelic': 'newrelic',
    'bitbucket': 'bitbucket-cloud',
    # k8sExporter doesn't have ocean-test equivalent, but docs use 'kubernetes'
}

# Mapping from TypeScript file names to documentation file names
TS_TO_DOCS_NAME_MAPPING = {
    'k8sExporter': 'kubernetes',
    'azureDevops': 'azure-devops',
    'newRelic': 'newrelic',
    'bitbucket': 'bitbucket-cloud',
}

def format_yaml_consistently(config: Dict[str, Any]) -> str:
    """Format YAML consistently to avoid unnecessary newlines and formatting differences."""
    
    # Custom YAML representer for multi-line strings
    def represent_multiline_str(dumper, data):
        if '\n' in data:
            # Use literal block scalar (|) for multi-line strings
            return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
        return dumper.represent_scalar('tag:yaml.org,2002:str', data)
    
    # Custom YAML representer for long single-line strings that should be folded
    def represent_long_str(dumper, data):
        # Check for specific patterns that should use folded style
        if (len(data) > 80 and 
            ('type IN (' in data or 'type in (' in data or 
             'AWSEC2INSTANCE' in data or 'AZUREVIRTUALMACHINE' in data)):
            return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='>')
        elif '\n' in data:
            return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
        return dumper.represent_scalar('tag:yaml.org,2002:str', data)
    
    # Create a custom dumper
    class CustomDumper(yaml.SafeDumper):
        pass
    
    # Add the custom representer
    CustomDumper.add_representer(str, represent_long_str)
    
    yaml_str = yaml.dump(
        config, 
        Dumper=CustomDumper,
        default_flow_style=False, 
        sort_keys=False,
        allow_unicode=True,
        width=1000,
        indent=2
    )
    return yaml_str.strip().replace('\r\n', '\n').replace('\r', '\n')

def extract_typescript_config(integration: str, port_monorepo_path: str) -> Optional[Dict[str, Any]]:
    """Extract integration configuration from TypeScript file in Port-monorepo."""
    ts_file = os.path.join(
        port_monorepo_path, 
        "apps", 
        "provision-service",
        "src", 
        "core", 
        "Integrations",
        "resources", 
        f"{integration}.ts"
    )
    
    if not os.path.exists(ts_file):
        return None
    
    print(f"  📄 Extracting TypeScript config from {ts_file}")
    
    try:
        # Use ts_extractor.py from the .github/scripts directory
        ts_extractor_path = os.path.join(os.path.dirname(__file__), '..', '.github', 'scripts', 'ts_extractor.py')
        
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.yaml', delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            result = subprocess.run([
                'python', ts_extractor_path, ts_file, '-o', temp_path
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"  ❌ TypeScript extractor failed: {result.stderr}")
                return None
            
            with open(temp_path, 'r') as f:
                config = yaml.safe_load(f)
            
            if config and config.get('resources'):
                resources = config.get('resources', [])
                print(f"  ✅ Extracted TypeScript config with {len(resources)} resources")
                return config
            else:
                print(f"  ❌ TypeScript config extraction failed - no valid resources found")
                return None
                
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
    except Exception as e:
        print(f"  ❌ Failed to extract TypeScript config: {e}")
        return None

def extract_yaml_config(integration: str, ocean_test_path: str) -> Optional[Dict[str, Any]]:
    """Extract integration configuration from YAML file in ocean-test."""
    yaml_file = os.path.join(
        ocean_test_path,
        "integrations",
        integration,
        ".port",
        "resources",
        "port-app-config.yaml"
    )
    
    if not os.path.exists(yaml_file):
        yaml_file = yaml_file.replace('.yaml', '.yml')
        if not os.path.exists(yaml_file):
            return None
    
    print(f"  📄 Extracting YAML config from {yaml_file}")
    
    try:
        with open(yaml_file, 'r') as f:
            config = yaml.safe_load(f)
        
        if config and config.get('resources'):
            print(f"  ✅ Extracted YAML config with {len(config.get('resources', []))} resources")
            return config
        else:
            print(f"  ⚠️  YAML config extracted but no resources found")
            return None
    except Exception as e:
        print(f"  ❌ Failed to extract YAML config: {e}")
        return None

def get_integration_config(integration: str, port_monorepo_path: str, ocean_test_path: str) -> Optional[Dict[str, Any]]:
    """
    Get integration configuration with priority logic:
    1. If TypeScript file exists, ALWAYS use it (no fallback to YAML)
    2. If TypeScript doesn't exist, use YAML
    """
    
    # Check if TypeScript file exists
    ts_file = os.path.join(
        port_monorepo_path, 
        "apps", 
        "provision-service",
        "src", 
        "core", 
        "Integrations",
        "resources", 
        f"{integration}.ts"
    )
    
    ts_exists = os.path.exists(ts_file)
    
    if ts_exists:
        print(f"  🔷 TypeScript file found - using TypeScript config (no YAML fallback)")
        config = extract_typescript_config(integration, port_monorepo_path)
        if config:
            return config
        else:
            print(f"  ❌ TypeScript file exists but extraction failed")
            return None
    else:
        print(f"  🔶 No TypeScript file found - using YAML config")
        return extract_yaml_config(integration, ocean_test_path)

def find_markdown_file(integration: str, docs_repo_path: str) -> Optional[str]:
    """Find the markdown documentation file for an integration."""
    docs_search_path = os.path.join(docs_repo_path, "docs", "build-your-software-catalog")
    
    # Mapping from integration names to documentation file names
    INTEGRATION_TO_DOCS_MAPPING = {
        'k8sExporter': 'kubernetes',
        'azureDevops': 'azure-devops',
        'newRelic': 'newrelic',
        'octopus': 'octopus-deploy',
    }
    
    # Determine the target filename based on mappings
    if integration in INTEGRATION_TO_DOCS_MAPPING:
        target_filename = f"{INTEGRATION_TO_DOCS_MAPPING[integration]}.md"
        print(f"  🔄 Mapping: {integration} -> {target_filename}")
    else:
        target_filename = f"{integration}.md"
        print(f"  📄 Direct mapping: {integration} -> {target_filename}")
    
    # Search for the target markdown file
    for root, dirs, files in os.walk(docs_search_path):
        for file in files:
            if file == target_filename:
                full_path = os.path.join(root, file)
                print(f"  📝 Found documentation file: {full_path}")
                return full_path
    
    print(f"  ❌ Documentation file not found for integration: {integration} (looking for {target_filename})")
    return None

def update_markdown_yaml_section(md_file: str, config: Dict[str, Any]) -> bool:
    """Update the YAML configuration section in a markdown file."""
    print(f"  📝 Updating YAML section in: {os.path.basename(md_file)}")
    
    with open(md_file, 'r') as f:
        md_content = f.read()
    
    yaml_block = format_yaml_consistently(config)
    
    # Look for the collapsible details section with YAML
    details_pattern = r'(<details>\s*<summary><b>Default mapping configuration \(Click to expand\)</b></summary>\s*```yaml showLineNumbers\s*)(.*?)(\s*```\s*</details>)'
    
    match = re.search(details_pattern, md_content, re.DOTALL)
    
    if match:
        before_yaml = match.group(1)
        current_yaml = match.group(2).strip()
        after_yaml = match.group(3)
        
        if current_yaml != yaml_block:
            updated_md = md_content[:match.start()] + before_yaml + '\n' + yaml_block + '\n' + after_yaml + md_content[match.end():]
            
            with open(md_file, 'w') as f:
                f.write(updated_md)
            print(f"  ✅ Updated YAML block in {os.path.basename(md_file)}")
            return True
        else:
            print(f"  ℹ️  No changes needed - YAML content is identical")
            return False
    else:
        # Look for other YAML patterns
        section_pattern = r'### Default mapping configuration\s*This is the default mapping configuration for the .* integration\.\s*```yaml showLineNumbers?\s*(.*?)\s*```'
        
        match = re.search(section_pattern, md_content, re.DOTALL)
        
        if match:
            current_yaml = match.group(1).strip()
            
            if current_yaml != yaml_block:
                start_pos = match.start(1)
                end_pos = match.end(1)
                updated_md = md_content[:start_pos] + yaml_block + md_content[end_pos:]
                
                with open(md_file, 'w') as f:
                    f.write(updated_md)
                print(f"  ✅ Updated YAML block in {os.path.basename(md_file)}")
                return True
            else:
                print(f"  ℹ️  No changes needed - YAML content is identical")
                return False
        else:
            # Look for flexible YAML code blocks
            flexible_pattern = r'```yaml\s*showLineNumbers?\s*(.*?)\s*```'
            matches = list(re.finditer(flexible_pattern, md_content, re.DOTALL))
            
            for match in matches:
                yaml_content = match.group(1).strip()
                if ('deleteDependentEntities' in yaml_content or 
                    'createMissingRelatedEntities' in yaml_content or 
                    'resources:' in yaml_content or 
                    not yaml_content):
                    
                    if yaml_content != yaml_block:
                        start_pos = match.start(1)
                        end_pos = match.end(1)
                        updated_md = md_content[:start_pos] + yaml_block + md_content[end_pos:]
                        
                        with open(md_file, 'w') as f:
                            f.write(updated_md)
                        print(f"  ✅ Updated YAML block in {os.path.basename(md_file)}")
                        return True
                    else:
                        print(f"  ℹ️  No changes needed - YAML content is identical")
                        return False
    
    print(f"  ⚠️  No suitable YAML block found in {os.path.basename(md_file)}")
    return False

def discover_all_integrations(port_monorepo_path: str, ocean_test_path: str) -> Set[str]:
    """
    Discover all integrations by looking through ocean-test directory first.
    This ensures we process all integrations that have documentation,
    then check if they have TypeScript configs in Port-monorepo.
    """
    integrations = set()
    
    print(f"  🔍 Scanning ocean-test directory: {ocean_test_path}")
    
    # Primary discovery: Find integrations in ocean-test (YAML configs)
    ocean_integrations_dir = os.path.join(ocean_test_path, 'integrations')
    if os.path.isdir(ocean_integrations_dir):
        print(f"  📁 Found integrations directory: {ocean_integrations_dir}")
        for integration_dir in os.listdir(ocean_integrations_dir):
            integration_path = os.path.join(ocean_integrations_dir, integration_dir)
            if os.path.isdir(integration_path):
                config_file = os.path.join(integration_path, '.port', 'resources', 'port-app-config.yaml')
                config_file_yml = os.path.join(integration_path, '.port', 'resources', 'port-app-config.yml')
                if os.path.exists(config_file) or os.path.exists(config_file_yml):
                    integrations.add(integration_dir)
                    print(f"    ✅ Found integration: {integration_dir}")
    else:
        print(f"  ❌ Ocean integrations directory not found: {ocean_integrations_dir}")
    
    # Secondary discovery: Also check for ALL TypeScript integrations in Port-monorepo
    print(f"  🔍 Scanning Port-monorepo for ALL TypeScript integrations: {port_monorepo_path}")
    resources_dir = os.path.join(port_monorepo_path, 'apps', 'provision-service', 'src', 'core', 'Integrations', 'resources')
    if os.path.isdir(resources_dir):
        print(f"  📁 Found TypeScript resources directory: {resources_dir}")
        ts_only_count = 0
        for filename in os.listdir(resources_dir):
            if filename.endswith('.ts') and filename != 'index.ts' and not filename.startswith('_'):
                integration_name = os.path.splitext(filename)[0]
                if integration_name not in integrations:  # Only add if not already found in ocean-test
                    integrations.add(integration_name)
                    ts_only_count += 1
                    print(f"    ✅ Found TypeScript-only integration: {integration_name}")
                else:
                    print(f"    🔷 Found TypeScript integration (also in ocean-test): {integration_name}")
        print(f"  📊 Found {ts_only_count} TypeScript-only integrations")
    else:
        print(f"  ❌ Port-monorepo resources directory not found: {resources_dir}")
    
    return integrations

def process_integration(integration: str, port_monorepo_path: str, ocean_test_path: str, docs_repo_path: str) -> Dict[str, Any]:
    """Process a single integration and return result info."""
    print(f"\n🔄 Processing integration: {integration}")
    
    result = {
        'integration': integration,
        'success': False,
        'config_source': None,
        'doc_updated': False,
        'error': None
    }
    
    try:
        # Get configuration
        config = get_integration_config(integration, port_monorepo_path, ocean_test_path)
        if not config:
            result['error'] = 'No configuration found'
            print(f"  ❌ No configuration found for {integration}")
            return result
        
        # Determine source
        ts_file = os.path.join(port_monorepo_path, "apps", "provision-service", "src", "core", "Integrations", "resources", f"{integration}.ts")
        result['config_source'] = 'TypeScript' if os.path.exists(ts_file) else 'YAML'
        
        # Find markdown file
        md_file = find_markdown_file(integration, docs_repo_path)
        if not md_file:
            result['error'] = 'No documentation file found'
            print(f"  ❌ No documentation file found for {integration}")
            return result
        
        # Update markdown
        doc_updated = update_markdown_yaml_section(md_file, config)
        result['doc_updated'] = doc_updated
        result['success'] = True
        
        print(f"  ✅ Successfully processed {integration}")
        return result
        
    except Exception as e:
        result['error'] = str(e)
        print(f"  ❌ Error processing {integration}: {str(e)}")
        return result

def main():
    """Main function for bulk sync."""
    parser = argparse.ArgumentParser(description='Bulk sync ALL integration configurations to documentation.')
    parser.add_argument('--port-monorepo-path', default=DEFAULT_PORT_MONOREPO_PATH,
                       help='Path to Port-monorepo repository')
    parser.add_argument('--ocean-test-path', default=DEFAULT_OCEAN_TEST_PATH,
                       help='Path to ocean-test repository')
    parser.add_argument('--docs-repo-path', default=DEFAULT_DOCS_REPO_PATH,
                       help='Path to port-docs repository')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be processed without making changes')
    parser.add_argument('--filter', help='Only process integrations matching this substring')
    
    args = parser.parse_args()
    
    print("🚀 Starting bulk integration documentation sync")
    print(f"📁 Port-monorepo path: {args.port_monorepo_path}")
    print(f"📁 Ocean-test path: {args.ocean_test_path}")
    print(f"📁 Docs repo path: {args.docs_repo_path}")
    
    # Discover all integrations
    print("\n🔍 Discovering integrations...")
    integrations = discover_all_integrations(args.port_monorepo_path, args.ocean_test_path)
    
    # Apply filter if specified
    if args.filter:
        integrations = {i for i in integrations if args.filter.lower() in i.lower()}
        print(f"🔍 Filtered to integrations containing '{args.filter}': {len(integrations)} found")
    
    integrations = sorted(list(integrations))
    print(f"📊 Found {len(integrations)} integrations: {', '.join(integrations)}")
    
    if args.dry_run:
        print("\n🔍 DRY RUN - No changes will be made")
        for integration in integrations:
            print(f"  Would process: {integration}")
        return
    
    # Process each integration
    print(f"\n🔄 Processing {len(integrations)} integrations...")
    results = []
    
    for integration in integrations:
        result = process_integration(integration, args.port_monorepo_path, args.ocean_test_path, args.docs_repo_path)
        results.append(result)
    
    # Generate summary report
    print("\n" + "="*80)
    print("📊 BULK SYNC SUMMARY REPORT")
    print("="*80)
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    updated = [r for r in results if r['doc_updated']]
    
    print(f"✅ Successfully processed: {len(successful)}/{len(results)} integrations")
    print(f"📝 Documentation updated: {len(updated)} integrations")
    print(f"❌ Failed: {len(failed)} integrations")
    
    # Source breakdown
    ts_sources = [r for r in successful if r['config_source'] == 'TypeScript']
    yaml_sources = [r for r in successful if r['config_source'] == 'YAML']
    
    print(f"\n📊 Configuration sources:")
    print(f"  🔷 TypeScript: {len(ts_sources)} integrations")
    print(f"  🔶 YAML: {len(yaml_sources)} integrations")
    
    # Show updated integrations
    if updated:
        print(f"\n📝 Updated documentation for:")
        for result in updated:
            source_icon = "🔷" if result['config_source'] == 'TypeScript' else "🔶"
            print(f"  {source_icon} {result['integration']} ({result['config_source']})")
    
    # Show failed integrations
    if failed:
        print(f"\n❌ Failed integrations:")
        for result in failed:
            print(f"  ❌ {result['integration']}: {result['error']}")
    
    print(f"\n🎉 Bulk sync completed!")

if __name__ == "__main__":
    main() 