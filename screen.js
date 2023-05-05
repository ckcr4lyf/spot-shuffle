import blessed from 'blessed';
import fs from 'fs';
import { addItems, getAllSongs, makePlaylist} from './api.js'
import dotenv from 'dotenv';

dotenv.config();

const getNice = (ms) => {
    return new Date(ms).toISOString().slice(11, 19);
}

const getNiceShort = (ms) => {
    return new Date(ms).toISOString().slice(14, 19);
}

const updateList = () => {
    let total_duration = 0;
    const elements = [];
    for (let i = 0; i < state.length; i++){
        const newEntry = `[${getNice(total_duration)}] ${state[i].name} (${getNiceShort(state[i].ms)})`
        total_duration += state[i].ms;
        list.setItem(i, newEntry)
    }
}

const screen = blessed.screen({
    smartCSR: true
});

let state = await getAllSongs(process.env.PLAYLIST_REORDER, process.env.AUTH_HEADER)

const list = blessed.list({
    parent: screen,
    // input: true,
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

list.key('s', () => {
    const filename = `${Date.now()}_ordered.json`
    fs.writeFileSync(filename, JSON.stringify(state, null, 2));
})

screen.title = 'Spot Shuffle';

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();
