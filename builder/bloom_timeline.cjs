'use strict';
// The three original clips are eight seconds at 24 fps. Keep their native speed.
const fps=24,seconds=24,wrapSeconds=1;
const progress=t=>Math.max(0,Math.min(1,t/seconds));
module.exports={fps,seconds,wrapSeconds,progress};
