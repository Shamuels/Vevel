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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const node_fs_1 = require("node:fs");
const node_fs_2 = require("node:fs");
//TODO
//get debouncing working for commit function and saving
//look into exp being gained from git commit
//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    let current_exp = 0;
    let max_exp;
    let current_lvl;
    let filepathuri = vscode.Uri.file('/Users/kami/vscode-level/test.txt');
    const workspacefolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const wsedit = new vscode.WorkspaceEdit;
    const status_bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);
    //need to confirm that the extension is enabled and initalized before creating listener
    //can do this through then statements and so on
    async function getCommit() {
        const commit = await git?.repositories[0].log();
        if (commit != undefined && workspacefolder != undefined) {
            const topdir = commit[0].hash.substring(0, 2);
            const subdir = commit[0].hash.substring(2);
            if ((0, node_fs_2.existsSync)(workspacefolder + "//.git//objects//" + topdir + "//" + subdir)) {
                current_exp += 20;
                status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
                status_bar.command = 'level.helloWorld';
                status_bar.show();
            }
        }
    }
    function debounce_inherit(func, ms) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, ms);
        };
    }
    const debounce_commit = debounce_inherit(getCommit, 1000);
    const debounce_exp = debounce_inherit(increaseExp, 70);
    //Note: Make save only a few seconds after on document save has been activated
    //Create level bar
    //Create initial file for storage of exp and lvl
    //Set default lvl and exp
    vscode.workspace.fs.stat(filepathuri).then(statFulfilled, statRejected);
    function statFulfilled() {
        vscode.workspace.fs.readFile(filepathuri).then(data => {
            [current_lvl, current_exp, max_exp] = decoder.decode(data).split(",").map(Number);
            status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
            status_bar.show();
        });
    }
    function statRejected() {
        current_lvl = 1;
        current_exp = 0;
        max_exp = 100;
        saveData();
        status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
        status_bar.show();
    }
    //Provide experience for typing
    //adds 1 for text written in the document
    //add +2 changes for different actions like saves and undos (fun randomizer element)
    vscode.workspace.onDidChangeTextDocument((e) => {
        //debounce_exp()
    });
    vscode.workspace.onDidSaveTextDocument((e) => {
        debounce_exp();
    });
    if (workspacefolder != undefined) {
        (0, node_fs_1.watch)(workspacefolder + "//.git//COMMIT_EDITMSG", (e) => {
            if (gitExtension?.enabled == true && git?.state == "initialized") {
                debounce_commit();
            }
        });
    }
    function increaseExp() {
        current_exp++;
        status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
        status_bar.command = 'level.helloWorld';
        status_bar.show();
        if (current_exp == max_exp) {
            current_lvl++;
            current_exp = 0;
            max_exp = current_lvl * 100;
        }
    }
    //Occasionally stores current level to a text file
    function saveData() {
        let lvl_information = encoder.encode([current_lvl, current_exp, max_exp].toString());
        vscode.workspace.fs.writeFile(filepathuri, lvl_information);
        vscode.workspace.applyEdit(wsedit);
    }
    //Interval will eventually be replaced with debouncing so no more 
    //spamming the disk even if the user isnt doing anything
    setInterval(saveData, 20000);
    context.subscriptions.push(status_bar);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map