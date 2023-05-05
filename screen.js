import blessed from 'blessed';
import fs from 'fs';
import d from './allShuffle.json' assert { type: 'json' };
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

    // for (let song of state){
    //     elements.push(`[${getNice(total_duration)}] ${song.name} (${getNiceShort(song.duration)})`)
    // }    

}

// let state = [ ...d ];

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
    // console.error(index);
    globalCurrent = index;
})

list.key('left', () => {
    const current = globalCurrent;
    // console.error('got left', current);

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
    // console.error('got right', current);

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
    // const scroll = list.getScroll();
    // console.error(`Currently selected: ${current}. Scroll: ${scroll}. Other ${list.top} , ${list.bottom}`);
    // const deleted = state.splice(current, 1);
    // console.error(deleted);
    // state.push(...deleted);
    // // list.clearItems();
    // list.setItems(state.map(el => el.name));

    // // list.select(current);

    // list.resetScroll();
    // list.select(0);
    // list.move(current + 10);
    // list.select(current);
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

// Run with
// node screen.js 2>/tmp/log.log
