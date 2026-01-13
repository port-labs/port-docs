const fs = require('fs');
const path = require('path');

const resultsFile = path.join(__dirname, '../link-check-results.json');

if (!fs.existsSync(resultsFile)) {
  console.log('❌ No link check results found. Run link checker first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

// URLs to skip (not considered broken)
const skipPatterns = [
  /localhost/,
  /127\.0\.0\.1/,
  /[a-f0-9]{40}/, // Git commit hashes
  /example\.com/,
  /^build\// // Internal file paths (if checking build)
];

// Filter out URLs we want to skip
const filteredLinks = results.links.filter(link => {
  return !skipPatterns.some(pattern => pattern.test(link.url));
});

const brokenLinks = filteredLinks.filter(link => link.state === 'BROKEN');
const skippedLinks = results.links.filter(link => link.state === 'SKIPPED');
const okLinks = filteredLinks.filter(link => link.state === 'OK');

// Separate 403 errors (auth required, not actually broken)
const authRequiredLinks = brokenLinks.filter(link => link.status === 403);
const actuallyBrokenLinks = brokenLinks.filter(link => link.status !== 403);

const internalLinks = results.links.length - filteredLinks.length;

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║           LINK CHECK RESULTS                              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log(`📊 External Links Summary:`);
console.log(`   ✅ Working: ${okLinks.length}`);
console.log(`   ❌ Broken (404, 500, etc.): ${actuallyBrokenLinks.length}`);
console.log(`   🔒 Auth required (403): ${authRequiredLinks.length}`);
console.log(`   📝 Total external links checked: ${filteredLinks.length}\n`);

console.log(`📦 Internal Links (not checked):`);
console.log(`   🔗 Pages, images, CSS, JS files: ${internalLinks}\n`);

if (actuallyBrokenLinks.length === 0 && authRequiredLinks.length === 0) {
  console.log('🎉 No broken links found! All external URLs are working.\n');
  process.exit(0);
}

console.log('═══════════════════════════════════════════════════════════\n');

// Display actually broken links (404, 500, etc.)
if (actuallyBrokenLinks.length > 0) {
  console.log(`❌ BROKEN LINKS (${actuallyBrokenLinks.length}):\n`);

  const brokenByUrl = {};
  actuallyBrokenLinks.forEach(link => {
    if (!brokenByUrl[link.url]) {
      brokenByUrl[link.url] = {
        status: link.status,
        foundIn: link.foundIn || []
      };
    } else {
      // Merge foundIn arrays if URL appears multiple times
      brokenByUrl[link.url].foundIn = [...new Set([...brokenByUrl[link.url].foundIn, ...(link.foundIn || [])])];
    }
  });

  Object.entries(brokenByUrl).forEach(([url, data], index) => {
    console.log(`${index + 1}. ${url}`);
    console.log(`   Status: ${data.status || 'Unknown'}`);
    console.log(`   Found in ${data.foundIn.length} page(s):`);
    
    const pagesToShow = data.foundIn.slice(0, 5);
    pagesToShow.forEach(parent => {
      const cleanPath = parent
        .replace(/^.*\/build\//, '/')
        .replace(/^.*\/docs\//, 'docs/')
        .replace(/\/index\.html$/, '/');
      console.log(`   - ${cleanPath}`);
    });
    
    if (data.foundIn.length > 5) {
      console.log(`   ... and ${data.foundIn.length - 5} more page(s)`);
    }
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

// Display auth-required links (403) separately
if (authRequiredLinks.length > 0) {
  console.log(`🔒 AUTH REQUIRED - 403 ERRORS (${authRequiredLinks.length}):\n`);
  console.log(`These URLs require authentication and may not be actually broken:\n`);

  const authByUrl = {};
  authRequiredLinks.forEach(link => {
    if (!authByUrl[link.url]) {
      authByUrl[link.url] = {
        status: link.status,
        foundIn: link.foundIn || []
      };
    } else {
      // Merge foundIn arrays if URL appears multiple times
      authByUrl[link.url].foundIn = [...new Set([...authByUrl[link.url].foundIn, ...(link.foundIn || [])])];
    }
  });

  Object.entries(authByUrl).forEach(([url, data], index) => {
    console.log(`${index + 1}. ${url}`);
    console.log(`   Found in ${data.foundIn.length} page(s):`);
    
    const pagesToShow = data.foundIn.slice(0, 3);
    pagesToShow.forEach(parent => {
      const cleanPath = parent
        .replace(/^.*\/build\//, '/')
        .replace(/^.*\/docs\//, 'docs/')
        .replace(/\/index\.html$/, '/');
      console.log(`   - ${cleanPath}`);
    });
    
    if (data.foundIn.length > 3) {
      console.log(`   ... and ${data.foundIn.length - 3} more page(s)`);
    }
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

if (actuallyBrokenLinks.length > 0) {
  console.log('💡 Next steps:');
  console.log('   1. Review and fix the broken links above');
  console.log('   2. Check if URLs have moved (look for redirects)');
  console.log('   3. Consider removing or replacing dead links');
  console.log('   4. Re-run: npm run check-links\n');
}

if (authRequiredLinks.length > 0 && actuallyBrokenLinks.length === 0) {
  console.log('💡 Note about 403 errors:');
  console.log('   These links require authentication and may be working fine.');
  console.log('   Review them to ensure they are intentionally behind auth.\n');
}

// Save a detailed report
const reportFile = path.join(__dirname, '../link-check-report.txt');

let brokenSection = '';
if (actuallyBrokenLinks.length > 0) {
  const brokenByUrl = {};
  actuallyBrokenLinks.forEach(link => {
    if (!brokenByUrl[link.url]) {
      brokenByUrl[link.url] = { status: link.status, foundIn: link.foundIn || [] };
    } else {
      brokenByUrl[link.url].foundIn = [...new Set([...brokenByUrl[link.url].foundIn, ...(link.foundIn || [])])];
    }
  });

  brokenSection = `
BROKEN LINKS (404, 500, etc.)
------------------------------
${Object.entries(brokenByUrl).map(([url, data], index) => `
${index + 1}. ${url}
   Status: ${data.status || 'Unknown'}
   Found in ${data.foundIn.length} page(s):
${data.foundIn.map(parent => `   - ${parent}`).join('\n')}
`).join('\n')}`;
}

let authSection = '';
if (authRequiredLinks.length > 0) {
  const authByUrl = {};
  authRequiredLinks.forEach(link => {
    if (!authByUrl[link.url]) {
      authByUrl[link.url] = { status: link.status, foundIn: link.foundIn || [] };
    } else {
      authByUrl[link.url].foundIn = [...new Set([...authByUrl[link.url].foundIn, ...(link.foundIn || [])])];
    }
  });

  authSection = `
AUTH REQUIRED - 403 ERRORS
--------------------------
These URLs require authentication and may not be actually broken:
${Object.entries(authByUrl).map(([url, data], index) => `
${index + 1}. ${url}
   Found in ${data.foundIn.length} page(s):
${data.foundIn.map(parent => `   - ${parent}`).join('\n')}
`).join('\n')}`;
}

const reportContent = `
LINK CHECK REPORT
Generated: ${new Date().toISOString()}

EXTERNAL LINKS SUMMARY
----------------------
✅ Working: ${okLinks.length}
❌ Broken (404, 500, etc.): ${actuallyBrokenLinks.length}
🔒 Auth required (403): ${authRequiredLinks.length}
📝 Total external links checked: ${filteredLinks.length}

INTERNAL LINKS (not checked)
-----------------------------
🔗 Pages, images, CSS, JS files: ${internalLinks}
${brokenSection}
${authSection}
`;

fs.writeFileSync(reportFile, reportContent);
console.log(`📄 Detailed report saved to: link-check-report.txt\n`);

// Clean up temporary files
const tempFiles = [
  path.join(__dirname, '../link-check-results.json'),
  path.join(__dirname, '../external-links.txt'),
  path.join(__dirname, '../external-links-map.json')
];

tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
});

// Exit with error code if actually broken links found (not auth-required)
process.exit(actuallyBrokenLinks.length > 0 ? 1 : 0);

