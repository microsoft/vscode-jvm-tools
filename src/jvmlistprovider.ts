import * as vscode from 'vscode';
import * as cp from 'child_process';

import { JVM } from './jvm';

export class JVMListProvider implements vscode.TreeDataProvider<JVM> {
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
