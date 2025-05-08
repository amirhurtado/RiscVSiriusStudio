import chalk from 'chalk';
import figlet from 'figlet';

export function showBanner(): void {
  console.log(chalk.cyan(figlet.textSync('RISC-V CLI', { horizontalLayout: 'default' })));
}

export function error(msg: string): void {
  console.error(chalk.red(`[ERROR] ${msg}`));
}

export function info(msg: string): void {
  console.log(chalk.green(`[INFO] ${msg}`));
}

export function warn(msg: string): void {
  console.log(chalk.yellow(`[WARN] ${msg}`));
}
