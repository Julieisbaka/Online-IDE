require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
    }
});

class IDEController {
    constructor() {
        this.editor = null;
        this.fileManager = new FileManager();
        this.themeManager = new ThemeManager();
        this.toolsService = new ToolsService();
        this.apiTester = new APITester();
    }

    async init() {
        await this.initEditor();
        this.initEventListeners();
        this.setupPanels();
    }

    async initEditor() {
        await new Promise(resolve => require(['vs/editor/editor.main'], resolve));
        this.editor = monaco.editor.create(document.getElementById('editor'), {
            value: '// Welcome to Online IDE\n',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            wordWrap: 'on',
            lineHeight: 20,
            formatOnType: true,
            formatOnPaste: true,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: true,
            quickSuggestions: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false
            }
        });

        // Make editor globally accessible
        window.editor = this.editor;

        // Add resize handler
        window.addEventListener('resize', () => {
            this.editor.layout();
        });

        // Initialize language features
        if (window.languageServer) {
            window.languageServer.initializeProviders();
        }
    }

    initEventListeners() {
        // File operations
        document.getElementById('new-file').onclick = () => this.fileManager.createNewFile();
        document.getElementById('save-file').onclick = () => this.fileManager.saveCurrentFile();
        document.getElementById('open-file').onclick = () => document.getElementById('file-input').click();
        
        // Editor controls
        document.getElementById('format-btn').onclick = () => this.formatCode();
        document.getElementById('fold-btn').onclick = () => this.toggleFold();
        document.getElementById('minimap-btn').onclick = () => this.toggleMinimap();
        
        // Language selection
        document.getElementById('language-select').onchange = (e) => this.changeLanguage(e.target.value);
        
        // Preview toggle
        document.getElementById('preview-btn').onclick = () => this.togglePreview();
        
        // Debug controls
        document.getElementById('debug-start').onclick = () => this.startDebugging();
        document.getElementById('debug-stop').onclick = () => this.stopDebugging();
    }

    // Add implementation of all button handlers...
}

// Initialize IDE
const ide = new IDEController();
document.addEventListener('DOMContentLoaded', () => ide.init());
