class CommandPalette {
    constructor() {
        this.commands = new Map();
        this.registerDefaultCommands();
    }

    registerDefaultCommands() {
        this.commands.set('format', {
            title: 'Format Document',
            shortcut: 'Shift+Alt+F',
            category: 'Editor',
            execute: () => editor.getAction('editor.action.formatDocument').run()
        });

        this.commands.set('toggleTerminal', {
            title: 'Toggle Terminal',
            shortcut: 'Ctrl+`',
            category: 'View',
            execute: () => window.ide.toggleTerminal()
        });

        // Add more commands...
    }

    show() {
        const palette = document.createElement('div');
        palette.className = 'command-palette';
        palette.innerHTML = `
            <input type="text" class="command-input" placeholder="Type a command...">
            <div class="command-results"></div>
        `;
        document.body.appendChild(palette);

        const input = palette.querySelector('input');
        input.focus();
        input.addEventListener('input', () => this.updateResults(input.value, palette));
        input.addEventListener('keydown', (e) => this.handleKeydown(e, palette));
    }

    updateResults(query, palette) {
        const results = Array.from(this.commands.entries())
            .filter(([id, cmd]) => 
                cmd.title.toLowerCase().includes(query.toLowerCase()) ||
                cmd.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 10);

        palette.querySelector('.command-results').innerHTML = results
            .map(([id, cmd]) => `
                <div class="command-item" data-command="${id}">
                    <span class="command-icon">${this.getCategoryIcon(cmd.category)}</span>
                    <span class="command-title">${cmd.title}</span>
                    <span class="shortcut">${cmd.shortcut}</span>
                </div>
            `)
            .join('');
    }

    // Add more methods...
}

window.commandPalette = new CommandPalette();
