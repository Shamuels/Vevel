// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { File } from 'buffer';
import { Console } from 'console';
import { resolve } from 'path';
import { title } from 'process';
import { text } from 'stream/consumers';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { start } from 'repl';

//Note: Look into using await for thenables 
//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let current_exp = 0;
	let max_exp:number;
	let current_lvl:number;
	let status_bar: vscode.StatusBarItem;
	let filepathuri = vscode.Uri.file('/Users/kami/vscode-level/test.txt');
	let lvl_array:number[] = [];
	let lvl_information:Uint8Array;
	const encoder = new TextEncoder();
	const decoder = new TextDecoder()
	const wsedit = new vscode.WorkspaceEdit
	//Note: Make save only a few seconds after on document save has been activated

	//Create level bar
	status_bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);

	//Create initial file for storage of exp and lvl
	//Set default lvl and exp
	vscode.workspace.fs.stat(filepathuri).then(statFulfilled,statRejected)

	function statFulfilled(){
		vscode.workspace.fs.readFile(filepathuri).then(
			data =>{
			lvl_array = decoder.decode(data).split(",").map(Number)
			current_lvl = lvl_array[0]
			current_exp = lvl_array[1]
			max_exp = lvl_array[2]
			status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
			status_bar.show();
	})
	}

	function statRejected(){
			current_lvl = 1;
			current_exp = 0;
			max_exp = 100;
			saveData();
			status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
			status_bar.show();
	}

	
	//Provide experience for typing
	vscode.workspace.onDidChangeTextDocument((e:vscode.TextDocumentChangeEvent) => {
		increaseExp();
	});
	
	function increaseExp(){
		status_bar.text = `LVL ${current_lvl} ${current_exp++}/${max_exp}`;
		status_bar.command = 'level.helloWorld';
		status_bar.show();
		if(current_exp == max_exp){
			current_lvl++
			current_exp = 0
			max_exp = current_lvl*100
		}

	}

	//Occasionally stores current level to a text file
	function saveData(){
		lvl_array.push(current_lvl,current_exp,max_exp);
		lvl_information = encoder.encode(lvl_array.toString());
		vscode.workspace.fs.writeFile(filepathuri,lvl_information)
		vscode.workspace.applyEdit(wsedit)
		lvl_array.length = 0;
		console.log(lvl_array)
	}
	
	setInterval(saveData, 10000);



	context.subscriptions.push(status_bar)
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
