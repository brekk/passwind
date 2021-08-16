import {
  __ as $,
  any,
  curry,
  includes,
  map,
  pipe,
  replace,
  split,
  trim
} from 'ramda'

export const classify = z => `.${z}`
export const classifyAll = map(classify)

export const anyMatch = curry(function _anyMatch(a, b) {
  return any(includes($, a))(b)
})

export const cleanSplit = pipe(
  split(' '),
  map(pipe(replace(/\n/g, ''), trim))
)
