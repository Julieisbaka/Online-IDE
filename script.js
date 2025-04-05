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
        this.shortcuts = new Map();
        this.setupShortcuts();
    }

    setupShortcuts() {
        this.shortcuts.set('ctrl+s', () => this.fileManager.saveCurrentFile());
        this.shortcuts.set('ctrl+b', () => this.toggleSidebar());
        this.shortcuts.set('ctrl+`', () => this.toggleTerminal());
        this.shortcuts.set('ctrl+shift+p', () => this.showCommandPalette());
        this.shortcuts.set('ctrl+/', () => this.toggleComment());
        this.shortcuts.set('alt+up', () => this.moveLine('up'));
        this.shortcuts.set('alt+down', () => this.moveLine('down'));
    }

    async init() {
        try {
            await this.loadMonaco();
            await this.initEditor();
            await this.initServices();
            this.hideLoader();
        } catch (error) {
            this.handleInitError(error);
        }
    }

    hideLoader() {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 500);
    }

    handleInitError(error) {
        console.error('IDE initialization failed:', error);
        document.getElementById('loader').innerHTML = `
            <div class="loader-content error">
                <h2>Failed to load IDE</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    async loadMonaco() {
        await new Promise(resolve => require(['vs/editor/editor.main'], resolve));
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

    async initServices() {
        // Initialize services
        await this.fileManager.init();
        await this.themeManager.init();
        await this.toolsService.init();
        await this.apiTester.init();
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
