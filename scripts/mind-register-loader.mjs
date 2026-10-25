// Registers the @/ alias loader for TS content imports outside Next.
import { register } from 'node:module';
register('./mind-ts-loader.mjs', import.meta.url);
