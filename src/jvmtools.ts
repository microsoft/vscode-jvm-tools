// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

import { Timer } from './timer';
import { JVM } from './jvm';
import { JVMListProvider } from './jvmlistprovider';

export class JVMTools {

    private jvmList: vscode.TreeView<JVM>;
    private refreshTimer: Timer;

    constructor(context: vscode.ExtensionContext) {
        // Register JVM List View
        const treeDataProvider = new JVMListProvider();
        this.jvmList = vscode.window.createTreeView('jvmList', { treeDataProvider });
        this.jvmList.onDidChangeVisibility(e => e.visible ? this.refreshTimer.start() : this.refreshTimer.stop(), undefined, context.subscriptions);

        // Register Commands
        vscode.commands.registerCommand('jvmList.refresh', () => treeDataProvider.refresh());
        vscode.commands.registerCommand('jvmList.openJConsole', (jvm: JVM) => this.openJConsole(jvm));
        vscode.commands.registerCommand('jvmList.jfrStart', (jvm: JVM) => this.startJFR(jvm));
        vscode.commands.registerCommand('jvmList.threadStackTrace', (jvm: JVM) => this.performThreadStackTrace(jvm));

        // Start refresh timer
        this.refreshTimer = new Timer(this.getConfig<number>("refreshTimeout"));
        this.refreshTimer.onTimeElapsed(() => {
            treeDataProvider.refresh();
        });
    }

    stopRefresh(): void {
        this.refreshTimer.stop();
    }

    getConfig<T>(key: string): T {
        const config = vscode.workspace.getConfiguration("jvmtools");
        if (config.has(key)) {
            return config.get<unknown>(key) as T;
        } else {
            return "" as any;
        }
    }

    openJConsole(jvm: JVM) {
        cp.exec('jconsole ' + jvm.pid);
    }

    startJFR(jvm: JVM) {
        const options = this.getConfig("jfrStartOptions");
        cp.exec(`jcmd ${jvm.pid} JFR.start ${options}`,);
    }

    performThreadStackTrace(jvm: JVM) {
        const options = this.getConfig("threadDumpOptions");
        cp.exec(`jcmd ${jvm.pid} Thread.print ${options}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error executing command: ${error.message}`);
                return;
            }

            // Write thread dump to file
            var filePath = path.join(os.tmpdir(), `${jvm.appname}-${new Date().toDateString()}.txt`);
            var content = stdout ? stdout : stderr;

            fs.writeFile(filePath, content, (error) => {
                if (error) {
                    console.log(`Error:${error.message}`);
                    return;
                }

                // Open dump file in vscode
                var openPath = vscode.Uri.file(filePath);
                vscode.workspace.openTextDocument(openPath).then(doc => {
                    vscode.window.showTextDocument(doc, vscode.ViewColumn.Active, false);
                });
            });
        });
    }
}
