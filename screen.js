import blessed from 'blessed';
import d from './allShuffle.json' assert { type: 'json' };

let state = [ ...d ];

const screen = blessed.screen({
    smartCSR: true
});

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
    console.error('got left', current);

    if (current === 0){
        return;
    }
    list.spliceItem(current, 1);
    list.insertItem(current-1, state[current].name);

    // Fix state
    const deleted = state.splice(current, 1);
    state.splice(current - 1, 0, ...deleted);
    list.up(1);
    screen.render();
})

list.key('right', () => {
    const current = globalCurrent;
    console.error('got right', current);

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
    screen.render();
})

screen.title = 'Spot Shuffle';

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();

// Run with
// node screen.js 2>/tmp/log.log
