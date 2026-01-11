const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all markdown files
console.log('🔍 Finding markdown files...');
const docsDir = path.join(__dirname, '../docs');
const files = execSync(`find "${docsDir}" -name "*.md" -o -name "*.mdx"`, { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(f => f);

console.log(`📄 Found ${files.length} markdown files\n`);

// Extract all external links
console.log('🔗 Extracting external links...');
const linksByFile = {};
const allLinks = new Set();

// Regex to match markdown links and HTML links
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const htmlLinkRegex = /(?:href|src)=["']([^"']+)["']/g;

files.forEach((file, index) => {
  if (index % 100 === 0) {
    process.stdout.write(`\r   Processing: ${index}/${files.length}`);
  }
  
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const links = [];
    
    // Extract markdown links
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const url = match[2];
      if (url.startsWith('http://') || url.startsWith('https://')) {
        links.push(url);
        allLinks.add(url);
      }
    }
    
    // Extract HTML links
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      const url = match[1];
      if (url.startsWith('http://') || url.startsWith('https://')) {
        links.push(url);
        allLinks.add(url);
      }
    }
    
    if (links.length > 0) {
      linksByFile[file] = links;
    }
  } catch (err) {
    // Skip files that can't be read
  }
});

process.stdout.write(`\r   Processing: ${files.length}/${files.length}\n\n`);

console.log(`✅ Found ${allLinks.size} unique external URLs`);
console.log(`📂 In ${Object.keys(linksByFile).length} files with external links\n`);

// Save to JSON for linkinator
const linksArray = Array.from(allLinks).sort();
const outputFile = path.join(__dirname, '../external-links.txt');
fs.writeFileSync(outputFile, linksArray.join('\n'));

console.log(`💾 Saved links to: external-links.txt`);
console.log(`\n🚀 Ready to check links!\n`);

// Also output summary
const linkMap = {};
linksArray.forEach(link => {
  const filesWithLink = [];
  for (const [file, links] of Object.entries(linksByFile)) {
    if (links.includes(link)) {
      filesWithLink.push(file.replace(docsDir + '/', 'docs/'));
    }
  }
  linkMap[link] = filesWithLink;
});

fs.writeFileSync(
  path.join(__dirname, '../external-links-map.json'),
  JSON.stringify({ links: linkMap, totalLinks: linksArray.length }, null, 2)
);

