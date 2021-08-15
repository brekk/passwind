import { map, __ as $, pipe, chain } from 'ramda'
import { readFile } from 'torpor'
import { parser } from './core'

export const readAndParseWith = fn =>
  pipe(readFile($, 'utf8'), chain(fn))

export const reader = map(readAndParseWith)(parser)
