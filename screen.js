import blessed from 'blessed';

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
            fg: 'black'
        }
    },
    items: ["XD", "YOLO", "LOL"]
});

list.on('action', (x, y) => {
    console.error(x, y);
})

screen.title = 'Spot Shuffle';

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();

// Run with
// node screen.js 2>/tmp/log.log
