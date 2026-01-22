const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const linksFile = path.join(__dirname, '../external-links.txt');
const mapFile = path.join(__dirname, '../external-links-map.json');
const outputFile = path.join(__dirname, '../link-check-results.json');

// Links to exclude from checking (example/placeholder URLs in documentation)
const excludedLinks = [
  'https://github.com/your-org/your-repo/blob/main/docs/guide.md',
  'https://wiki.company.com',
];

if (!fs.existsSync(linksFile)) {
  console.error('❌ external-links.txt not found. Run extract-links-from-markdown.js first.');
  process.exit(1);
}

const allLinks = fs.readFileSync(linksFile, 'utf-8').trim().split('\n').filter(l => l);
const linkMap = JSON.parse(fs.readFileSync(mapFile, 'utf-8')).links;

const links = allLinks.filter(link => !excludedLinks.includes(link));

console.log(`🔗 Checking ${links.length} external URLs...\n`);

const results = {
  links: [],
  passed: true
};

let checked = 0;
let working = 0;
let broken = 0;

async function checkUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        'Accept': '*/*'
      },
      timeout: timeout
    }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        state: res.statusCode >= 200 && res.statusCode < 400 ? 'OK' : 'BROKEN',
        foundIn: linkMap[url] || []
      });
      res.resume(); // Consume response
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        state: 'BROKEN',
        statusText: 'Timeout',
        foundIn: linkMap[url] || []
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        state: 'BROKEN',
        statusText: err.message,
        foundIn: linkMap[url] || []
      });
    });
  });
}

async function checkAllLinks() {
  const batchSize = 50; // Check 50 links in parallel
  
  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
    
    batchResults.forEach(result => {
      results.links.push(result);
      checked++;

      if (result.state === 'OK' || result.status === 403) {
        working++;
      } else {
        broken++;
        results.passed = false;
      }

      // Progress indicator
      const percent = Math.floor((checked / links.length) * 100);
      process.stdout.write(`\r   Progress: ${checked}/${links.length} (${percent}%) - ✅ ${working} | ❌ ${broken}`);
    });
  }
  
  console.log('\n');
}

const startTime = Date.now();

checkAllLinks().then(() => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n✅ Link check completed in ${duration}s`);
  console.log(`   ✅ Working: ${working}`);
  console.log(`   ❌ Broken: ${broken}`);
  console.log(`   📝 Total checked: ${checked}\n`);
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: link-check-results.json\n`);
  
  process.exit(broken > 0 ? 1 : 0);
});

