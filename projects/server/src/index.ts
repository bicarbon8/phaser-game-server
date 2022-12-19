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
const outputFile = path.join(process.cwd(), '.phaser-game-server');

const startBackground = () => {
    const argv = process.argv;
    const command = argv.shift(); // node process
    const args = argv
        .filter(a => !a.includes('-b')); // remove background argument
    const out = fs.openSync(outputFile + '.out.log', 'a');
    const err = fs.openSync(outputFile + '.err.log', 'a');
    console.info(`starting background process: ${command} ${args.join(' ')}`);
    const child: cp.ChildProcess = cp.spawn(command, args, {
        detached: true,
        stdio: ['ignore', out, err]
    });
    if (child.pid) {
        fs.writeFileSync(outputFile, `${child.pid}`, {encoding: 'utf-8'});
    } else {
        console.error(`unable to start background process using '${command} ${args.join(' ')}'`);
    }
    child.unref();
}

const startForeground = () => {
    const server = new GameServer();
    server.startGameEngine();
}

const endBackground = () => {
    if (fs.existsSync(outputFile)) {
        const id = fs.readFileSync(outputFile, {encoding: 'utf-8'});
        if (id != null) {
            process.kill(+id, 'SIGINT');
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