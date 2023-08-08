/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import process from 'node:process'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

// clear console
process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')

// get script
const script = process.argv.filter((i, index) => index !== 0 && index !== 1 && !i.startsWith('-'))

;(async () => {
  // if empty script show usage
  if (script.length === 0) {
    console.log('Usage: jalankan script1 script2 script3\n\nOptions:\n-p  run in parallel')
  }
  else {
    // executor
    async function exec(task: any) {
      await new Promise((resolve) => {
        const [command, ...args] = task.split(' ')
        const child = spawn(command, args, { shell: true, stdio: 'inherit' })
        child.on('close', code => code === 0 && resolve(true))
      })
    }
    const tasks = Object.values(Object.fromEntries(
      Object.entries(require(join(process.cwd(), 'package.json')).scripts).filter(([key]) => script.some((req) => {
        const regex = new RegExp(`^${req.replace('*', '.*')}$`)
        return regex.test(key)
      }))),
    )
    if (process.argv.includes('-p')) {
      await Promise.all(tasks.map(exec))
    }
    else {
      for (const task of tasks) {
        await exec(task)
      }
    }
  }
})()
