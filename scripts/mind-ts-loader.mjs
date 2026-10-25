// Maps '@/x' imports to ./src/x(.ts) and appends .ts to extensionless relative
// imports — mirrors tsconfig/bundler resolution for plain node.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const TS_EXTS = ['.ts', '.tsx'];

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const rel = specifier.slice(2);
    const withExt = /\.[a-z]+$/.test(rel) ? rel : rel + '.ts';
    return next(pathToFileURL(path.join(ROOT, 'src', withExt)).href, context);
  }
  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !/\.[a-z]+$/.test(specifier) &&
    context.parentURL
  ) {
    for (const ext of TS_EXTS) {
      try {
        return await next(specifier + ext, context);
      } catch {
        /* try next ext */
      }
    }
  }
  return next(specifier, context);
}
