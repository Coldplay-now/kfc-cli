import inquirer from 'inquirer';
import { Logger } from './logger';

export interface Choice {
  name: string;
  value: string;
  description?: string;
}

export class Prompt {
  static async input(message: string, defaultValue?: string): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        default: defaultValue,
      },
    ]);
    return value;
  }

  static async password(message: string): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message,
        mask: '*',
      },
    ]);
    return value;
  }

  static async confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
    const { value } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'value',
        message,
        default: defaultValue,
      },
    ]);
    return value;
  }

  static async select(message: string, choices: Choice[]): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message,
        choices: choices.map((c) => ({
          name: c.description ? `${c.name} - ${c.description}` : c.name,
          value: c.value,
        })),
      },
    ]);
    return value;
  }

  static async checkbox(message: string, choices: Choice[]): Promise<string[]> {
    const { value } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'value',
        message,
        choices: choices.map((c) => ({
          name: c.description ? `${c.name} - ${c.description}` : c.name,
          value: c.value,
        })),
      },
    ]);
    return value;
  }

  static async waitForEnter(message: string = '按 Enter 继续...'): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message,
      },
    ]);
  }
}

