// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	statusBarItem.text = '$(git-branch)';
	statusBarItem.tooltip = 'click to select a branch';
	statusBarItem.command = 'extension.openBranchSelector';
	statusBarItem.show();
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "my-favorite-branch" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.openBranchSelector', async () => {
		// The code you place here will be executed every time your command is executed
		let repository;
		if (vscode.window.activeTextEditor?.document.uri) {

			repository = vscode.workspace.getWorkspaceFolder(vscode.window?.activeTextEditor?.document.uri);
		}
		if (repository) {
			const git = vscode.extensions.getExtension('vscode.git')?.exports;
			const branches = await git?.getRepository(repository.uri)?.getBranches();
			if (branches) {
				const branchNames = branches.map((branch: any) => branch.name);
				const selectedBranch = await vscode.window.showQuickPick(branchNames);
				if (selectedBranch) {
					// TODO: Do something with the selected branch
					console.log(`Selected branch: ${selectedBranch}`);
				}
			} else {
				vscode.window.showErrorMessage('Failed to get the branch list');
			}
		} else {
			vscode.window.showErrorMessage('This command only works in a workspace folder');
		}

	});

	context.subscriptions.push(disposable);
}

// function getWebviewContent(repo: vscode.WorkspaceFolder): string {
// 	return `        <!DOCTYPE html>
//         <html>
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Branch Selector</title>
//         </head>
//         <body>
//             <h1>Branch Selector</h1>
//             <ul>
//                 ${getBranches(repo).map(branch => `<li>${branch}</li>`).join('')}
//             </ul>
//         </body>
//         </html>`;
// }

// function getBranches(repo: vscode.WorkspaceFolder): string[] {
// 	return ['master', 'dev', 'feature/z'];
// }

// This method is called when your extension is deactivated
export function deactivate() { }
