class APITesterUI {
    constructor() {
        this.tester = new APITester();
        this.initializeMonacoEditor();
        this.setupEventListeners();
    }

    initializeMonacoEditor() {
        this.bodyEditor = monaco.editor.create(document.getElementById('body-editor'), {
            value: '',
            language: 'json',
            theme: 'vs-dark',
            minimap: { enabled: false },
            automaticLayout: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on'
        });
    }

    setupEventListeners() {
        document.getElementById('send-request').addEventListener('click', () => this.sendRequest());
        document.getElementById('save-request').addEventListener('click', () => this.saveRequest());
        document.getElementById('body-type').addEventListener('change', (e) => this.updateBodyEditor(e.target.value));
        
        // Setup tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    }

    async sendRequest() {
        const method = document.getElementById('http-method').value;
        const url = document.getElementById('request-url').value;
        const headers = this.getHeaders();
        const body = this.getRequestBody();

        try {
            const response = await this.tester.sendRequest({
                method,
                url,
                headers,
                body
            });

            this.displayResponse(response);
            this.updateHistory();
        } catch (error) {
            this.showError(error);
        }
    }

    getHeaders() {
        const headers = {};
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('input:first-child').value;
            const value = row.querySelector('input:last-child').value;
            if (key && value) headers[key] = value;
        });
        return headers;
    }

    getRequestBody() {
        const bodyType = document.getElementById('body-type').value;
        if (bodyType === 'none') return null;
        
        try {
            return this.bodyEditor.getValue();
        } catch (e) {
            throw new Error('Invalid request body');
        }
    }

    displayResponse(response) {
        document.getElementById('status').textContent = `Status: ${response.status}`;
        document.getElementById('time').textContent = `Time: ${response.duration}ms`;
        
        const responseContent = document.getElementById('response-content');
        if (typeof response.body === 'object') {
            responseContent.innerHTML = `<pre>${JSON.stringify(response.body, null, 2)}</pre>`;
        } else {
            responseContent.textContent = response.body;
        }
    }

    updateHistory() {
        const history = document.getElementById('request-history');
        history.innerHTML = this.tester.history
            .map(item => `
                <div class="history-item" onclick="apiTesterUI.loadRequest(${item.id})">
                    <span class="method ${item.request.method.toLowerCase()}">${item.request.method}</span>
                    <span class="url">${item.request.url}</span>
                    <span class="status">${item.response.status}</span>
                </div>
            `)
            .join('');
    }

    loadRequest(id) {
        const request = this.tester.history.find(item => item.id === id).request;
        document.getElementById('http-method').value = request.method;
        document.getElementById('request-url').value = request.url;
        this.bodyEditor.setValue(request.body || '');
        // Load headers and params
    }
}

const apiTesterUI = new APITesterUI();
