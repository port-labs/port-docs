#!/usr/bin/env python3
"""
Synchronize integration configurations to Markdown documentation files.
This script can handle two source types:
1. TypeScript integration configurations from Port-monorepo (priority)
2. YAML integration configurations from ocean-test (fallback)

The script:
1. Extracts integration configurations from source repositories
2. Finds corresponding markdown documentation files
3. Updates the YAML blocks in the documentation with the extracted configurations
"""
import os
import sys
import re
import yaml
import difflib
import argparse
from typing import Dict, Any, List, Union, Optional
import traceback

# Add the current directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Default paths - can be overridden by environment variables
PORT_MONOREPO_PATH = os.environ.get('PORT_MONOREPO_PATH', '../Port-monorepo')
OCEAN_TEST_PATH = os.environ.get('OCEAN_TEST_PATH', '../ocean-test')
DOCS_REPO_PATH = os.environ.get('DOCS_REPO_PATH', '../port-docs')

def format_yaml_consistently(config: Dict[str, Any]) -> str:
    """
    Format YAML consistently to avoid unnecessary newlines and formatting differences.
    This ensures that identical content produces identical YAML strings.
    """
    # Use consistent YAML dump settings
    yaml_str = yaml.dump(
        config, 
        default_flow_style=False, 
        sort_keys=False,
        allow_unicode=True,
        width=1000,  # Prevent line wrapping
        indent=2
    )
    
    # Ensure consistent line endings and remove any trailing whitespace
    yaml_str = yaml_str.strip()
    
    # Normalize line endings to \n
    yaml_str = yaml_str.replace('\r\n', '\n').replace('\r', '\n')
    
    return yaml_str

