class TerminalManager {
    constructor() {
        this.term = new Terminal({
            fontSize: 14,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff'
            }
        });
        this.history = [];
        this.historyIndex = 0;
        this.currentLine = '';
        this.prompt = '> ';
        
        this.init();
    }

    init() {
        const terminal = document.getElementById('terminal');
        this.term.open(terminal);
        this.term.write('Welcome to Online IDE Terminal\r\n');
        this.writePrompt();

        this.term.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.keyCode === 13) { // Enter
                this.handleCommand();
            } else if (domEvent.keyCode === 38) { // Up arrow
                this.navigateHistory('up');
            } else if (domEvent.keyCode === 40) { // Down arrow
                this.navigateHistory('down');
            } else if (domEvent.keyCode === 8) { // Backspace
                if (this.currentLine.length > 0) {
                    this.currentLine = this.currentLine.slice(0, -1);
                    this.term.write('\b \b');
                }
            } else if (printable) {
                this.currentLine += key;
                this.term.write(key);
            }
        });
    }

    writePrompt() {
        this.term.write('\r\n' + this.prompt);
    }

    handleCommand() {
        this.term.write('\r\n');
        if (this.currentLine.length > 0) {
            this.history.push(this.currentLine);
            this.historyIndex = this.history.length;
            this.executeCommand(this.currentLine);
        }
        this.currentLine = '';
    }

    executeCommand(command) {
        const [cmd, ...args] = command.split(' ');
        
        switch(cmd) {
            case 'clear':
                this.term.clear();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'git':
                window.gitManager.handleCommand(args.join(' '), output => {
                    this.term.write(output + '\r\n');
                    this.writePrompt();
                });
                return;
            default:
                this.term.write(`Command not found: ${cmd}\r\n`);
        }
        this.writePrompt();
    }

    showHelp() {
        const help = [
            'Available commands:',
            '  clear - Clear terminal',
            '  help  - Show this help',
            '  git   - Git operations',
            '    git status',
            '    git add <file>',
            '    git commit -m "message"',
            '    git push'
        ].join('\r\n');
        this.term.write(help + '\r\n');
    }

    navigateHistory(direction) {
        if (direction === 'up' && this.historyIndex > 0) {
            this.historyIndex--;
        } else if (direction === 'down' && this.historyIndex < this.history.length) {
            this.historyIndex++;
        }

        const command = this.history[this.historyIndex] || '';
        this.term.write('\r' + this.prompt + ' ' + ' '.repeat(this.currentLine.length) + '\r' + this.prompt + command);
        this.currentLine = command;
    }
}

window.terminalManager = new TerminalManager();
