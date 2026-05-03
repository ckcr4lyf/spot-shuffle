import blessed from 'blessed';
import fs from 'fs';
import { addItems, deleteItems, getAllSongs, makePlaylist, refreshAccessToken } from './api.js'
import { generateAuthUri, waitForAccessToken, loadToken, saveToken } from './auth.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const saved = loadToken();

if (saved && Date.now() < saved.expiresAt) {
    process.env.AUTH_HEADER = `Bearer ${saved.accessToken}`;
} else if (saved && saved.refreshToken) {
    const newToken = await refreshAccessToken(saved.refreshToken);
    process.env.AUTH_HEADER = `Bearer ${newToken.accessToken}`;
    saveToken({ ...newToken, refreshToken: saved.refreshToken });
} else {
    const { codeVerifier, url } = generateAuthUri();
    console.log(`Please visit the following URL to connect this app to your spotify account: ${url}`);
    const tokenData = await waitForAccessToken(codeVerifier);
    process.env.AUTH_HEADER = `Bearer ${tokenData.accessToken}`;
    saveToken(tokenData);
}


const state = JSON.parse(fs.readFileSync('./1750517059007_ordered.json'));
console.log(state[0]);

    const newPlaylistName = crypto.randomBytes(10).toString('hex');
    const newPlaylist = await makePlaylist(process.env.USER_ID, newPlaylistName, process.env.AUTH_HEADER);

    const allShuffle = state.map(s => s.uri);
    const uniq = [];
    for (let el of allShuffle) {
        if (uniq.indexOf(el) !== -1){
            continue;
        }

        uniq.push(el);
    }

    console.log(JSON.parse(newPlaylist.body).id);
    console.log(uniq);
    const trimmed = uniq.splice(0, 130);
    await addItems(trimmed, JSON.parse(newPlaylist.body).id, process.env.AUTH_HEADER);
