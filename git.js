class GitManager {
    constructor() {
        this.repoStatus = {
            branch: 'main',
            modified: [],
            staged: [],
            commits: []
        };
        this.init();
    }

    init() {
        this.updateSidebar();
        document.getElementById('git-btn').addEventListener('click', () => {
            this.toggleGitPanel();
        });
    }

    toggleGitPanel() {
        const sidebarContent = document.getElementById('sidebar-content');
        if (sidebarContent.classList.contains('git-active')) {
            sidebarContent.innerHTML = '';
            sidebarContent.classList.remove('git-active');
        } else {
            this.showGitPanel();
        }
    }

    showGitPanel() {
        const sidebarContent = document.getElementById('sidebar-content');
        sidebarContent.classList.add('git-active');
        this.updateSidebar();
    }

    updateSidebar() {
        if (!document.getElementById('sidebar-content').classList.contains('git-active')) return;

        const content = document.getElementById('sidebar-content');
        content.innerHTML = `
            <div class="git-panel">
                <div class="git-header">
                    <span>Source Control</span>
                    <span class="branch-name">${this.repoStatus.branch}</span>
                </div>
                <div class="git-changes">
                    <div class="changes-header">Changes</div>
                    ${this.renderChanges()}
                </div>
                <div class="git-staged">
                    <div class="staged-header">Staged Changes</div>
                    ${this.renderStaged()}
                </div>
            </div>
        `;
    }

    renderChanges() {
        return this.repoStatus.modified
            .map(file => `
                <div class="change-item">
                    <span class="change-status">M</span>
                    <span class="change-file">${file}</span>
                    <button onclick="window.gitManager.stageFile('${file}')">+</button>
                </div>
            `).join('') || '<div class="empty-message">No changes</div>';
    }

    renderStaged() {
        return this.repoStatus.staged
            .map(file => `
                <div class="staged-item">
                    <span class="staged-status">✓</span>
                    <span class="staged-file">${file}</span>
                    <button onclick="window.gitManager.unstageFile('${file}')">-</button>
                </div>
            `).join('') || '<div class="empty-message">No staged changes</div>';
    }

    handleCommand(command, callback) {
        const [cmd, ...args] = command.split(' ');
        
        switch(cmd) {
            case 'status':
                this.status(callback);
                break;
            case 'add':
                this.add(args[0], callback);
                break;
            case 'commit':
                if (args[0] === '-m') {
                    args.shift();
                    this.commit(args.join(' '), callback);
                } else {
                    callback('Error: Please provide a commit message with -m');
                }
                break;
            case 'push':
                this.push(callback);
                break;
            default:
                callback(`Unknown git command: ${cmd}`);
        }
    }

    status(callback) {
        const status = [
            `On branch ${this.repoStatus.branch}`,
            'Changes not staged for commit:',
            ...this.repoStatus.modified.map(file => `  modified: ${file}`),
            '',
            'Changes staged for commit:',
            ...this.repoStatus.staged.map(file => `  added: ${file}`),
        ].join('\n');
        callback(status);
    }

    add(file, callback) {
        const index = this.repoStatus.modified.indexOf(file);
        if (index > -1) {
            this.repoStatus.modified.splice(index, 1);
            this.repoStatus.staged.push(file);
            callback(`Added ${file} to staged changes`);
            this.updateSidebar();
        } else {
            callback(`File ${file} not found in changes`);
        }
    }

    commit(message, callback) {
        if (this.repoStatus.staged.length === 0) {
            callback('No changes staged for commit');
            return;
        }

        this.repoStatus.commits.push({
            message,
            files: [...this.repoStatus.staged],
            timestamp: new Date()
        });
        this.repoStatus.staged = [];
        callback(`[${this.repoStatus.branch}] ${message}`);
        this.updateSidebar();
    }

    push(callback) {
        if (this.repoStatus.commits.length === 0) {
            callback('No commits to push');
            return;
        }
        
        callback('Simulated push to remote repository');
        this.repoStatus.commits = [];
        this.updateSidebar();
    }

    // UI Actions
    stageFile(file) {
        this.add(file, () => this.updateSidebar());
    }

    unstageFile(file) {
        const index = this.repoStatus.staged.indexOf(file);
        if (index > -1) {
            this.repoStatus.staged.splice(index, 1);
            this.repoStatus.modified.push(file);
            this.updateSidebar();
        }
    }
}

window.gitManager = new GitManager();
