import blessed from 'blessed';
import fs from 'fs';
import { addItems, getAllSongs, makePlaylist, getUserPlaylists, refreshAccessToken } from './api.js'
import { generateAuthUri, waitForAccessToken, loadToken, saveToken } from './auth.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

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

const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Spot Shuffle';

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

const playlists = await getUserPlaylists(process.env.AUTH_HEADER);

if (playlists.length === 0) {
    console.log('No playlists found.');
    process.exit(1);
}

const playlistList = blessed.list({
    parent: screen,
    keys: true,
    border: {
        type: 'line'
    },
    style: {
        selected: {
            bg: 'blue'
        }
    },
    items: playlists.map(p => `${p.name}  (${p.trackCount} tracks)`),
});

playlistList.key('enter', async () => {
    await startReorder(playlistList.selected);
});

playlistList.focus();
screen.render();

async function startReorder(index) {
    const playlistId = playlists[index].id;
    const playlistName = playlists[index].name;

    playlistList.destroy();

    let MARKED_HOME = 0;

    const getNice = (ms) => {
        return new Date(ms).toISOString().slice(11, 19);
    }

    const getNiceShort = (ms) => {
        return new Date(ms).toISOString().slice(14, 19);
    }

    const updateList = () => {
        let total_duration = 0;
        for (let i = 0; i < state.length; i++){

            const base = `[${getNice(total_duration)}] ${state[i].name} (${getNiceShort(state[i].ms)})`
            let newEntry = ``;
            if (i === MARKED_HOME){
                newEntry = `===========> ${base}`;
            } else {
                newEntry = base;
            }
            total_duration += state[i].ms;
            list.setItem(i, newEntry)
        }
    }

    let state = await getAllSongs(playlistId, process.env.AUTH_HEADER)

    const list = blessed.list({
        parent: screen,
        keys: true,
        border: {
            type: 'line'
        },
        style: {
            selected: {
                bg: 'blue'
            }
        },
        items: state.map(el => el.name),
    });


    updateList();

    let globalCurrent = 0;

    list.on('action', (x, y) => {
        console.error(x, y);
    })

    list.on('select item', (x, index) => {
        globalCurrent = index;
    })

    list.key('left', () => {
        const current = globalCurrent;

        if (current === 0){
            return;
        }
        list.spliceItem(current, 1);
        list.insertItem(current-1, state[current].name);

        // Fix state
        const deleted = state.splice(current, 1);
        state.splice(current - 1, 0, ...deleted);
        list.up(1);
        updateList();
        screen.render();
    })

    list.key('pageup', () => {
        const current = globalCurrent;

        if (current <= 10){
            return;
        }

        list.spliceItem(current, 1);
        list.insertItem(current-10, state[current].name);

        // Fix state
        const deleted = state.splice(current, 1);
        state.splice(current - 10, 0, ...deleted);
        // list.up(1);
        list.down(1);
        updateList();
        screen.render();
    })

    list.key('right', () => {
        const current = globalCurrent;

        if (current === state.length){
            return;
        }

        list.spliceItem(current, 1);
        list.insertItem(current+1, state[current].name);


        // Fix state
        const deleted = state.splice(current, 1);
        state.splice(current + 1, 0, ...deleted);

        if (current === 0){
            list.down(1);
        } else {
            list.down(2);
        }
        updateList();
        screen.render();
    })

    list.key('pagedown', () => {
        const current = globalCurrent;

        if (current >= state.length-10){
            return;
        }

        list.spliceItem(current, 1);
        list.insertItem(current+10, state[current].name);

        // Fix state
        const deleted = state.splice(current, 1);
        state.splice(current + 10, 0, ...deleted);
        list.down(1);
        updateList();
        screen.render();
    })

    list.key('m', () => {
        const current = globalCurrent;
        MARKED_HOME = current;
        updateList();
        screen.render();
    })

    list.key('home', () => {
        const current = globalCurrent;
        list.spliceItem(current, 1);
        list.insertItem(MARKED_HOME + 1, state[current].name);

        // Fix state
        const deleted = state.splice(current, 1);
        state.splice(MARKED_HOME + 1, 0, ...deleted);
        list.down();

        updateList();
        screen.render();
    })

    list.key('end', (x, y) => {
        const current = globalCurrent;
        list.spliceItem(current, 1);
        list.addItem(state[current].name);

        // Fix state
        const deleted = state.splice(current, 1);
        state.push(...deleted);
        list.down();

        updateList();
        screen.render();
    })

    list.key('s', async () => {
        const filename = `${Date.now()}_ordered.json`
        fs.writeFileSync(filename, JSON.stringify(state, null, 2));

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

        await addItems(uniq, JSON.parse(newPlaylist.body).id, process.env.AUTH_HEADER);
        screen.render();
    })

    list.focus();
    screen.render();
}