def extract_typescript_config(integration: str) -> Optional[Dict[str, Any]]:
    """Extract integration configuration from TypeScript file in Port-monorepo."""
    ts_file = os.path.join(
        PORT_MONOREPO_PATH, 
        "apps", 
        "provision-service",
        "src", 
        "core", 
        "Integrations",
        "resources", 
        f"{integration}.ts"
    )
    
    print(f"[INFO] Looking for TypeScript config: {ts_file}")
    
    if not os.path.exists(ts_file):
        print(f"[INFO] TypeScript file not found: {ts_file}")
        return None
    
    print(f"[INFO] Extracting TypeScript config from {ts_file}")
    
    try:
        # Use the working CLI approach from ts_extractor
        import subprocess
        import tempfile
        
        # Create a temporary file to capture the output
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.yaml', delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # Run the CLI version which works correctly
            # Get the path to ts_extractor.py in the same directory as this script
            ts_extractor_path = os.path.join(current_dir, 'ts_extractor.py')
            result = subprocess.run([
                'python', ts_extractor_path, ts_file, '-o', temp_path
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"[ERROR] TypeScript extractor failed: {result.stderr}")
                return None
            
            # Read the extracted YAML
            import yaml
            with open(temp_path, 'r') as f:
                config = yaml.safe_load(f)
            
            if config and config.get('resources'):
                resources = config.get('resources', [])
                print(f"[SUCCESS] Extracted TypeScript config with {len(resources)} resources")
                return config
            else:
                print(f"[ERROR] TypeScript config extraction failed - no valid resources found")
                return None
                
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
    except Exception as e:
        print(f"[ERROR] Failed to extract TypeScript config: {e}")
        # When TypeScript extraction fails, we should raise an error, not fallback
        raise Exception(f"TypeScript extraction failed for {integration}: {e}")

def extract_yaml_config(integration: str) -> Optional[Dict[str, Any]]:
    """Extract integration configuration from YAML file in ocean-test."""
    yaml_file = os.path.join(
        OCEAN_TEST_PATH,
        "integrations",
        integration,
        ".port",
        "resources",
        "port-app-config.yaml"
    )
    
    print(f"[INFO] Looking for YAML config: {yaml_file}")
    
    if not os.path.exists(yaml_file):
        # Try .yml extension
        yaml_file = yaml_file.replace('.yaml', '.yml')
        if not os.path.exists(yaml_file):
            print(f"[INFO] YAML file not found: {yaml_file}")
            return None
    
    print(f"[INFO] Extracting YAML config from {yaml_file}")
    
    try:
        with open(yaml_file, 'r') as f:
            config = yaml.safe_load(f)
        
        if config and config.get('resources'):
            print(f"[SUCCESS] Extracted YAML config with {len(config.get('resources', []))} resources")
            return config
        else:
            print(f"[WARNING] YAML config extracted but no resources found")
            return None
    except Exception as e:
        print(f"[ERROR] Failed to extract YAML config: {e}")
        return None

def get_integration_config(integration: str, source_type: str = "auto") -> Optional[Dict[str, Any]]:
    """
    Get integration configuration with priority logic:
    1. If TypeScript file exists, ALWAYS use it (no fallback to YAML)
    2. If TypeScript doesn't exist, use YAML
    3. If both exist, TypeScript takes priority
    """
    
    print(f"[INFO] Getting config for {integration} (source type: {source_type})")
    
    # First, check if TypeScript file exists
    ts_file = os.path.join(
        PORT_MONOREPO_PATH, 
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
        # TypeScript file exists - ALWAYS use it, no fallback
        print(f"[INFO] TypeScript file found for {integration} - using TypeScript (no YAML fallback)")
        try:
            config = extract_typescript_config(integration)
            if config:
                print(f"[SUCCESS] Using TypeScript config for {integration}")
                return config
            else:
                print(f"[ERROR] TypeScript extraction failed for {integration}")
                raise Exception(f"TypeScript file exists but extraction failed for {integration}")
        except Exception as e:
            print(f"[ERROR] TypeScript processing failed: {e}")
            raise e
    else:
        # No TypeScript file - use YAML
        print(f"[INFO] No TypeScript file found for {integration}, using YAML config")
        config = extract_yaml_config(integration)
        if config:
            print(f"[SUCCESS] Using YAML config for {integration}")
            return config
        else:
            print(f"[ERROR] No YAML config found for {integration}")
            return None

def find_markdown_file(integration: str) -> Optional[str]:
    """
    Find the markdown documentation file for an integration.
    Searches recursively in the docs directory for {integration}.md files.
    
    Special cases:
    - k8sExporter -> kubernetes.md
    """
    docs_search_path = os.path.join(DOCS_REPO_PATH, "docs", "build-your-software-catalog")
    
    # Handle special case mappings
    if integration == "k8sExporter":
        target_filename = "kubernetes.md"
        print(f"[INFO] Special case: {integration} -> {target_filename}")
    else:
        target_filename = f"{integration}.md"
    
    # Search for the target markdown file
    for root, dirs, files in os.walk(docs_search_path):
        for file in files:
            if file == target_filename:
                full_path = os.path.join(root, file)
                print(f"[INFO] Found documentation file: {full_path}")
                return full_path
    
    print(f"[ERROR] Documentation file not found for integration: {integration} (looking for {target_filename})")
    return None

def update_markdown_yaml_section(md_file: str, config: Dict[str, Any]) -> bool:
    """
    Update the YAML configuration section in a markdown file.
    Returns True if changes were made, False otherwise.
    """
    print(f"[INFO] Updating YAML section in: {md_file}")
    
    # Read existing markdown content
    with open(md_file, 'r') as f:
        md_content = f.read()
    
    # Convert config to YAML string with consistent formatting
    yaml_block = format_yaml_consistently(config)
    
    # Look for the collapsible details section with YAML
    # This pattern matches the new format with <details> and <summary>
    details_pattern = r'(<details>\s*<summary><b>Default mapping configuration \(Click to expand\)</b></summary>\s*```yaml showLineNumbers\s*)(.*?)(\s*```\s*</details>)'
    
    match = re.search(details_pattern, md_content, re.DOTALL)
    
    if match:
        # Replace the existing YAML block in the details section
        before_yaml = match.group(1)
        current_yaml = match.group(2).strip()
        after_yaml = match.group(3)
        
        # Check if the YAML content has actually changed
        if current_yaml != yaml_block:
            # Replace with new YAML, ensuring proper formatting
            updated_md = md_content[:match.start()] + before_yaml + '\n' + yaml_block + '\n' + after_yaml + md_content[match.end():]
            
            with open(md_file, 'w') as f:
                f.write(updated_md)
            print(f"[SUCCESS] Updated YAML block in {md_file}")
            return True
        else:
            print(f"[INFO] No changes needed for {md_file} - YAML content is identical")
            return False
    else:
        # Look for the older section pattern
        section_pattern = r'### Default mapping configuration\s*This is the default mapping configuration for the .* integration\.\s*```yaml showLineNumbers?\s*(.*?)\s*```'
        
        match = re.search(section_pattern, md_content, re.DOTALL)
        
        if match:
            # Replace the existing YAML block
            current_yaml = match.group(1).strip()
            
            # Check if the YAML content has actually changed
            if current_yaml != yaml_block:
                start_pos = match.start(1)
                end_pos = match.end(1)
                
                # Replace with new YAML, ensuring proper formatting
                updated_md = md_content[:start_pos] + yaml_block + md_content[end_pos:]
                
                with open(md_file, 'w') as f:
                    f.write(updated_md)
                print(f"[SUCCESS] Updated YAML block in {md_file}")
                return True
            else:
                print(f"[INFO] No changes needed for {md_file} - YAML content is identical")
                return False
        else:
            # Look for a more flexible YAML code block pattern
            # This handles both formats: content on same line and content on new line
            flexible_pattern = r'```yaml\s*showLineNumbers?\s*(.*?)\s*```'
            
            # Find all YAML blocks and update the one that contains actual config content
            matches = list(re.finditer(flexible_pattern, md_content, re.DOTALL))
            
            for match in matches:
                yaml_content = match.group(1).strip()
                # Look for YAML blocks that contain integration config content
                if ('deleteDependentEntities' in yaml_content or 
                    'createMissingRelatedEntities' in yaml_content or 
                    'resources:' in yaml_content or 
                    not yaml_content):  # Also update empty blocks
                    
                    # Check if the YAML content has actually changed
                    if yaml_content != yaml_block:
                        start_pos = match.start(1)
                        end_pos = match.end(1)
                        
                        # Replace with new YAML, ensuring proper formatting
                        updated_md = md_content[:start_pos] + yaml_block + md_content[end_pos:]
                        
                        with open(md_file, 'w') as f:
                            f.write(updated_md)
                        print(f"[SUCCESS] Updated YAML block in {md_file}")
                        return True
                    else:
                        print(f"[INFO] No changes needed for {md_file} - YAML content is identical")
                        return False
    
    print(f"[WARNING] No suitable YAML block found in {md_file}")
    return False

def process_integration(integration: str, source_type: str = "auto") -> bool:
    """
    Process a single integration:
    1. Get configuration (TypeScript priority, YAML fallback)
    2. Find corresponding markdown file
    3. Update the YAML section in the markdown
    """
    print(f"[INFO] Processing integration: {integration} (source type: {source_type})")
    
    # Get configuration with priority logic
    config = get_integration_config(integration, source_type)
    if not config:
        print(f"[ERROR] No configuration found for {integration}")
        return False
    
    # Find the markdown documentation file
    md_file = find_markdown_file(integration)
    if not md_file:
        print(f"[ERROR] No documentation file found for {integration}")
        return False
    
    # Update the markdown file
    if update_markdown_yaml_section(md_file, config):
        print(f"[SUCCESS] Updated documentation for {integration}")
        return True
    else:
        print(f"[INFO] No changes made to documentation for {integration}")
        return True

def main():
    """Main function for the script."""
    parser = argparse.ArgumentParser(description='Sync integration configurations to documentation.')
    parser.add_argument('--integrations', nargs='+', help='List of integrations to process')
    parser.add_argument('--source-type', choices=['ocean-test', 'port-monorepo', 'auto'], 
                       default='auto', help='Source type for determining priority')
    parser.add_argument('--all', action='store_true', help='Process all integrations')
    args = parser.parse_args()
    
    # Determine which integrations to process
    integrations = []
    
    if args.integrations:
        integrations = args.integrations
        print(f"[INFO] Processing specified integrations: {', '.join(integrations)}")
    elif args.all:
        # Find all integrations by looking for TypeScript files
        resources_dir = os.path.join(PORT_MONOREPO_PATH, 'apps', 'provision-service', 'src', 'core', 'Integrations', 'resources')
        if os.path.isdir(resources_dir):
            for filename in os.listdir(resources_dir):
                if filename.endswith('.ts') and filename != 'index.ts' and not filename.startswith('_'):
                    integrations.append(os.path.splitext(filename)[0])
        
        # Also find integrations in ocean-test
        ocean_integrations_dir = os.path.join(OCEAN_TEST_PATH, 'integrations')
        if os.path.isdir(ocean_integrations_dir):
            for integration_dir in os.listdir(ocean_integrations_dir):
                integration_path = os.path.join(ocean_integrations_dir, integration_dir)
                if os.path.isdir(integration_path) and integration_dir not in integrations:
                    # Check if it has a port-app-config file
                    config_file = os.path.join(integration_path, '.port', 'resources', 'port-app-config.yaml')
                    config_file_yml = os.path.join(integration_path, '.port', 'resources', 'port-app-config.yml')
                    if os.path.exists(config_file) or os.path.exists(config_file_yml):
                        integrations.append(integration_dir)
        
        integrations = sorted(list(set(integrations)))  # Remove duplicates and sort
        print(f"[INFO] Processing all integrations found: {len(integrations)} integrations")
    else:
        print("[ERROR] No integrations specified. Use --integrations or --all")
        sys.exit(1)
    
    print(f"[INFO] Will update documentation for {len(integrations)} integrations: {', '.join(integrations)}")
    print(f"[INFO] Source type: {args.source_type}")
    
    # Process each integration
    success_count = 0
    for integration in integrations:
        try:
            if process_integration(integration, args.source_type):
                success_count += 1
        except Exception as e:
            print(f"[ERROR] Error processing {integration}: {str(e)}")
            traceback.print_exc()
    
    print(f"[INFO] Successfully processed {success_count}/{len(integrations)} integrations")

if __name__ == "__main__":
    main() 