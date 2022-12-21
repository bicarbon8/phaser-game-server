#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as cp from 'child_process';
import { GameServer, GameServerConfig } from "./game-server";
import { CommandLineOptions, OptionDefinition } from 'command-line-args';

const cla = require('command-line-args');

const availableOptions: Array<OptionDefinition> = [
    {name: 'start', alias: 's', type: Boolean, defaultValue: false},
    {name: 'end', alias: 'e', type: Boolean, defaultValue: false},
    {name: 'background', alias: 'b', type: Boolean, defaultValue: false},
    {name: 'configuration', alias: 'c', type: String, defaultValue: 'server.config.json'},
    {name: 'help', alias: 'h', type: Boolean, defaultValue: false}
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

const startForeground = (file: string) => {
    try {
        let config: GameServerConfig;
        if (!path.isAbsolute(file)) {
            file = path.join(process.cwd(), file);
        }
        if (fs.existsSync(file)) {
            console.info(`using configuration at: ${file}`);
            const configStr = fs.readFileSync(file, {encoding: 'utf-8'});
            if (configStr) {
                config = JSON.parse(configStr);
            }
        } else {
            throw `no configuration file found at: ${file}`;
        }
        
        const server = new GameServer(config);
        server.startGameEngine();
    } catch (e) {
        console.error(e.message ?? e);
        process.exit(1);
    }
}

const endBackground = () => {
    if (fs.existsSync(outputFile)) {
        const id = fs.readFileSync(outputFile, {encoding: 'utf-8'});
        if (id != null) {
            try {
                process.kill(+id, 'SIGINT');
            } catch (e) {
                console.error(`unable to kill process with id: ${id}.`, e.message ?? e);
            }
        }
    } else {
        console.error(`no process id file could be found at: ${outputFile}`);
    }
}

const showHelp = () => {
    console.log(`Usage:\n${availableOptions.map(o => `\t-${o.alias}, --${o.name}`).join('\n')}`);
}

const main = () => {
    const options: CommandLineOptions = cla(availableOptions, {
        partial: true
    });

    if (options.help || (!options.start && !options.end)) {
        showHelp();
        process.exit(0);
    }

    if (options._unknown?.length) {
        console.error(`unknown command(s): ${options._unknown.join(' ')}`);
        showHelp();
        process.exit(1);
    } else {
        if (options.start) {
            if (options.background) {
                startBackground();
            } else {
                startForeground(options.configuration);
            }
        }
        if (options.end) {
            endBackground();
        }
    }
}

main();