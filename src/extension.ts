// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { JVMTools } from './jvmtools';

let jvmtools: JVMTools;

export async function activate(context: vscode.ExtensionContext) {
	jvmtools = new JVMTools(context);
}

// this method is called when your extension is deactivated
export async function deactivate() { 
	if (jvmtools) {
		jvmtools.stopRefresh();
	}
}
