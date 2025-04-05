class APITester {
    constructor() {
        this.history = [];
        this.collections = new Map();
    }

    async sendRequest(options) {
        const { method, url, headers, body } = options;
        try {
            const response = await fetch(url, {
                method,
                headers: headers ? JSON.parse(headers) : {},
                body: body || null
            });

            const result = {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body: await this.parseResponse(response),
                time: new Date(),
                duration: 0
            };

            this.history.push({ request: options, response: result });
            return result;
        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
        }
    }

    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    }

    saveCollection(name, requests) {
        this.collections.set(name, requests);
    }

    // Add other API testing methods...
}
