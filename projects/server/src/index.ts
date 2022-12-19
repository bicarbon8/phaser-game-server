#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as cp from 'child_process';
import { GameServer } from "./game-server";
import { CommandLineOptions, OptionDefinition } from 'command-line-args';

const cla = require('command-line-args');

const availableOptions: Array<OptionDefinition> = [
    {name: 'start', alias: 's', type: Boolean, defaultOption: false},
    {name: 'end', alias: 'e', type: Boolean, defaultOption: false},
    {name: 'background', alias: 'b', type: Boolean, defaultOption: false}
];
const outputFile = path.join(process.cwd(), '.phaser-game-server-id');

const startBackground = () => {
    const args = process.argv.filter(a => !a.includes('-b'));
    const child: cp.ChildProcess = cp.spawn(args.join(' '), {
        detached: true,
        stdio: 'inherit'
    });
    if (child.pid) {
        fs.writeFileSync(outputFile, `${child.pid}`, {encoding: 'utf-8'});
    } else {
        console.error(`unable to start background process using '${args.join(' ')}'`);
    }
}

const startForeground = () => {
    const server = new GameServer();
    server.startGameEngine();
}

const endBackground = () => {
    if (fs.existsSync(outputFile)) {
        const id = fs.readFileSync(outputFile, {encoding: 'utf-8'});
        if (id != null) {
            process.kill(+id);
        }
    } else {
        console.error(`no process id file could be found at: ${outputFile}`);
    }
}

const main = () => {
    const options: CommandLineOptions = cla(availableOptions, {
        partial: true
    });

    if (options._unknown?.length) {
        console.error(`unknown command(s): ${options._unknown.join(' ')}`);
        console.log(availableOptions);
    } else {
        if (options.start) {
            if (options.background) {
                startBackground();
            } else {
                startForeground();
            }
        }
        if (options.end) {
            endBackground();
        }
    }
}

main();