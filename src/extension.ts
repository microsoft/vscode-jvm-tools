import * as vscode from 'vscode';
import { JVMTools } from './jvmtools';

export function activate(context: vscode.ExtensionContext) {
	new JVMTools(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
