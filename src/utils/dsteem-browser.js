// Force-import the browser-compatible build of dsteem

import 'regenerator-runtime/runtime'; // polyfill async/await
import * as dsteem from 'dsteem/lib/index-browser';

export default dsteem;

