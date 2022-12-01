import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

import { addItems, getAllSongs, makePlaylist} from './api.js'

/* Randomize array in-place using Durstenfeld shuffle algorithm */
// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

const authHeader = process.env.AUTH_HEADER
const USER_ID = process.env.USER_ID;

const oldAllS = await getAllSongs(process.env.PLAYLIST_1, authHeader);
    const newAllS = await getAllSongs(process.env.PLAYLIST_2, authHeader);

const newThenOld = [...shuffleArray(newAllS), ...shuffleArray(oldAllS)];
fs.writeFileSync('newThenOld.json', JSON.stringify(newThenOld, null, 2));

const allShuffle = shuffleArray([...newAllS, ...oldAllS]);
fs.writeFileSync('allShuffle.json', JSON.stringify(allShuffle, null, 2));

const newPlaylistName = crypto.randomBytes(10).toString('hex');

const newPlaylist = await makePlaylist(USER_ID, newPlaylistName, authHeader);

const uniq = [];

console.log(`OG combined length: ${allShuffle.length}`)

for (let el of allShuffle) {
    if (uniq.indexOf(el.uri) !== -1){
        console.log(`Found dupe: ${el.name}`);
        // skip
        continue;
    }

    uniq.push(el.uri);
}

console.log(`Final deduped length: ${uniq.length}`);

await addItems(uniq, JSON.parse(newPlaylist.body).id, authHeader);
