const fs = require('fs');
const path = require('path');

function walk(d) {
  let res = [];
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory() && !p.includes('node_modules') && !p.includes('.next')) {
      res = res.concat(walk(p));
    } else if (f === 'package.json') {
      res.push(p);
    }
  });
  return res;
}

walk('.').forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  let m = c.replace(/"@repo\/([^"]+)"\s*:\s*"\*"/g, '"@repo/$1": "workspace:*"');
  if (c !== m) {
    fs.writeFileSync(p, m);
    console.log('Updated ' + p);
  }
});
