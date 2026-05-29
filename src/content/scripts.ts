/**
 * Content script entrypoint — YT AutoLike
 *
 * Extension.js calls the default export on injection and calls the returned
 * cleanup function on HMR teardown. The engine is imported dynamically so
 * it is code-split and only loaded on YouTube pages.
 */

import {startEngine} from './engine'

export default function initial() {
  startEngine()

  // Return a cleanup function (called by Extension.js on HMR/teardown).
  return () => {
    // Engine cleans up its own intervals on navigation.
    // Nothing extra to do here for production builds.
  }
}
