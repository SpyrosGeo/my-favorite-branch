// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';

interface BranchOption {
	id: string;
	label: string;
	description?: string;
	detail?: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let addBranchToFavorites = vscode.commands.registerCommand('extension.addToFavorites', () => {
		let favoriteBranches = getFavoriteBranches(context);
		const currentBranch = getCurrentBranch();
		const newBranch: BranchOption = { id: currentBranch, label: currentBranch };
		//TODO 
		//append to favorites array and save to storage
		const newFavoriteBranches = JSON.stringify([...favoriteBranches, newBranch]);

		context.globalState.update('favoriteBranches', newFavoriteBranches);
		vscode.window.showInformationMessage(`Saved branch: ${currentBranch} to favorites`)
	});

	let checkoutFavoriteBranch = vscode.commands.registerCommand('extension.openBranchSelector', () => {
		const branch = vscode.window.showQuickPick(getFavoriteBranches(context), { canPickMany: false, placeHolder: 'My favorite branches' });
	});


	context.subscriptions.push(checkoutFavoriteBranch);
}

// function createStatusBarItem() {
// 	const iconPath = {
// 		light: path.join(__filename, '..', 'resources', 'light', 'my-icon.png'),
// 		dark: path.join(__filename, '..', 'resources', 'dark', 'my-icon.png')
// 	};
// 	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
// 	statusBarItem.text = '$(my-icon)';
// 	statusBarItem.tooltip = 'Click to open drawer';
// 	statusBarItem.command = 'myExtension.openDrawer';
// 	statusBarItem.color = '#fff';
// 	statusBarItem.show();
// 	return statusBarItem;
// }
function getFavoriteBranches(context: vscode.ExtensionContext): BranchOption[] {
	//get json string from storage
	const jsonString: string | undefined = context.globalState.get('favoriteBranches');
	// return jsonString ? JSON.parse(jsonString) : [];
	return [
		{ id: 'test1', label: 'Item 1' },
		{ id: 'test2', label: 'Item 2' },
		{ id: 'test3', label: 'Item 3' },
	];
};


function getCurrentBranch(): string {
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
	const git = gitExtension.getAPI(1);
	console.log('git', git.arg1.git);
	const repo = git.repositories[0];
	const currentBranch = repo.state.head ? repo.state.head.name : 'Detached head state';
	return currentBranch;


};

// This method is called when your extension is deactivated
export function deactivate() { }
