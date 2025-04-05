class ErrorHandler {
    constructor() {
        this.errorList = new Map();
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.onerror = (msg, url, line, col, error) => this.handleError(error);
        window.addEventListener('unhandledrejection', (event) => this.handlePromiseError(event.reason));
    }

    handleError(error) {
        const errorId = Date.now();
        this.errorList.set(errorId, {
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        });
        this.updateErrorPanel();
    }

    // Add more error handling methods...
}

window.errorHandler = new ErrorHandler();
