class TestRunner {
    constructor() {
        this.tests = new Map();
        this.setupTestPanel();
    }

    setupTestPanel() {
        monaco.languages.registerCodeLensProvider('javascript', {
            provideCodeLenses: (model) => this.provideTestCodeLenses(model)
        });
    }

    provideTestCodeLenses(model) {
        const matches = model.findMatches('test\\(', false, true, false, null, false);
        return {
            lenses: matches.map(match => ({
                range: {
                    startLineNumber: match.range.startLineNumber,
                    startColumn: match.range.startColumn,
                    endLineNumber: match.range.endLineNumber,
                    endColumn: match.range.endColumn
                },
                id: `test-${match.range.startLineNumber}`,
                command: {
                    id: 'test.run',
                    title: '▶ Run Test'
                }
            })),
            dispose: () => {}
        };
    }

    async runTest(testId) {
        // Test execution logic
    }
}

window.testRunner = new TestRunner();
