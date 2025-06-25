#!/usr/bin/env python3

import os
import re
import yaml
import traceback
import json
from typing import Dict, Any, Optional, List, OrderedDict
import json5
import sys

# Debug flag
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

def debug_log(message):
    """Print debug message if DEBUG is enabled"""
    if DEBUG:
        print(f"[DEBUG] {message}")

def safe_yaml_load(content):
    """Safely load YAML content, handling tab characters and other issues"""
    content_normalized = content.replace('\t', '    ')
    try:
        return yaml.safe_load(content_normalized)
    except yaml.YAMLError as e:
        print(f"[ERROR] YAML parsing error: {e}")
        # Try with even more aggressive normalization
        content_super_normalized = re.sub(r'[ \t]+', ' ', content_normalized)
        try:
            return yaml.safe_load(content_super_normalized)
        except yaml.YAMLError as e2:
            print(f"[ERROR] YAML parsing still failed after aggressive normalization: {e2}")
            return None

def safe_yaml_dump(data):
    """Safely dump data as YAML with consistent formatting"""
    try:
        # Use consistent YAML dump settings to match sync_docs.py
        yaml_str = yaml.dump(
            data, 
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
    except Exception as e:
        print(f"[ERROR] Failed to dump YAML: {e}")
        return None

def parse_ts_value(value_text):
    """Parse a TypeScript value into its Python equivalent."""
    # Normalize whitespace
    value_text = value_text.replace('\t', '    ').strip()
    
    # Empty value
    if not value_text:
        return None
        
    # Object
    if value_text.startswith('{') and value_text.endswith('}'):
        return parse_ts_object(value_text)
        
    # Array
    if value_text.startswith('[') and value_text.endswith(']'):
        return parse_ts_array(value_text)
        
    # Special case for blueprint values with nested quotes like '"k8s_cluster"'
    # This handles the pattern of a string with quotes inside it
    if (value_text.startswith('"') and value_text.endswith('"') and len(value_text) > 2):
        inner_content = value_text[1:-1]
        if inner_content.startswith('"') and inner_content.endswith('"'):
            # This is a string with quotes inside, like '"jiraUser"'
            return value_text
    
    # String with single quotes
    if value_text.startswith("'") and value_text.endswith("'"):
        inner_content = value_text[1:-1]
        # Check if this is a JQ expression (starts with field access or contains operators)
        if (inner_content.startswith('.') or 
            any(char in inner_content for char in ['|', '(', ')', '[', ']', '+', '-', '>', '<', '!', '=', '/'])):
            # This is a JQ expression - clean up null coalescing operators
            cleaned_expression = clean_jq_expression(inner_content)
            return cleaned_expression
        else:
            # This is a regular string
            return value_text
    
    # String with double quotes
    if value_text.startswith('"') and value_text.endswith('"'):
        inner_content = value_text[1:-1]
        # Check if this is a JQ expression (starts with field access or contains operators)
        if (inner_content.startswith('.') or 
            any(char in inner_content for char in ['|', '(', ')', '[', ']', '+', '-', '>', '<', '!', '=', '/'])):
            # This is a JQ expression - clean up null coalescing operators
            cleaned_expression = clean_jq_expression(inner_content)
            return cleaned_expression
        else:
            # This is a regular string
            return value_text
    
    # Boolean
    if value_text.lower() in ['true', 'false']:
        return value_text.lower() == 'true'
        
    # Number
    try:
        if '.' in value_text:
            return float(value_text)
        else:
            return int(value_text)
    except ValueError:
        pass
    
    # Default: return as string (might be a complex expression)
    # Clean up JQ expressions that don't have quotes
    if any(char in value_text for char in ['.', '|', '(', ')', '[', ']', '+', '-', '>', '<', '!', '=']):
        return clean_jq_expression(value_text)
    
    return value_text

def clean_jq_expression(expression):
    """Clean up JQ expressions by removing null coalescing operators."""
    # Remove trailing null coalescing operators like ' // ""'
    import re
    
    # Pattern to match JQ null coalescing operators at the end
    # This matches patterns like: ' // ""', ' // null', ' // empty', etc.
    # Handle both single and double quotes, with or without extra spaces
    cleaned = re.sub(r'\s*//\s*""\s*$', '', expression)
    cleaned = re.sub(r'\s*//\s*null\s*$', '', cleaned)
    cleaned = re.sub(r'\s*//\s*empty\s*$', '', cleaned)
    
    return cleaned.strip()

def find_matching_quote(text, quote_char):
    """Find the position of the matching quote character."""
    pos = 1  # Start after the opening quote
    
    while pos < len(text):
        char = text[pos]
        
        # Skip escaped quotes
        if char == '\\' and pos + 1 < len(text) and text[pos+1] == quote_char:
            pos += 2
            continue
            
        # Found the matching quote
        if char == quote_char:
            return pos
            
        pos += 1
        
    # No matching quote found
    return -1

def extract_balanced_text(text, open_char, close_char):
    """
    Extract text between balanced opening and closing characters.
    Returns the extracted text (without the outer brackets) and the position after the closing character.
    """
    if not text.startswith(open_char):
        return None, 0
        
    level = 0
    in_string = False
    string_char = None
    pos = 0
    
    while pos < len(text):
        char = text[pos]
        
        # Handle string boundaries
        if char in ('"', "'") and (pos == 0 or text[pos-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                
        # Skip everything inside strings
        if in_string:
            pos += 1
            continue
            
        # Count opening and closing characters
        if char == open_char:
            level += 1
        elif char == close_char:
            level -= 1
            
        # Found the matching closing character
        if level == 0:
            return text[1:pos], pos + 1
            
        pos += 1
        
    # No matching closing character found
    return None, 0

def parse_ts_array(array_text):
    """Parse a TypeScript array into a Python list."""
    # Normalize whitespace
    array_text = array_text.replace('\t', '    ')
    
    # Strip whitespace and check array format
    content = array_text.strip()
    if not content.startswith('[') or not content.endswith(']'):
        if DEBUG:
            print(f"Warning: Not a valid array text: {content[:40]}...")
        return []
    
    # Extract array content between brackets
    content = content[1:-1].strip()
    
    # Handle empty array
    if not content:
        return []
    
    # Process each array item
    items = []
    item_start = 0
    level = 0  # Track nested structures
    in_string = False
    string_char = None
    
    i = 0
    while i < len(content):
        char = content[i]
        
        # Handle strings - don't count braces/brackets inside strings
        if char in ('"', "'") and (i == 0 or content[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
        
        # Skip processing if inside a string
        if not in_string:
            # Track nesting level
            if char == '{' or char == '[':
                level += 1
            elif char == '}' or char == ']':
                level -= 1
            
            # Item separator at the top level
            if char == ',' and level == 0:
                item_text = content[item_start:i].strip()
                if item_text:  # Skip empty entries
                    items.append(parse_ts_value(item_text))
                item_start = i + 1
        
        i += 1
    
    # Process the last item
    if item_start < len(content):
        item_text = content[item_start:].strip()
        if item_text:
            items.append(parse_ts_value(item_text))
    
    debug_log(f"Parsed array with {len(items)} items")
    return items

def parse_ts_object(text):
    """
    Parse a TypeScript object into a Python dictionary.
    This handles TypeScript-specific syntax like trailing commas, string literals, etc.
    """
    try:
        debug_log(f"Parsing TypeScript object of length {len(text)}")
        
        # Replace TypeScript syntax with valid JSON
        processed_text = text
        
        # Replace single quotes with double quotes, but be careful with JSON strings
        processed_text = re.sub(r'(?<!")\'(?!")', '"', processed_text)
        
        # Clean up trailing commas which are valid in TypeScript but not in JSON
        processed_text = re.sub(r',\s*([}\]])', r'\1', processed_text)
        
        # Replace TypeScript template literals with string literals
        processed_text = re.sub(r'`(.*?)`', r'"\1"', processed_text)
        
        # Handle TypeScript specific syntax for function expressions
        processed_text = re.sub(r':\s*\([^)]*\)\s*=>\s*({[^}]*})', r': \1', processed_text)
        
        # Try to parse as JSON
        try:
            debug_log("Attempting to parse as JSON")
            return json.loads(processed_text)
        except json.JSONDecodeError as e:
            debug_log(f"JSON parsing failed: {e}")
            
            # If direct parsing fails, try to manually extract key-value pairs
            debug_log("Falling back to manual key-value extraction")
            result = {}
            
            # Extract key-value pairs for simple structures
            pattern = r'(["\w]+)\s*:\s*([^,{}[\]]+|{[^{}]*}|\[[^\[\]]*\])'
            for match in re.finditer(pattern, processed_text):
                key = match.group(1).strip('"')
                value = match.group(2).strip()
                
                # Handle nested objects
                if value.startswith('{') and value.endswith('}'):
                    nested_value = parse_ts_object(value)
                    if nested_value:
                        result[key] = nested_value
                # Handle arrays
                elif value.startswith('[') and value.endswith(']'):
                    array_items = []
                    # Extract array items
                    array_content = value[1:-1].strip()
                    if array_content:
                        # Split array content by commas, but respect nested objects
                        items = []
                        item_start = 0
                        level = 0
                        for i, char in enumerate(array_content):
                            if char == '{':
                                level += 1
                            elif char == '}':
                                level -= 1
                            elif char == ',' and level == 0:
                                items.append(array_content[item_start:i].strip())
                                item_start = i + 1
                        # Add the last item
                        if item_start < len(array_content):
                            items.append(array_content[item_start:].strip())
                        
                        # Parse each item
                        for item in items:
                            if item.startswith('{') and item.endswith('}'):
                                parsed_item = parse_ts_object(item)
                                if parsed_item:
                                    array_items.append(parsed_item)
                            else:
                                # Try to parse as JSON or use raw value
                                try:
                                    array_items.append(json.loads(item))
                                except:
                                    array_items.append(item)
                    
                    result[key] = array_items
                # Handle simple values
                else:
                    # Try to convert to appropriate type
                    if value.lower() == 'true':
                        result[key] = True
                    elif value.lower() == 'false':
                        result[key] = False
                    elif value.isdigit():
                        result[key] = int(value)
                    else:
                        # Handle string literals
                        value = value.strip('"\'')
                        result[key] = value
            
            return result
    except Exception as e:
        debug_log(f"Error parsing TypeScript object: {e}")
        return None

def reorder_resource_fields(resource: Dict[str, Any]) -> Dict[str, Any]:
    """Reorder fields within a resource to match the desired order."""
    ordered_resource = {}
    
    # Set order of fields for resources - consistent across all integrations
    # This ensures 'kind' comes first, followed by 'selector', then 'port'
    field_order = ['kind', 'selector', 'port']
    
    # Add fields in the defined order
    for field in field_order:
        if field in resource:
            ordered_resource[field] = resource[field]
    
    # Add any remaining fields not in the order (unlikely, but for completeness)
    for field in resource:
        if field not in ordered_resource:
            ordered_resource[field] = resource[field]
    
    # Now reorder the port section if it exists
    if 'port' in ordered_resource:
        port = ordered_resource['port']
        ordered_port = {}
        
        # Check if this is a direct mappings pattern or entity pattern
        if 'mappings' in port and 'entity' not in port:
            # This is the direct mappings pattern
            ordered_port['mappings'] = reorder_mappings(port['mappings'])
            
            # Add all other fields after mappings
            for field in port:
                if field != 'mappings':
                    ordered_port[field] = port[field]
        else:
            # This is the entity pattern
            port_field_order = ['entity', 'itemsToParse']
            
            # Add port fields in defined order
            for field in port_field_order:
                if field in port:
                    if field == 'entity' and 'mappings' in port['entity']:
                        # Handle entity.mappings
                        entity = port['entity'].copy()
                        entity['mappings'] = reorder_mappings(port['entity']['mappings'])
                        ordered_port[field] = entity
                    else:
                        ordered_port[field] = port[field]
            
            # Add remaining port fields
            for field in port:
                if field not in ordered_port:
                    ordered_port[field] = port[field]
        
        # Replace with ordered port
        ordered_resource['port'] = ordered_port
    
    return ordered_resource

def reorder_mappings(mappings: Dict[str, Any]) -> Dict[str, Any]:
    """Reorder fields within mappings to match the desired order and omit empty properties/relations."""
    ordered_mappings = {}
    
    # Set desired order for mappings - consistent across all integrations
    field_order = ['identifier', 'title', 'blueprint', 'properties', 'relations']
    
    # Add fields in the defined order
    for field in field_order:
        if field in mappings:
            # For properties and relations, only add if non-empty
            if field == 'properties' and (not mappings[field] or (isinstance(mappings[field], dict) and not mappings[field])):
                continue
            if field == 'relations' and (not mappings[field] or (isinstance(mappings[field], dict) and not mappings[field])):
                continue
            ordered_mappings[field] = mappings[field]
    
    # Add any remaining fields not in the order
    for field in mappings:
        if field not in ordered_mappings:
            ordered_mappings[field] = mappings[field]
    
    return ordered_mappings

def merge_all_configs(configs):
    """
    Merge all integration configurations from a single TypeScript file,
    regardless of flowKey values, into a single config.
    
    This handles the case where a file might have multiple export objects.
    """
    if not configs or not isinstance(configs, list) or len(configs) == 0:
        return {
            "deleteDependentEntities": True,
            "createMissingRelatedEntities": True,
            "enableMergeEntity": True,
            "resources": []
        }
    
    # Start with the first config as our base
    merged_config = configs[0].copy() if isinstance(configs[0], dict) else {}
    merged_config.setdefault("deleteDependentEntities", True)
    merged_config.setdefault("createMissingRelatedEntities", True)
    merged_config.setdefault("enableMergeEntity", True)
    merged_config.setdefault("resources", [])
    
    # For each additional config, merge its resources
    for config in configs[1:]:
        if not isinstance(config, dict):
            continue
        
        # Copy top-level properties if not already set
        for key in ["deleteDependentEntities", "createMissingRelatedEntities", "enableMergeEntity"]:
            if key in config and key not in merged_config:
                merged_config[key] = config[key]
        
        # Add all resources
        if "resources" in config and isinstance(config["resources"], list):
            merged_config["resources"].extend(config["resources"])
    
    return merged_config

def extract_all_configs_from_file(content):
    """
    Extract all integration configurations from a TypeScript file.
    Returns a list of all configuration objects found.
    """
    configs = []
    
    # Check for export default [ { ... integrationConfig: { ... } ... } ]
    export_array_pattern = r'export\s+default\s*\[([\s\S]*?)\];?'
    array_match = re.search(export_array_pattern, content)
    if array_match:
        array_content = array_match.group(1)
        debug_log(f"Found export default array of {len(array_content)} chars")
        
        # Extract each object in the array
        level = 0
        current_start = -1
        
        for i, char in enumerate(array_content):
            if char == '{' and level == 0:
                current_start = i
                level = 1
            elif char == '{':
                level += 1
            elif char == '}':
                level -= 1
                if level == 0 and current_start != -1:
                    # Found a complete object
                    obj_text = array_content[current_start:i+1]
                    debug_log(f"Extracted object of {len(obj_text)} chars")
                    
                    # Look for integrationConfig within this object
                    integration_pattern = r'integrationConfig\s*:\s*(\{[^]*?\})(?:,|\s*})'
                    integration_match = re.search(integration_pattern, obj_text)
                    if integration_match:
                        config_text = integration_match.group(1)
                        debug_log(f"Found integrationConfig of {len(config_text)} chars")
                        
                        # Parse the integration config
                        config = parse_ts_object(config_text)
                        if config:
                            configs.append(config)
    
    # If we didn't find configs in the array format, try other formats
    if not configs:
        # Look for standalone integrationConfig object
        config_pattern = r'integrationConfig\s*:\s*(\{.*?\})'
        for match in re.finditer(config_pattern, content, re.DOTALL):
            config_text = match.group(1)
            config = parse_ts_object(config_text)
            if config:
                configs.append(config)
    
    # If we still don't have configs, look for objects containing resources arrays
    if not configs:
        # Look for the resources array pattern
        resources_pattern = r'resources\s*:\s*\[([\s\S]*?)\]'
        for match in re.finditer(resources_pattern, content):
            # Find the object containing this resources array
            start_pos = match.start()
            
            # Look backward for the start of the containing object
            level = 0
            obj_start = -1
            
            for i in range(start_pos, -1, -1):
                char = content[i]
                if char == '}':
                    level += 1
                elif char == '{':
                    level -= 1
                    if level == -1:  # Found the outermost opening brace
                        obj_start = i
                        break
            
            if obj_start != -1:
                # Look forward to find the end of the object
                level = 1  # Starting with one opening brace
                for i in range(obj_start + 1, len(content)):
                    char = content[i]
                    if char == '{':
                        level += 1
                    elif char == '}':
                        level -= 1
                        if level == 0:  # Found the matching closing brace
                            # Extract the complete object
                            obj_text = content[obj_start:i+1]
                            
                            # Create a basic integration config
                            config = {
                                'deleteDependentEntities': True,
                                'createMissingRelatedEntities': True,
                                'enableMergeEntity': True
                            }
                            
                            # Parse the resources section
                            resources_match = re.search(resources_pattern, obj_text)
                            if resources_match:
                                resources_text = '[' + resources_match.group(1) + ']'
                                resources_array = parse_ts_array(resources_text)
                                if resources_array:
                                    config['resources'] = resources_array
                                    configs.append(config)
    
    # If we still couldn't find anything, do a last-ditch effort to find any resources array
    if not configs:
        print("[DEBUG] Last-ditch effort to find resources array")
        # Get raw text of all resource arrays
        direct_resources_pattern = r'resources\s*:\s*\[([\s\S]*?)\]'
        resource_blocks = []
        
        for match in re.finditer(direct_resources_pattern, content, re.DOTALL):
            resources_text = match.group(1)
            # Create a well-formed JSON array with the resources
            resources_array = '[' + resources_text + ']'
            
            try:
                # Try to normalize the resources array for parsing
                resources_array = resources_array.replace("'", '"')
                resources_array = re.sub(r',\s*(\]|$|\})', r'\1', resources_array)
                
                # Parse each resource object in the array
                level = 0
                resource_start = -1
                resource_objects = []
                
                for i, char in enumerate(resources_array):
                    if char == '{' and level == 0:
                        resource_start = i
                        level = 1
                    elif char == '{':
                        level += 1
                    elif char == '}':
                        level -= 1
                        if level == 0 and resource_start != -1:
                            # Found a complete resource object
                            resource_text = resources_array[resource_start:i+1]
                            resource_obj = parse_ts_object(resource_text)
                            if resource_obj:
                                resource_objects.append(resource_obj)
                
                if resource_objects:
                    # Create a minimal config with these resources
                    config = {
                        'deleteDependentEntities': True,
                        'createMissingRelatedEntities': True,
                        'enableMergeEntity': True,
                        'resources': resource_objects
                    }
                    configs.append(config)
            except Exception as e:
                print(f"[ERROR] Failed to parse resources array: {e}")
    
    return configs

def process_config_dict(config_dict):
    """Process a config dictionary into an ordered final result."""
    if not config_dict:
        return None
        
    # Debug: Show the extracted TS object
    if DEBUG:
        print(f"[INFO] Processing config dict with keys: {list(config_dict.keys())}")
    
    # Extract basic properties
    processed_dict = {}
    
    # Extract deleteDependentEntities, createMissingRelatedEntities, enableMergeEntity
    for prop in ['deleteDependentEntities', 'createMissingRelatedEntities', 'enableMergeEntity']:
        if prop in config_dict:
            processed_dict[prop] = config_dict[prop]
    
    # Process resources array
    if 'resources' in config_dict:
        resources = []
        for resource_dict in config_dict['resources']:
            try:
                # Apply field ordering
                ordered_resource = reorder_resource_fields(resource_dict)
                if ordered_resource.get('kind'):
                    debug_log(f"Processed resource of kind: {ordered_resource.get('kind')}")
                resources.append(ordered_resource)
                if DEBUG:
                    print(f"[INFO] Processed resource: {ordered_resource.get('kind', 'unknown')}")
            except Exception as e:
                if DEBUG:
                    print(f"[ERROR] Error processing resource object: {e}")
                    if DEBUG:
                        traceback.print_exc()
        
        processed_dict['resources'] = resources
        if DEBUG:
            print(f"[INFO] Processed {len(resources)} resource objects")
    else:
        processed_dict['resources'] = []
        if DEBUG:
            print("[WARNING] No resources found in the config_dict")
    
    # Debug: Show the processed structure
    if DEBUG:
        print(f"[INFO] Processed dict with top-level keys: {', '.join(processed_dict.keys())}")
        if 'resources' in processed_dict:
            print(f"[INFO] Found {len(processed_dict['resources'])} resources")
    
    # Create an ordered dictionary for the final result
    ordered_config = {}
    # Define the order of top-level keys - match exactly the order in expected files
    top_level_order = ['deleteDependentEntities', 'createMissingRelatedEntities', 'enableMergeEntity', 'resources']
    
    # Add fields in the desired order
    for key in top_level_order:
        if key in processed_dict:
            ordered_config[key] = processed_dict[key]
    
    # Add any remaining fields not explicitly ordered
    for key in processed_dict:
        if key not in ordered_config:
            ordered_config[key] = processed_dict[key]
            
    return ordered_config

def extract_ts_config(ts_file_path: str) -> Dict[str, Any]:
    """
    Main function to extract TypeScript configuration.
    Takes a path to a TypeScript file and returns a dictionary of the extracted configuration.
    """
    try:
        # Only print if DEBUG is enabled
        if DEBUG:
            print(f"[INFO] Reading TypeScript file: {ts_file_path}")
        
        with open(ts_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract all configurations from the file
        if DEBUG:
            print(f"[INFO] Extracting all configurations from TypeScript")
        
        configs = extract_all_configs_from_file(content)
        
        if configs:
            if DEBUG:
                print(f"[SUCCESS] Found {len(configs)} configurations in {ts_file_path}")
            
            # Merge all configs into a single one
            merged_config = merge_all_configs(configs)
            
            # Reorder fields for consistency
            if DEBUG:
                print(f"[INFO] Merging and reordering {len(configs)} configs")
            
            return process_config_dict(merged_config)
        else:
            if DEBUG:
                print(f"[WARNING] No configurations found in {ts_file_path}")
            # Return a minimal valid structure as fallback
            return {
                "deleteDependentEntities": True,
                "createMissingRelatedEntities": True,
                "enableMergeEntity": True,
                "resources": []
            }
            
    except Exception as e:
        if DEBUG:
            print(f"[ERROR] Error processing {ts_file_path}: {e}")
            traceback.print_exc()
        # Return a minimal valid structure as fallback
        return {
            "deleteDependentEntities": True,
            "createMissingRelatedEntities": True,
            "enableMergeEntity": True,
            "resources": []
        }

def extract_integration_config_text(text):
    """
    Locate and extract the text of the integrationConfig object or array literal from the given file content.
    Returns the substring of `text` that represents the integrationConfig object/array (including braces/brackets).
    Raises ValueError if not found or braces/brackets are not balanced.
    """
    # Pattern to find "export const integrationConfig ... = {"
    pattern = re.compile(r"\bexport\s+const\s+integrationConfig\b[^=]*=\s*{", re.IGNORECASE)
    match = pattern.search(text)
    start_idx = None
    end_char = None
    if match:
        # The pattern ends just before the brace, find the actual brace position
        start_idx = text.find('{', match.end() - 1)
        end_char = '}'
    else:
        # Try pattern for default export of an object
        pattern_def = re.compile(r"\bexport\s+default\s*{", re.IGNORECASE)
        match_def = pattern_def.search(text)
        if match_def:
            start_idx = text.find('{', match_def.end() - 1)
            end_char = '}'
        else:
            # Try pattern for default export of an array
            pattern_arr = re.compile(r"\bexport\s+default\s*\[", re.IGNORECASE)
            match_arr = pattern_arr.search(text)
            if match_arr:
                start_idx = text.find('[', match_arr.end() - 1)
                end_char = ']'
    if start_idx is None or start_idx == -1 or end_char is None:
        raise ValueError("Could not find integrationConfig object or array in the file.")
    # Use brace/bracket counting to find the matching closing brace/bracket
    open_char = text[start_idx]
    close_char = end_char
    count = 0
    end_idx = None
    for i, ch in enumerate(text[start_idx:], start=start_idx):
        if ch == open_char:
            count += 1
        elif ch == close_char:
            count -= 1
            if count == 0:
                end_idx = i
                break
    if end_idx is None:
        raise ValueError(f"Braces/brackets for integrationConfig {open_char}...{close_char} are not balanced.")
    # Extract object/array text including the outer braces/brackets
    return text[start_idx:end_idx+1]

def parse_config_to_dict(config_text):
    """
    Parse the extracted integration config text (TypeScript object literal) into a Python dictionary.
    Utilizes json5 to handle JSON5/JavaScript syntax (comments, single quotes, trailing commas, etc.).
    """
    try:
        data = json5.loads(config_text)
        return data
    except Exception as e:
        # Provide a clear error if parsing fails
        raise ValueError(f"Failed to parse integration config: {e}")

def dict_to_yaml(data):
    """
    Convert the Python data structure (dict/list nested structure) into a YAML formatted string.
    """
    try:
        # Use consistent YAML dump settings to match sync_docs.py
        yaml_str = yaml.dump(
            data, 
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
    except Exception as e:
        raise RuntimeError(f"Failed to convert config to YAML: {e}")

def clean_empty_properties_relations(obj):
    """
    Recursively remove empty 'properties' and 'relations' keys from dicts/lists.
    """
    if isinstance(obj, dict):
        keys_to_delete = []
        for k, v in obj.items():
            if k in ('properties', 'relations') and (v is None or v == {} or v == []):
                keys_to_delete.append(k)
            else:
                clean_empty_properties_relations(v)
        for k in keys_to_delete:
            del obj[k]
    elif isinstance(obj, list):
        for item in obj:
            clean_empty_properties_relations(item)

def extract_resources_block(data):
    """
    Given the parsed config (list or dict), extract the resources array and return the final YAML dict.
    If it's a list of configurations, merge all resources together.
    """
    all_resources = []
    
    # If it's a list, look for integrationConfig/resources in each item and merge them
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and 'integrationConfig' in item:
                config = item['integrationConfig']
                resources = config.get('resources', [])
                if resources:
                    all_resources.extend(resources)
    # If it's a dict, look for resources directly
    elif isinstance(data, dict):
        if 'resources' in data:
            all_resources = data['resources']
    
    return {
        'deleteDependentEntities': True,
        'createMissingRelatedEntities': True,
        'enableMergeEntity': True,
        'resources': all_resources
    }

def process_file(file_path, output_path=None):
    """
    Process a single TypeScript file: 
    read it, extract integrationConfig, parse to dict, and output YAML either to stdout or a file.
    """
    # Read the TypeScript file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        raise IOError(f"Error reading file '{file_path}': {e}")
    if not content:
        raise ValueError(f"File '{file_path}' is empty.")
    
    # Extract the integration config object text from file content
    config_text = extract_integration_config_text(content)
    
    # Clean up any trailing syntax outside the object (e.g., remove trailing semicolon if present)
    config_text = config_text.strip()
    if config_text.endswith(';'):
        config_text = config_text[:-1]
    
    # Parse the config text into a Python dictionary
    config_data = parse_config_to_dict(config_text)
    
    # Extract the resources block and merge multiple configs if needed
    yaml_data = extract_resources_block(config_data)
    
    # Clean JQ expressions recursively
    clean_jq_expressions_recursive(yaml_data)
    
    # Clean empty properties/relations recursively
    clean_empty_properties_relations(yaml_data)
    
    # Convert the dictionary to YAML format
    yaml_str = dict_to_yaml(yaml_data)
    
    # Output the YAML to the specified file or stdout
    if output_path:
        try:
            with open(output_path, 'w', encoding='utf-8') as outfile:
                outfile.write(yaml_str)
        except Exception as e:
            raise IOError(f"Error writing YAML output to file '{output_path}': {e}")
    else:
        sys.stdout.write(yaml_str)

def clean_jq_expressions_recursive(obj):
    """
    Recursively traverse the data structure and clean JQ expressions in string values.
    """
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, str):
                # Check if this looks like a JQ expression and clean it
                if any(char in value for char in ['.', '|', '(', ')', '[', ']', '+', '-', '>', '<', '!', '=', '/']):
                    obj[key] = clean_jq_expression(value)
            else:
                clean_jq_expressions_recursive(value)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if isinstance(item, str):
                # Check if this looks like a JQ expression and clean it
                if any(char in item for char in ['.', '|', '(', ')', '[', ']', '+', '-', '>', '<', '!', '=', '/']):
                    obj[i] = clean_jq_expression(item)
            else:
                clean_jq_expressions_recursive(item)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Convert a TypeScript IntegrationConfigProvisionDefinition export to YAML.")
    parser.add_argument("input", help="Path to the TypeScript file containing the integrationConfig export.")
    parser.add_argument("-o", "--output", help="Optional output file path. If not provided, YAML is printed to stdout.")
    args = parser.parse_args()
    try:
        process_file(args.input, args.output)
    except Exception as err:
        # Print the error to stderr and exit with a non-zero code for failure
        sys.stderr.write(f"Error: {err}\n")
        sys.exit(1) 