/**
 * Spotify auth related stuffs
 */

import http from 'http';
import crypto from 'crypto';


const code = crypto.randomBytes(32).toString('hex');
const codeHash = crypto.createHash('sha256').update(code).digest('base64');

const generateAuthUri = () => {
    const client_id = '45d547b6b97c46ce9cf3c0c5f4bcaa55';
    const redirect_uri = 'http://localhost:13337';
    
    const scope = 'playlist-modify-private playlist-read-private';
    
    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=code';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&code_challenge_method=S256';
    url += `&code_challenge=${codeHash}`

    return url;
}

console.log(generateAuthUri());

const waitForAccessToken = async () => {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            console.log(req.url);
            const code = req.url.substring(req.url.indexOf('#')).split('&')[0].split('=')[1]
            res.writeHead(200, { 'Content-Type': 'text/plain'});
            res.write('success! you can close this window now.');
            resolve(accessToken);    
        });

        server.listen(13337, '127.0.0.1');      
    })
}

const at = await waitForAccessToken();

console.log(`got ${at}`);
