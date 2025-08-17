import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		return;
	}

	workspaceFolders.forEach(folder => {
		const watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(folder, '**/*'),
			false, // Don't ignore creates
			true,  // Ignore changes
			true   // Ignore deletes
		);

		const disposable = watcher.onDidCreate(async (uri) => {
			await handleNewFile(uri, folder.uri.fsPath);
		});

		context.subscriptions.push(watcher, disposable);
	});
}

async function handleNewFile(fileUri: vscode.Uri, workspaceRoot: string): Promise<void> {
	try {
		const relativePath = path.relative(workspaceRoot, fileUri.fsPath);
		
		// Skip .git directory files
		if (relativePath.startsWith('.git/') || relativePath.startsWith('.git\\')) {
			return;
		}

		// Get git repository
		const gitExtension = vscode.extensions.getExtension('vscode.git');
		if (!gitExtension) {
			return;
		}

		const git = gitExtension.exports.getAPI(1);
		const repo = git.getRepository(fileUri);
		if (!repo) {
			return;
		}

		// Check if file should be ignored by gitignore
		if (await isIgnoredByGit(relativePath, workspaceRoot)) {
			return;
		}

		// Add file to git
		await repo.add([fileUri.fsPath]);
		
		// Show toast notification
		const fileName = path.basename(fileUri.fsPath);
		vscode.window.showInformationMessage(`Auto-added: ${fileName}`);
		
	} catch (error) {
		// Silent failure - just don't show notification
	}
}

async function isIgnoredByGit(filePath: string, workspaceRoot: string): Promise<boolean> {
	try {
		const gitignorePath = path.join(workspaceRoot, '.gitignore');
		if (!fs.existsSync(gitignorePath)) {
			return false;
		}

		const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
		const patterns = gitignoreContent
			.split('\n')
			.map(line => line.trim())
			.filter(line => line && !line.startsWith('#'));

		for (const pattern of patterns) {
			if (pattern.includes('*') || pattern.includes('?')) {
				// Convert glob pattern to regex
				let regexPattern = pattern
					.replace(/[.+^${}()|[\]\\]/g, '\\$&')
					.replace(/\*/g, '.*')
					.replace(/\?/g, '.');
				
				regexPattern = '^' + regexPattern + '$';
				
				const regex = new RegExp(regexPattern);
				if (regex.test(path.basename(filePath)) || regex.test(filePath)) {
					return true;
				}
			} else if (filePath.includes(pattern) || path.basename(filePath) === pattern) {
				return true;
			}
		}

		return false;
	} catch (error) {
		return false;
	}
}

export function deactivate() {}
