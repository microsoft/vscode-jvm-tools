import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

export class JVMTools {

    private jvmList: vscode.TreeView<JVM>;

    constructor(context: vscode.ExtensionContext) {

        // Register JVM List View
        const treeDataProvider = new JVMProvider();
        this.jvmList = vscode.window.createTreeView('jvmList', { treeDataProvider });

        // Register Refresh List
        vscode.commands.registerCommand('jvmList.refresh', () => treeDataProvider.refresh());
        vscode.commands.registerCommand('jvmList.openJConsole', (jvm: JVM) => new JConsole().open(jvm));
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

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg.png'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg.png')
    };
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
        if (element) {
            // never?
        } else {
            return new JPS().listJVMs();
        }
    }

}

class JPS {

    jpspid: number = 0;

    parseJpsOutput(value: string | Buffer): JVM[] {
        console.log('Parsing value: ' + value);
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
        console.log('JPS parsing result: ' + list);
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
                console.log('log> stdout data event: ');
                console.log(data.toString());
                console.log('log> EOF');
                let jvms = this.parseJpsOutput(data);
                if (jvms !== null) {
                    list = list.concat(jvms);
                }
            });

            jps.on('close', (code) => {
                console.log(`jps process exited with code ${code}`);
                resolve(list);
            });

            jps.unref();
        });
    }
}

class JCMD {

}

class JFR {

}

class JConsole {
    open(jvm: JVM) {
        cp.exec('jconsole ' + jvm.pid);
    }
}

class JInfo {
    extract(pid: number): string {
        return '';
    }
}
