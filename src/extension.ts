// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { File } from 'buffer';
import { resolve } from 'path';
import { title } from 'process';
import * as vscode from 'vscode';
let fs = require('fs');


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let char_number = 0;
	let saved_char_number:string;
	let array = new Uint8Array(1)
	let data;
	
	//Create "Database"
	let filepath = vscode.Uri.file('c:\\Users\\kami\\vscode-level\\test.txt');
	const wsedit = new vscode.WorkspaceEdit
	wsedit.createFile(filepath,{ignoreIfExists:true});
	vscode.workspace.applyEdit(wsedit)

  
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "level" is now active!');
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	//
	
	let disposable = vscode.commands.registerCommand('level.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-level!');	

	});

	//Collect Input
	vscode.workspace.onDidChangeTextDocument((e:vscode.TextDocumentChangeEvent) => {
		char_number++;
		saved_char_number = char_number.toString();
		console.log(char_number);
		console.log(array)
		data = Buffer.from(saved_char_number, 'utf8');
		vscode.workspace.fs.writeFile(filepath,data)
	});
	

	vscode.workspace.onDidSaveTextDocument((e:vscode.TextDocument) => {
		console.log("saved");
	}
	
	);
	



	var nuts = vscode.window.createTerminal("Test");		
/*
	vscode.window.onDidCloseTerminal((e:vscode.Terminal) => {
		console.log("closed");
		}

	);
*/
	context.subscriptions.push(disposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
