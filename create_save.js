    import blessed from 'blessed';
    import fs from 'fs';
    import { addItems, deleteItems, getAllSongs, makePlaylist} from './api.js'
    import { generateAuthUri, waitForAccessToken } from './auth.js';
import crypto from 'crypto';
    import dotenv from 'dotenv';    
    const { codeVerifier, url } = generateAuthUri();
    console.log(`Please visit the following URL to connect this app to your spotify account: ${url}`);
    const accessToken = await waitForAccessToken(codeVerifier);
    process.env.AUTH_HEADER = `Bearer ${accessToken}`;
    
    dotenv.config();
    
    
    const state = JSON.parse(fs.readFileSync('./1750517059007_ordered.json'));
    console.log(state[0]);

        const newPlaylistName = crypto.randomBytes(10).toString('hex');
        const newPlaylist = await makePlaylist(process.env.USER_ID, newPlaylistName, process.env.AUTH_HEADER);
        // console.log(accessToken);
    
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

    // console.error(`deleting`);
    // await deleteItems(state.map(s => s.uri), process.env.PLAYLIST_REORDER, process.env.AUTH_HEADER);
    // console.error(`adding`);
    // await addItems(state.map(s => s.uri), process.env.PLAYLIST_REORDER, process.env.AUTH_HEADER);

