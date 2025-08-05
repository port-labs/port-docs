#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the guides (we'll need to temporarily make consts.js compatible with Node.js)
const constsPath = path.join(__dirname, '../src/components/guides-section/consts.js');
let constsContent = fs.readFileSync(constsPath, 'utf8');

// Convert ES6 imports and exports to require-compatible format for this script
constsContent = constsContent.replace(/import guideMetadata from '\.\/guide-metadata\.json';\s*/, '');
constsContent = constsContent.replace(/export const/g, 'const');

// Remove the enhancedAvailableGuides section that references guideMetadata
constsContent = constsContent.replace(/\/\/ Enhance guides with metadata[\s\S]*$/, '');
constsContent += '\nmodule.exports = { availableGuides };';

// Write temporary file and require it
const tempPath = path.join(__dirname, 'temp-consts.js');
fs.writeFileSync(tempPath, constsContent);
const { availableGuides } = require(tempPath);

// Clean up temp file
fs.unlinkSync(tempPath);

const DAYS_TO_CONSIDER_NEW = 60; // Consider guides new if created within 60 days

function getFileCreationDate(guidePath) {
  try {
    // Convert guide link to actual file path
    const fileName = guidePath.replace('/guides/all/', '') + '.md';
    const filePath = `docs/guides/all/${fileName}`;
    
    // Get creation date using git
    const gitCommand = `git log --diff-filter=A --follow --format=%aI -1 "${filePath}"`;
    const dateString = execSync(gitCommand, { encoding: 'utf8' }).trim();
    
    if (!dateString) {
      console.warn(`No creation date found for ${filePath}`);
      return null;
    }
    
    return new Date(dateString);
  } catch (error) {
    console.warn(`Error getting creation date for ${guidePath}: ${error.message}`);
    return null;
  }
}

function isGuideNew(creationDate) {
  if (!creationDate) return false;
  
  const now = new Date();
  const daysDiff = (now - creationDate) / (1000 * 60 * 60 * 24);
  return daysDiff <= DAYS_TO_CONSIDER_NEW;
}

// Generate metadata for all guides
const guideMetadata = {};
let newGuideCount = 0;

console.log('Generating guide metadata...');

availableGuides.forEach(guide => {
  const creationDate = getFileCreationDate(guide.link);
  const isNew = isGuideNew(creationDate);
  
  guideMetadata[guide.link] = {
    creationDate: creationDate ? creationDate.toISOString() : null,
    isNew
  };
  
  if (isNew) {
    newGuideCount++;
    console.log(`📝 NEW: ${guide.title}`);
  }
});

// Write metadata to JSON file
const outputPath = path.join(__dirname, '../src/components/guides-section/guide-metadata.json');
fs.writeFileSync(outputPath, JSON.stringify(guideMetadata, null, 2));

console.log(`\n✅ Generated metadata for ${availableGuides.length} guides`);
console.log(`🆕 Found ${newGuideCount} new guides (created within ${DAYS_TO_CONSIDER_NEW} days)`);
console.log(`📄 Metadata saved to: ${outputPath}`); 