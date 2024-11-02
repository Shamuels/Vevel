// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';
import { watch } from 'node:fs';
import { existsSync } from 'node:fs';
import { constrainedMemory } from 'process';
import { Console } from 'console';
import { time } from 'node:console';


//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let current_exp: any;
	let max_exp: any;
	let current_lvl: any;
	let filepathuri = vscode.Uri.file(context.extensionPath + "/expinfo.txt");
	const workspacefolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath
	const encoder = new TextEncoder()
	const decoder = new TextDecoder()
	const wsedit = new vscode.WorkspaceEdit
	const status_bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
	const git = gitExtension?.getAPI(1);
	const debounce_commit = debounce_inherit(getCommit, 1000)
	const debounce_exp = debounce_inherit(increaseExp, 70)

	//Uses metadata to identify whether a file exists or not (could just use file exists but whatever)
	//If fulfilled grab info from file and display them on level bar
	//If rejected base level stats are set for level bar and saved to file


	generateStatusBar(context)

	//Provides experience mainly for typing but also gives exp for other changes in the doc
	let editdocument = vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		debounce_exp()
	});

	//Provides experience for saving document
	let savedocument = vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
		debounce_exp()
	})

	//Retrieves current level info from vscode and populates status bar with it
	function generateStatusBar(context: vscode.ExtensionContext) {
		current_lvl = context.globalState.get<number>("current_lvl") || 1
		current_exp = context.globalState.get<number>("current_exp") || 0
		max_exp = context.globalState.get<number>("max_exp") || 100
		status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
		status_bar.show();
	}

	//Watches COMMIT_EDITMSG for changes to see if commit is made
	//If changes are made to COMMIT_EDITMSG commit is verified through a debounce function and exp is provided to level bar
	if (workspacefolder != undefined) {
		watch(workspacefolder + "//.git//COMMIT_EDITMSG", (e: any) => {
			if (gitExtension?.enabled == true && git?.state == "initialized") {
				debounce_commit()
			}
		})
	}

	async function getCommit() {
		const commit = await git?.repositories[0].log()
		if (commit != undefined && workspacefolder != undefined) {
			const topdir = commit[0].hash.substring(0, 2)
			const subdir = commit[0].hash.substring(2)
			if (existsSync(workspacefolder + "//.git//objects//" + topdir + "//" + subdir)) {
				current_exp += 20
				status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
				status_bar.command = 'level.helloWorld';
				status_bar.show();
			}
		}
	}


	//Base debounce function that can be inherited by other custom debounces
	function debounce_inherit(func: any, ms: number) {
		let timeout: any
		return function () {
			clearTimeout(timeout)
			timeout = setTimeout(func, ms)
		}
	}



	//Base function is called to increase a user's exp
	function increaseExp() {
		current_exp++
		status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
		status_bar.command = 'level.helloWorld';
		status_bar.show();
		if (current_exp == max_exp) {
			current_lvl++
			current_exp = 0
			max_exp = current_lvl * 100
		}

	}

	//Stores current level information 
	function saveData(context: vscode.ExtensionContext) {
		context.globalState.update("current_lvl", current_lvl)
		context.globalState.update("current_exp", current_exp)
		context.globalState.update("max_exp", max_exp)
	}


	setInterval(() => saveData(context), 20000);


	context.subscriptions.push(status_bar)
	context.subscriptions.push(editdocument)
	context.subscriptions.push(savedocument)

}

// This method is called when your extension is deactivated
export function deactivate() { }
