// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { Timer } from './timer';
import * as fs from 'fs';
import * as os from 'os';

export class JVMTools {

    private jvmList: vscode.TreeView<JVM>;
    private refreshTimer: Timer;

    constructor(context: vscode.ExtensionContext) {
        // Register JVM List View
        const treeDataProvider = new JVMProvider();
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

export class JVM extends vscode.TreeItem {
    constructor(
        public readonly pid: number,
        public readonly appname: string
    ) {
        super("[" + pid + "] " + appname, vscode.TreeItemCollapsibleState.None);
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    get description(): string {
        return this.appname;
    }

    contextValue = 'jvm';

    iconPath = new vscode.ThemeIcon("symbol-property");
}

class JVMProvider implements vscode.TreeDataProvider<JVM> {
    private _onDidChangeTreeData: vscode.EventEmitter<JVM | undefined> = new vscode.EventEmitter<JVM | undefined>();
    readonly onDidChangeTreeData: vscode.Event<JVM | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: JVM): vscode.TreeItem {
        return element;
    }

    getChildren(element?: JVM): vscode.ProviderResult<JVM[]> {
        if (!element) {
            return new JPS().listJVMs();
        }
    }

}

class JPS {

    private jpspid: number = 0;

    parseJpsOutput(value: string | Buffer): JVM[] {
        if (value instanceof Buffer) {
            value = value.toString();
        }

        const lines = value.split(/\r?\n/);
        const list: JVM[] = [];
        for (let entry of lines) {
            if (entry) {
                const values = entry.split(' ');
                const pid = parseInt(values[0]);
                const app = values[1];

                if (pid !== this.jpspid) {
                    list.push(new JVM(pid, app));
                }
            }
        }
        list.sort((a, b) => a.pid - b.pid);
        return list;
    }

    async listJVMs(): Promise<JVM[]> {
        return new Promise(async resolve => {
            const jps = cp.spawn('jps', { stdio: 'pipe', detached: false });
            this.jpspid = jps.pid;

            jps.on('error', (data) => {
                console.error('jps error: ' + data);
                return [new JVM(-500, 'There was an error listing the JVMs.')];
            });

            let list: JVM[] = [];

            jps.stdout.on('data', (data) => {
                let jvms = this.parseJpsOutput(data);
                if (jvms !== null) {
                    list = list.concat(jvms);
                }
            });

            jps.on('close', (code) => {
                resolve(list);
            });

            jps.unref();
        });
    }
}
