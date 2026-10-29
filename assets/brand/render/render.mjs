// Rasterize brand SVG/HTML to PNG with headless Chrome. Usage: node render.mjs <in> <out.png> <w> <h>
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [input, output, w, h] = process.argv.slice(2);
execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--default-background-color=00000000', `--window-size=${w},${h}`, `--screenshot=${resolve(output)}`,
  'file://' + resolve(input)], { stdio: 'ignore' });
console.log(output);
