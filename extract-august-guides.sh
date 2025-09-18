#!/bin/bash

# Extract all guides published in August 2025
# Usage: ./extract-august-guides.sh

METADATA_FILE="src/components/guides-section/guide-metadata.json"

echo "🗓️ Guides published in August 2025:"
echo "====================================" 

# Extract and display guides from August 2025
jq -r '
  to_entries[] | 
  select(.value.creationDate | startswith("2025-08")) | 
  "📝 \(.key) (\(.value.creationDate[:10]))"
' "$METADATA_FILE"

# Count and display total
count=$(jq -r 'to_entries[] | select(.value.creationDate | startswith("2025-08")) | .key' "$METADATA_FILE" | wc -l)
echo ""
echo "📊 Total: $count guides"
