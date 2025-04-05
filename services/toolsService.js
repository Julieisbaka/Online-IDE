class ToolsService {
    constructor() {
        this.tools = new Map([
            ['jsonFormatter', this.formatJSON],
            ['jsonMinifier', this.minifyJSON],
            ['jsonToYaml', this.convertJSONtoYAML],
            ['base64', this.convertBase64],
            ['sha256', this.generateSHA256],
            ['hexConverter', this.convertHex],
            ['binaryConverter', this.convertBinary]
        ]);
    }

    formatJSON(input) {
        try {
            return JSON.stringify(JSON.parse(input), null, 2);
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }

    minifyJSON(input) {
        try {
            return JSON.stringify(JSON.parse(input));
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }

    async generateSHA256(input) {
        const msgBuffer = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Add other tool methods...
}
