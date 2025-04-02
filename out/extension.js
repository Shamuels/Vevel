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
//My extension will be running while someone is doing other things on their pc so it needs to be asynchronous or else its gonna hitch them
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    let current_exp;
    let max_exp;
    let current_lvl;
    let percentage;
    let tutorial_msg;
    const workspacefolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const status_bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);
    const debounce_commit = debounce_inherit(getCommit, 1000);
    const debounce_exp = debounce_inherit(increaseExp, 70);
    let mode = context.globalState.get("mode") || "enhanced";
    ;
    //bug for some reason level bar is full after leveling up if you change modes
    //add animation
    //Commands
    //switch level bar between basic and enhanced mode
    vscode.commands.registerCommand('extension.ChangeMode', () => {
        if (mode == "basic") {
            mode = "enhanced";
            context.globalState.update("mode", mode);
            update();
        }
        else if (mode == "enhanced") {
            mode = "basic";
            context.globalState.update("mode", mode);
            update();
        }
    });
    //Generates status bar
    //Create initial or last version of level bar based on mode
    generateStatusBar(context);
    //Retrieves current level info from vscode and populates status bar with it
    function generateStatusBar(context) {
        current_lvl = context.globalState.get("current_lvl") || 1;
        current_exp = context.globalState.get("current_exp") || 0;
        max_exp = context.globalState.get("max_exp") || Math.round(100 * Math.pow(2, 1.5));
        tutorial_msg = context.globalState.get("tutorial_msg") || false;
        percentage = Math.round(current_exp / max_exp * 100);
        update();
        if (tutorial_msg == false) {
            vscode.window.showInformationMessage('Welcome!!! Use shift+m to change the look of your level bar.');
            tutorial_msg = true;
            context.globalState.update("tutorial_msg", tutorial_msg);
        }
    }
    //Exp methods
    //Provides experience mainly for typing but also gives exp for other changes in the doc
    let editdocument = vscode.workspace.onDidChangeTextDocument((e) => {
        debounce_exp();
    });
    //Provides experience for saving document
    let savedocument = vscode.workspace.onDidSaveTextDocument((e) => {
        debounce_exp();
    });
    //Watches COMMIT_EDITMSG for changes to see if commit is made
    //If changes are made to COMMIT_EDITMSG commit is verified through a debounce function and exp is provided to level bar
    if (workspacefolder !== undefined) {
        const commitMsgPath = `${workspacefolder}/.git/COMMIT_EDITMSG`;
        if ((0, node_fs_2.existsSync)(commitMsgPath)) {
            (0, node_fs_1.watch)(commitMsgPath, (e) => {
                if (gitExtension?.enabled === true && git?.state === "initialized") {
                    debounce_commit();
                }
            });
        }
    }
    async function getCommit() {
        const commit = await git?.repositories[0].log();
        if (commit != undefined && workspacefolder != undefined) {
            const topdir = commit[0].hash.substring(0, 2);
            const subdir = commit[0].hash.substring(2);
            if ((0, node_fs_2.existsSync)(workspacefolder + "//.git//objects//" + topdir + "//" + subdir)) {
                current_exp += 35;
                percentage = Math.round(current_exp / max_exp * 100);
                if (current_exp == max_exp) {
                    levelUP();
                }
                else if (current_exp > max_exp) {
                    levelUpOverflow();
                }
                else {
                    update();
                }
                saveData(context);
            }
        }
    }
    //Base debounce function that can be inherited by other custom debounces
    function debounce_inherit(func, ms) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, ms);
        };
    }
    ;
    function update() {
        if (mode == "basic") {
            status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
            status_bar.show();
        }
        else if (mode == "enhanced") {
            status_bar.text = `${current_lvl} $(${percentage}-0)`;
            status_bar.show();
        }
    }
    function increaseExp() {
        current_exp++;
        percentage = Math.round(current_exp / max_exp * 100);
        if (current_exp == max_exp) {
            levelUP();
        }
        else {
            update();
        }
        saveData(context);
    }
    function levelUP() {
        current_lvl++;
        current_exp = 0;
        let next_level = current_lvl;
        next_level++;
        max_exp = Math.round(100 * Math.pow(next_level, 1.5));
        percentage = Math.round(current_exp / max_exp * 100);
        if (mode == "basic") {
            status_bar.text = `LVL ${current_lvl} ${current_exp}/${max_exp}`;
            status_bar.show();
        }
        else if (mode == "enhanced") {
            status_bar.text = `${current_lvl} $(${percentage}-0)`;
            status_bar.show();
        }
        saveData(context);
    }
    function levelUpOverflow() {
        current_lvl++;
        current_exp -= max_exp;
        let next_level = current_lvl;
        next_level++;
        max_exp = Math.round(100 * Math.pow(next_level, 1.5));
        percentage = Math.round(current_exp / max_exp * 100);
        update();
        saveData(context);
    }
    //Stores current level information 
    function saveData(context) {
        context.globalState.update("current_lvl", current_lvl);
        context.globalState.update("current_exp", current_exp);
        context.globalState.update("max_exp", max_exp);
        context.globalState.update("mode", mode);
    }
    status_bar.dispose;
    context.subscriptions.push(editdocument);
    context.subscriptions.push(savedocument);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map