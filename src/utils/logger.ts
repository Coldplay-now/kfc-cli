import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  static debug(message: string): void {
    if (process.env.KFC_DEBUG === 'true') {
      console.log(chalk.gray('DEBUG:'), message);
    }
  }

  static step(message: string): void {
    console.log(chalk.cyan('→'), message);
  }

  static title(message: string): void {
    console.log('\n' + chalk.bold.cyan(message));
    console.log(chalk.gray('━'.repeat(message.length)));
  }

  static section(message: string): void {
    console.log('\n' + chalk.bold(message));
  }
}

