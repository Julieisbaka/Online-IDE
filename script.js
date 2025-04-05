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
        automaticLayout: true
    });

    // Initialize first tab
    fileManager.createTab();

    setupEventListeners();

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

        switch (language) {
            case 'javascript':
                await executeJavaScript(code, output);
                break;
            case 'python':
                await executePython(code, output);
                break;
            case 'java':
                await executeJava(code, output);
                break;
            default:
                throw new Error('Unsupported language');
        }
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
