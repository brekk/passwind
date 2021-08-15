import { __ as $, pipe, chain } from 'ramda'
import { readFile } from 'torpor'
import { css as parseCSS, html as parseHTML } from './parser'

export const readAndParseWith = fn =>
  pipe(readFile($, 'utf8'), chain(fn))

export const css = readAndParseWith(parseCSS)
export const html = readAndParseWith(parseHTML)
