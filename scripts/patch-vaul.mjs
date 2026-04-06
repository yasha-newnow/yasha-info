import { readFileSync, writeFileSync } from 'fs';

const files = [
  'node_modules/vaul/dist/index.js',
  'node_modules/vaul/dist/index.mjs',
];

for (const file of files) {
  let content = readFileSync(file, 'utf8');

  // 1. BORDER_RADIUS 8 -> 40
  content = content.replace(
    'const BORDER_RADIUS = 8;',
    'const BORDER_RADIUS = 40;'
  );

  // 2. borderRadiusValue 8 -> 40 (drag interpolation)
  content = content.replace(
    /const borderRadiusValue = 8 - percentageDragged \* 8;/g,
    'const borderRadiusValue = 40 - percentageDragged * 40;'
  );

  // 3. Cleanup: animate wrapper back before delayed cssText reset
  content = content.replace(
    `return ()=>{
                wrapperStylesCleanup();
                timeoutIdRef.current = window.setTimeout(()=>{
                    if (initialBackgroundColor) {
                        document.body.style.background = initialBackgroundColor;
                    } else {
                        document.body.style.removeProperty('background');
                    }
                }, TRANSITIONS.DURATION * 1000);
            };`,
    `return ()=>{
                if (wrapper) {
                    set(wrapper, { borderRadius: '0px', overflow: 'visible', transform: 'none' }, true);
                }
                timeoutIdRef.current = window.setTimeout(()=>{
                    wrapperStylesCleanup();
                    if (initialBackgroundColor) {
                        document.body.style.background = initialBackgroundColor;
                    } else {
                        document.body.style.removeProperty('background');
                    }
                }, TRANSITIONS.DURATION * 1000);
            };`
  );

  writeFileSync(file, content, 'utf8');
  console.log(`Patched ${file}`);
}
