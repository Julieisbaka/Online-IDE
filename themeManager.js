class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'vs-dark';
        this.init();
    }

    async init() {
        await this.fetchThemes();
        this.setupThemePanel();
    }

    async fetchThemes() {
        const response = await fetch('https://raw.githubusercontent.com/microsoft/vscode/main/extensions/theme-defaults/themes/dark_plus.json');
        const defaultTheme = await response.json();
        this.themes.set('vs-dark', defaultTheme);
        
        // Fetch popular VSCode themes
        const popularThemes = [
            'github-dark',
            'monokai',
            'dracula',
            'nord',
            'solarized-dark'
        ];

        await Promise.all(popularThemes.map(theme => this.fetchTheme(theme)));
    }

    setupThemePanel() {
        const themesHtml = Array.from(this.themes.entries()).map(([id, theme]) => `
            <div class="theme-item" data-theme="${id}">
                <div class="theme-preview"></div>
                <div class="theme-info">
                    <span class="theme-name">${theme.name}</span>
                    <button class="theme-apply">Apply</button>
                </div>
            </div>
        `).join('');

        document.getElementById('sidebar-content').innerHTML = themesHtml;
    }

    applyTheme(themeId) {
        const theme = this.themes.get(themeId);
        monaco.editor.defineTheme(themeId, theme);
        monaco.editor.setTheme(themeId);
        this.currentTheme = themeId;
        document.documentElement.setAttribute('data-theme', themeId);
    }
}
