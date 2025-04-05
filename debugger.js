class Debugger {
    constructor() {
        this.breakpoints = new Set();
        this.running = false;
        this.currentLine = null;
        this.variables = new Map();
    }

    async start() {
        this.running = true;
        const code = editor.getValue();
        await this.executeWithBreakpoints(code);
    }

    async executeWithBreakpoints(code) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (this.breakpoints.has(i + 1)) {
                this.pauseExecution(i + 1);
                await this.waitForContinue();
            }
            this.executeLineWithInstrumentation(lines[i], i + 1);
        }
    }

    pauseExecution(line) {
        this.currentLine = line;
        editor.deltaDecorations([], [{
            range: new monaco.Range(line, 1, line, 1),
            options: {
                isWholeLine: true,
                className: 'debug-line'
            }
        }]);
    }

    continue() {
        this.running = true;
    }

    step() {
        if (this.currentLine) {
            this.executeLineWithInstrumentation(
                editor.getModel().getLineContent(this.currentLine),
                this.currentLine
            );
            this.currentLine++;
        }
    }

    executeLineWithInstrumentation(line, lineNumber) {
        try {
            const instrumentedCode = `
                try {
                    ${line}
                } catch (e) {
                    throw { message: e.message, line: ${lineNumber} };
                }
            `;
            new Function(instrumentedCode)();
        } catch (error) {
            this.handleError(error);
        }
    }

    addBreakpoint(line) {
        this.breakpoints.add(line);
    }

    removeBreakpoint(line) {
        this.breakpoints.delete(line);
    }

    handleError(error) {
        console.error(`Error at line ${error.line}: ${error.message}`);
    }
}
