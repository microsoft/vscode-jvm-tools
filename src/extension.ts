// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { JVMTools } from './jvmtools';

export function activate(context: vscode.ExtensionContext) {
	new JVMTools(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
