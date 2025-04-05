class FileManager {
    constructor() {
        this.fileSystem = {
            root: {
                type: 'folder',
                name: 'root',
                children: new Map(),
                parent: null
            }
        };
        this.currentPath = '/root';
        this.supportedPreviews = {
            'image': ['png', 'jpg', 'gif', 'svg'],
            'pdf': ['pdf'],
            'code': ['js', 'html', 'css', 'md', 'xml', 'json', 'yaml']
        };
        this.files = new Map();
        this.currentFile = null;
        this.fileTree = {
            name: 'root',
            type: 'folder',
            children: []
        };
        this.init();
    }

    init() {
        document.getElementById('file-explorer-btn').addEventListener('click', () => this.toggleFileExplorer());
        // ...existing event listeners...
    }

    toggleFileExplorer() {
        const content = document.getElementById('sidebar-content');
        content.innerHTML = this.renderFileTree(this.fileTree);
    }

    renderFileTree(node) {
        if (node.type === 'file') {
            return `<div class="file-item" onclick="fileManager.openFile('${node.path}')">
                     <span class="file-icon">📄</span>${node.name}
                   </div>`;
        }

        const children = node.children.map(child => this.renderFileTree(child)).join('');
        return `<div class="folder">
                  <div class="folder-header">
                    <span class="folder-icon">📁</span>${node.name}
                  </div>
                  <div class="folder-content">${children}</div>
                </div>`;
    }

    createFile(name, content = '', type = 'file') {
        const path = this.currentPath;
        const folder = this.getFolder(path);
        
        if (folder.children.has(name)) {
            throw new Error('File already exists');
        }

        folder.children.set(name, {
            type: type,
            name: name,
            content: content,
            parent: folder,
            created: new Date(),
            modified: new Date()
        });

        this.updateFileTree();
    }

    createFolder(name) {
        this.createFile(name, '', 'folder');
    }

    deleteItem(path) {
        const { parent, name } = this.parsePath(path);
        const folder = this.getFolder(parent);
        folder.children.delete(name);
        this.updateFileTree();
    }

    async importFile(file) {
        const content = await this.readFile(file);
        const preview = await this.generatePreview(file, content);
        this.createFile(file.name, { content, preview });
    }

    async generatePreview(file, content) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (this.supportedPreviews.image.includes(ext)) {
            return `<img src="${URL.createObjectURL(file)}" alt="${file.name}">`;
        }

        if (this.supportedPreviews.pdf.includes(ext)) {
            return `<iframe src="${URL.createObjectURL(file)}" width="100%" height="100%"></iframe>`;
        }

        return content;
    }

    updateFileTree() {
        this.fileTree.children = Array.from(this.files.values()).map(file => ({
            name: file.name,
            type: 'file',
            path: file.path
        }));
        if (document.getElementById('sidebar-content').classList.contains('file-explorer')) {
            this.toggleFileExplorer();
        }
    }

    createTab(filename = 'untitled', content = '', language = 'javascript') {
        const tabId = `tab-${Date.now()}`;
        const tab = { id: tabId, filename, content, language };
        this.tabs.set(tabId, tab);
        this.renderTabs();
        this.switchTab(tabId);
        return tab;
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        const tab = this.tabs.get(tabId);
        if (tab && editor) {
            editor.setValue(tab.content);
            monaco.editor.setModelLanguage(editor.getModel(), tab.language);
            document.getElementById('language-select').value = tab.language;
        }
    }

    renderTabs() {
        const container = document.getElementById('tabs-container');
        container.innerHTML = '';
        this.tabs.forEach((tab, id) => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab';
            tabElement.textContent = tab.filename;
            tabElement.onclick = () => this.switchTab(id);
            container.appendChild(tabElement);
        });
    }

    saveFile() {
        const tab = this.tabs.get(this.activeTab);
        if (tab) {
            const blob = new Blob([editor.getValue()], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = tab.filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }

    async loadFile(file) {
        try {
            const content = await file.text();
            const extension = file.name.split('.').pop();
            const language = this.getLanguageFromExtension(extension);
            this.createTab(file.name, content, language);
        } catch (error) {
            console.error('Error loading file:', error);
        }
    }

    getLanguageFromExtension(ext) {
        const map = {
            'js': 'javascript',
            'py': 'python',
            'java': 'java'
        };
        return map[ext] || 'plaintext';
    }
}
