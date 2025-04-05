class FileManager {
    constructor() {
        this.tabs = new Map();
        this.activeTab = null;
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
