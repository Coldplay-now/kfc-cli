import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class Clipboard {
  static async copy(text: string): Promise<boolean> {
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        // macOS
        await execAsync(`echo "${text}" | pbcopy`);
        return true;
      } else if (platform === 'linux') {
        // Linux (需要 xclip 或 xsel)
        try {
          await execAsync(`echo "${text}" | xclip -selection clipboard`);
          return true;
        } catch {
          try {
            await execAsync(`echo "${text}" | xsel --clipboard --input`);
            return true;
          } catch {
            return false;
          }
        }
      } else if (platform === 'win32') {
        // Windows
        await execAsync(`echo ${text} | clip`);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async paste(): Promise<string | null> {
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        const { stdout } = await execAsync('pbpaste');
        return stdout.trim();
      } else if (platform === 'linux') {
        try {
          const { stdout } = await execAsync('xclip -selection clipboard -o');
          return stdout.trim();
        } catch {
          try {
            const { stdout } = await execAsync('xsel --clipboard --output');
            return stdout.trim();
          } catch {
            return null;
          }
        }
      } else if (platform === 'win32') {
        // Windows clipboard reading is more complex, skip for now
        return null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

