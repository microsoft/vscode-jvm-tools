import * as vscode from 'vscode';

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
