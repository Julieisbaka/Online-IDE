class PreviewService {
    constructor() {
        this.md = window.markdownit();
        this.setupPreviewPanel();
    }

    setupPreviewPanel() {
        const previewPanel = document.getElementById('preview');
        editor.onDidChangeModelContent(() => this.updatePreview());
    }

    updatePreview() {
        const content = editor.getValue();
        const language = editor.getModel().getLanguageId();
        const preview = document.getElementById('preview');

        switch (language) {
            case 'markdown':
                preview.innerHTML = this.md.render(content);
                break;
            case 'html':
                preview.innerHTML = `<iframe srcdoc="${this.sanitizeHtml(content)}" style="width: 100%; height: 100%; border: none;"></iframe>`;
                break;
        }
    }

    sanitizeHtml(html) {
        return html.replace(/"/g, '&quot;');
    }
}

window.previewService = new PreviewService();
