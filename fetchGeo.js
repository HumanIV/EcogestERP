const https = require('https');
const fs = require('fs');
const qs = require('querystring');

const query = [out:json];
area['name'='Táchira']['admin_level'='4']->.a;
(
  relation['admin_level'='6'](area.a);
);
out geom;;

const postData = qs.stringify({ data: query });

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Fetched elements:', result.elements ? result.elements.length : 'none');
      fs.writeFileSync('tachira_municipios_raw.json', JSON.stringify(result));
    } catch(e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
});
req.on('error', console.error);
req.write(postData);
req.end();
