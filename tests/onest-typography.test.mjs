import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const theme = await readFile(new URL('../css/approved-visual-theme.css', import.meta.url), 'utf8');

assert.match(index, /family=Onest:wght@400;500;600/);
assert.doesNotMatch(index, /family=Golos\+Text|family=Literata/);
assert.match(theme, /--font-sans:\s*"Onest", sans-serif/);
assert.match(theme, /--font-display:\s*"Onest", sans-serif/);
assert.match(theme, /h1 \{[^}]*font-weight: 500/);
assert.match(theme, /h2, \.section__title \{[^}]*font-weight: 500/);
assert.doesNotMatch(theme, /font-weight: 700/);

console.log('Onest is the only configured site typeface with restrained heading weights.');
