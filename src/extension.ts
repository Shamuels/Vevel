// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { File } from 'buffer';
import { Console } from 'console';
import { resolve } from 'path';
import { title } from 'process';
import { text } from 'stream/consumers';
import * as vscode from 'vscode';
import * as fs from 'fs';

//Note: Look into using await for thenables 
//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let char_number = 0;
	let saved_char_number:number;
	let imp_current_lvl:string;
	let current_lvl:number;
	let imp_final_lvl:string;
	let final_lvl:number;

	let filepath = '/Users/kami/vscode-level/test.txt';
	let filepathuri = vscode.Uri.file('/Users/kami/vscode-level/test.txt');

	
	//Checks if database is created runs code depending on whether or not it is
	if(fs.existsSync(filepath)){
		fs.readFile(filepath, (err:any, imp_current_lvl) => {
			if (err) {
			  console.error(err);
			  return;
			}
			//console.log(current_lvl.toString('utf8'));
			current_lvl = Number(imp_current_lvl.toString('utf8'))

		  });
		}else{
		const wsedit = new vscode.WorkspaceEdit
		wsedit.createFile(filepathuri);
		vscode.workspace.applyEdit(wsedit)
		}


  
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

	//Collect and store input to database
	vscode.workspace.onDidChangeTextDocument((e:vscode.TextDocumentChangeEvent) => {
		char_number++;
		saved_char_number = char_number;
		final_lvl = saved_char_number + current_lvl;
		imp_final_lvl = final_lvl.toString();		

		fs.writeFile(filepath, imp_final_lvl, 'utf8' ,(err: any) => {
			if (err) {
			  console.error(err);
			} else {
			  // file written successfully
			}
		  });

	});
	
	
	context.subscriptions.push(disposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
