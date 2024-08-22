"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
//Note: Look into using await for thenables 
//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    let char_number = 0;
    let saved_char_number;
    let imp_current_lvl;
    let current_lvl;
    let imp_final_lvl;
    let final_lvl;
    let filepath = '/Users/kami/vscode-level/test.txt';
    let filepathuri = vscode.Uri.file('/Users/kami/vscode-level/test.txt');
    //Checks if database is created runs code depending on whether or not it is
    if (fs.existsSync(filepath)) {
        fs.readFile(filepath, (err, imp_current_lvl) => {
            if (err) {
                console.error(err);
                return;
            }
            //console.log(current_lvl.toString('utf8'));
            current_lvl = Number(imp_current_lvl.toString('utf8'));
        });
    }
    else {
        const wsedit = new vscode.WorkspaceEdit;
        wsedit.createFile(filepathuri);
        vscode.workspace.applyEdit(wsedit);
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
    vscode.workspace.onDidChangeTextDocument((e) => {
        char_number++;
        saved_char_number = char_number;
        final_lvl = saved_char_number + current_lvl;
        imp_final_lvl = final_lvl.toString();
        fs.writeFile(filepath, imp_final_lvl, 'utf8', (err) => {
            if (err) {
                console.error(err);
            }
            else {
                // file written successfully
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map