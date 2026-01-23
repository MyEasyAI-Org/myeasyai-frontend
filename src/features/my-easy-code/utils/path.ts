import pathBrowserify from 'path-browserify';

/**
 * Path utilities for browser environment
 */
export const path = {
  join: pathBrowserify.join,
  dirname: pathBrowserify.dirname,
  basename: pathBrowserify.basename,
  extname: pathBrowserify.extname,
  relative: pathBrowserify.relative,
  normalize: pathBrowserify.normalize,
  isAbsolute: pathBrowserify.isAbsolute,
  resolve: pathBrowserify.resolve,
  sep: pathBrowserify.sep,
};
