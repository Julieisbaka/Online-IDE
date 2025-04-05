require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
    }
});

let editor;
const fileManager = new FileManager();
const md = window.markdownit();
let previewMode = false;

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '// Write your code here\n',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        tabSize: 4,
        formatOnType: true,
        formatOnPaste: true,
        snippetSuggestions: 'inline',
        suggestOnTriggerCharacters: true,
        folding: true,
        contextmenu: true,
        mouseWheelZoom: true,
        padding: { top: 10 },
        autoIndent: 'full',
        dragAndDrop: true,
        links: true,
        parameterHints: { enabled: true },
        showUnused: true,
        tabCompletion: 'on'
    });

    // Add code snippets
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: () => {
            return {
                suggestions: [
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'class ${1:name} {\n\tconstructor() {\n\t\t$0\n\t}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }
                ]
            };
        }
    });

    // Initialize first tab
    fileManager.createTab();

    setupEventListeners();
    setupCommands();

    const previewBtn = document.getElementById('preview-btn');
    const languageSelect = document.getElementById('language-select');
    
    languageSelect.addEventListener('change', () => {
        const language = languageSelect.value;
        monaco.editor.setModelLanguage(editor.getModel(), language);
        
        previewBtn.style.display = 
            (language === 'markdown' || language === 'html') ? 'inline' : 'none';
        
        if (previewMode && !(language === 'markdown' || language === 'html')) {
            togglePreview(false);
        }
    });

    previewBtn.addEventListener('click', () => togglePreview());
    
    // Set up auto-preview update
    editor.onDidChangeModelContent(() => {
        if (previewMode) {
            updatePreview();
        }
    });
});

function setupCommands() {
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        editor.getAction('actions.find').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
        editor.getAction('actions.replace').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        fileManager.saveFile();
    });
}

function setupEventListeners() {
    document.getElementById('new-file').addEventListener('click', () => {
        fileManager.createTab();
    });

    document.getElementById('save-file').addEventListener('click', () => {
        fileManager.saveFile();
    });

    document.getElementById('open-file').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            fileManager.loadFile(e.target.files[0]);
        }
    });

    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', () => {
        monaco.editor.setModelLanguage(editor.getModel(), languageSelect.value);
    });

    document.getElementById('run-btn').addEventListener('click', executeCode);

    document.getElementById('format-btn').addEventListener('click', () => {
        editor.getAction('editor.action.formatDocument').run();
    });

    document.getElementById('fold-btn').addEventListener('click', () => {
        editor.getAction('editor.foldAll').run();
    });

    document.getElementById('minimap-btn').addEventListener('click', () => {
        const minimapEnabled = !editor.getOption(monaco.editor.EditorOption.minimap).enabled;
        editor.updateOptions({ minimap: { enabled: minimapEnabled } });
    });

    // Panel tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            document.querySelectorAll('.panel-content').forEach(panel => {
                panel.style.display = 'none';
            });
            document.getElementById(target).style.display = 'block';
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'block';
    });

    // Theme change
    document.getElementById('theme-select').addEventListener('change', (e) => {
        monaco.editor.setTheme(e.target.value);
    });

    // Font size change
    document.getElementById('font-size').addEventListener('change', (e) => {
        editor.updateOptions({ fontSize: parseInt(e.target.value) });
    });
}

async function executeCode() {
    const code = editor.getValue();
    const language = document.getElementById('language-select').value;
    const output = document.getElementById('output');
    
    try {
        // Sanitize code input
        if (!isCodeSafe(code)) {
            throw new Error('Potentially unsafe code detected');
        }

        const result = await languageService.executeCode(code, language);
        output.innerHTML = escapeHtml(String(result));
    } catch (error) {
        output.innerHTML = `<span class="error">Error: ${escapeHtml(error.message)}</span>`;
    }
}

function isCodeSafe(code) {
    // Basic security checks
    const dangerousPatterns = [
        'process.exit',
        'require(',
        'eval(',
        'Function(',
        'document.cookie'
    ];

    return !dangerousPatterns.some(pattern => code.includes(pattern));
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/<//g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function executeJavaScript(code, output) {
    // Create sandbox
    const sandbox = new Worker(
        URL.createObjectURL(
            new Blob([`
                self.onmessage = function(e) {
                    try {
                        const result = eval(e.data);
                        self.postMessage({ result });
                    } catch (error) {
                        self.postMessage({ error: error.message });
                    }
                }
            `], { type: 'application/javascript' })
        )
    );

    return new Promise((resolve, reject) => {
        sandbox.onmessage = (e) => {
            if (e.data.error) {
                output.innerHTML = `<span class="error">Error: ${escapeHtml(e.data.error)}</span>`;
            } else {
                output.innerHTML = escapeHtml(String(e.data.result));
            }
            sandbox.terminate();
            resolve();
        };

        sandbox.postMessage(code);
    });
}

// Note: Python and Java execution would require backend integration
// These are placeholder functions
async function executePython(code, output) {
    output.innerHTML = 'Python execution requires backend integration';
}

async function executeJava(code, output) {
    output.innerHTML = 'Java execution requires backend integration';
}

function togglePreview(force = null) {
    const preview = document.getElementById('preview');
    const language = document.getElementById('language-select').value;
    
    previewMode = force !== null ? force : !previewMode;
    
    preview.style.display = previewMode ? 'block' : 'none';
    editor.layout();
    
    if (previewMode) {
        updatePreview();
    }
}

function updatePreview() {
    const preview = document.getElementById('preview');
    const code = editor.getValue();
    const language = document.getElementById('language-select').value;
    
    if (language === 'markdown') {
        preview.innerHTML = md.render(code);
    } else if (language === 'html') {
        // Create sandbox iframe for HTML preview
        preview.innerHTML = `<iframe id="html-preview" sandbox="allow-same-origin" style="width: 100%; height: 100%; border: none;"></iframe>`;
        const iframe = document.getElementById('html-preview');
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
    }
}

class LanguageService {
    constructor() {
        this.problems = new Map();
        this.supportedLanguages = {
            javascript: {
                compile: code => this.validateJS(code),
                run: code => this.executeJS(code)
            },
            python: {
                compile: code => this.validatePython(code),
                run: code => this.executePython(code)
            }
        };
    }

    async executeCode(code, language) {
        const runner = this.supportedLanguages[language];
        if (!runner) throw new Error('Language not supported');

        const problems = await runner.compile(code);
        this.updateProblems(problems);
        
        if (problems.length === 0) {
            return await runner.run(code);
        }
        throw new Error('Please fix compilation errors');
    }

    updateProblems(problems) {
        const panel = document.getElementById('problems');
        panel.innerHTML = problems.map(p => `
            <div class="problem-item ${p.severity}">
                <span class="problem-severity">${p.severity}</span>
                <span class="problem-message">${p.message}</span>
                <span class="problem-location">Line ${p.line}</span>
            </div>
        `).join('');
    }

    validateJS(code) {
        try {
            new Function(code);
            return [];
        } catch (e) {
            return [{
                severity: 'error',
                message: e.message,
                line: this.extractLineNumber(e)
            }];
        }
    }
}

const languageService = new LanguageService();
