// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { simpleGit, SimpleGit, CleanOptions, TaskOptions } from 'simple-git';
const { exec, spawn } = require('child_process');
interface BranchOption {
	id: string;
	label: string;
	description?: string;
	detail?: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let statusBarItem:vscode.StatusBarItem;
let favoriteBranches:BranchOption[] ;
let currentBranch:string;
let isFavorite:boolean;
export function activate(context: vscode.ExtensionContext) {
	const currentWorkingSpace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	const git: SimpleGit = simpleGit({ binary: 'git', baseDir: currentWorkingSpace, maxConcurrentProcesses: 6 }).clean(CleanOptions.FORCE);
	setGitData(context,git);
	const removeBranchFromFavorites = vscode.commands.registerCommand('extension.removeFromFavorites', async () => {
		removeBranch(context);
	});
	context.subscriptions.push(removeBranchFromFavorites);
	let addBranchToFavorites = vscode.commands.registerCommand('extension.addToFavorites', async () => {
		console.log('currentBranch inside', currentBranch);

		const newBranch: BranchOption = { id: currentBranch, label: currentBranch };

		setFavoriteBranches(context, favoriteBranches, newBranch);

		vscode.window.showInformationMessage(`Saved branch: ${currentBranch} to favorites`);
	});
	context.subscriptions.push(addBranchToFavorites);
	
	const openBranchSelectorId = 'extension.openBranchSelector'
	let checkoutFavoriteBranch = vscode.commands.registerCommand(openBranchSelectorId, async () => {
		const branch = await vscode.window.showQuickPick(getFavoriteBranches(context), { canPickMany: false, placeHolder: 'My favorite branches' });
		if (!branch?.label) { return; };
		git.checkout(branch.label, (err) => {
			if (err) {
				vscode.window.showInformationMessage(`err ${err}`);
			} else { vscode.window.showInformationMessage(`switch to ${branch?.label} branch`); }
		}).then(() => {
		});
	});


	context.subscriptions.push(checkoutFavoriteBranch);

	vscode.extensions.onDidChange(()=>{
	updateStatusBarIcon()
	});

	
}
function updateStatusBarIcon(){
 const icon = getStatusBarIcon();
 vscode.window.setStatusBarMessage(icon);	
}

function getStatusBarIcon():string{
	return isFavorite ? '$(star-full)':'$(star-empty)';
}
async function fetchGitData(context:vscode.ExtensionContext,git:SimpleGit){
		 favoriteBranches = getFavoriteBranches(context);
		 currentBranch = await getCurrentBranch(context, git);
		 isFavorite = favoriteBranches.some(branch =>branch.label.includes(currentBranch)); 

}
async function setGitData(ctx:vscode.ExtensionContext,git:SimpleGit){
	 await fetchGitData(ctx,git);
	
		
	_showStatusBarItem('extension.openBranchSelector',isFavorite);
}
async function _showStatusBarItem(openBranchSelectorId:string, isFavorite?:boolean) {

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	statusBarItem.text= getStatusBarIcon();
	statusBarItem.tooltip = "Opens the git favorites drawer";
	statusBarItem.command = openBranchSelectorId;
	statusBarItem.show();
}
function removeBranch(context: vscode.ExtensionContext, id?: string): void {
	if (!id) {
		context.globalState.update('favoriteBranches', '');
		return;
	}
	if (id) {
		let favoriteBranches = getFavoriteBranches(context);
		favoriteBranches = favoriteBranches.filter((branch: BranchOption) => branch.id !== id);
		setFavoriteBranches(context, favoriteBranches);
	}

}


function getFavoriteBranches(context: vscode.ExtensionContext): BranchOption[] {
	//get json string from storage
	const jsonString: string | undefined = context.globalState.get('favoriteBranches');
	return jsonString ? JSON.parse(jsonString) : [];
	// return [
	// 	{ id: 'test1', label: 'Item 1' },
	// 	{ id: 'test2', label: 'Item 2' },
	// 	{ id: 'test3', label: 'Item 3' },
	// ];
};
function setFavoriteBranches(context: vscode.ExtensionContext, favoriteBranches: BranchOption[], newBranch?: BranchOption) {
	let newFavoriteBranches: string;
	if (newBranch) {
		newFavoriteBranches = JSON.stringify([...favoriteBranches, newBranch]);
	} else {
		newFavoriteBranches = JSON.stringify(favoriteBranches);
	}

	context.globalState.update('favoriteBranches', newFavoriteBranches);
}

async function getCurrentBranch(context: vscode.ExtensionContext, git: SimpleGit): Promise<string> {

	let currentBranch = '';
	// if (process.platform === "win32") {
	// 	const workspaceFolders = vscode.workspace.workspaceFolders;
	// 	if (workspaceFolders) {
	// 		const currentWorkSpace = workspaceFolders[0];
	// 		currentBranch = await getCurrentBranchWindows(currentWorkSpace);
	// 	}
	// } else {
	try {
		currentBranch = (await git.branchLocal()).current;
	} catch (error) {
		console.log('error', error);
	}  // log error
	// }
	console.log('currentBranch', currentBranch);
	return currentBranch;
};

async function getCurrentBranchWindows(dir: any): Promise<string> {
	return new Promise((resolve, reject) => {
		let command = 'git branch --show-current';
		exec(command, { cmd: dir }, (error: any, stdout: any, stderr: any) => {
			if (error) {
				reject(error);
				return
			} else {
				const branchName = stdout.trim();
				if (branchName.length) {
					reject(new Error('failed'))
					return;
				}
				resolve(branchName);
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
