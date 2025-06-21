    import blessed from 'blessed';
    import fs from 'fs';
    import { addItems, deleteItems, getAllSongs, makePlaylist} from './api.js'
    import { generateAuthUri, waitForAccessToken } from './auth.js';
    import dotenv from 'dotenv';
    
    const { codeVerifier, url } = generateAuthUri();
    
    console.log(`Please visit the following URL to connect this app to your spotify account: ${url}`);
    
    const accessToken = await waitForAccessToken(codeVerifier);
    
    dotenv.config();
    
    process.env.AUTH_HEADER = `Bearer ${accessToken}`;
    
    const state = JSON.parse(fs.readFileSync('./1740797456673_ordered.json'));
    console.log(state[0]);

    console.error(`deleting`);
    await deleteItems(state.map(s => s.uri), process.env.PLAYLIST_REORDER, process.env.AUTH_HEADER);
    console.error(`adding`);
    await addItems(state.map(s => s.uri), process.env.PLAYLIST_REORDER, process.env.AUTH_HEADER);
