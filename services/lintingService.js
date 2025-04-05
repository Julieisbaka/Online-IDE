class LintingService {
    constructor() {
        this.linters = new Map();
        this.setupLinters();
    }

    setupLinters() {
        this.linters.set('javascript', this.lintJavaScript);
        this.linters.set('typescript', this.lintTypeScript);
    }

    async lintCode(code, language) {
        const linter = this.linters.get(language);
        if (!linter) return [];

        const markers = await linter(code);
        monaco.editor.setModelMarkers(editor.getModel(), 'linting', markers);
    }

    lintJavaScript(code) {
        const markers = [];
        // Basic linting rules
        if (code.includes('var ')) {
            markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: 'Use let or const instead of var',
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 1
            });
        }
        return markers;
    }
}

window.lintingService = new LintingService();
