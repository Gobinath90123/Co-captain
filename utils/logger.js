const chalk = require('chalk');

export class Logger {
    static info(message) {
        console.log(chalk.blue(`[INFO]: ${message}`));
    }

    static pass(message) {
        console.log(chalk.green(`[PASS]: ${message}`));
    }

    static warn(message) {
        console.warn(chalk.yellow(`[WARN]: ${message}`));
    }

    static skipped(message) {
        console.warn(chalk.yellow(`[SKIPPED]: ${message}`));
    }

    static error(message) {
        console.error(chalk.red(`[ERROR]: ${message}`));
    }
}
