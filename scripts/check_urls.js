const https = require('https');

const urls = [
    'https://raw.githubusercontent.com/Binternet/israel-cities/master/israel-cities.json',
    'https://raw.githubusercontent.com/Binternet/israel-cities/main/israel-cities.json',
    'https://raw.githubusercontent.com/GabMic/israeli-cities-and-streets-list/master/cities.json',
    'https://data.gov.il/api/3/action/datastore_search?resource_id=d4901968-dad3-4845-a9b0-a57d027f11ab&limit=100' // Another resource ID attempt
];

function check(url) {
    https.get(url, (res) => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => console.log(`Data preview for ${url}:`, data.substring(0, 100)));
        }
    }).on('error', (e) => console.log(`Error ${url}: ${e.message}`));
}

urls.forEach(check);
