import blessed from 'blessed';

const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Spot Shuffle';

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();