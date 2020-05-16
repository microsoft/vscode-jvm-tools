// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

export class Timer {

    private eventEmitter = new vscode.EventEmitter<void>();
    private seconds: number;
    private intervalObject: NodeJS.Timeout | undefined;

    constructor(seconds: number) {
        this.seconds = seconds;
    }

    get onTimeElapsed(): vscode.Event<void> {
        return this.eventEmitter.event;
    }

    private fireEvent(): void {
        try {
            this.eventEmitter.fire();
        } catch (e) {
            this.stop();
            console.log(e);
        }
    }

    start() {
        if (this.intervalObject === undefined) {
            this.intervalObject = setInterval(() => {
                this.fireEvent();
            }, this.seconds * 1000);
        }
    }

    stop() {
        if (this.intervalObject) {
            clearInterval(this.intervalObject);
            this.intervalObject = undefined;
        }
    }

}
