import {
  ifElse,
  always,
  __ as $,
  of,
  any,
  both,
  chain,
  concat,
  complement,
  mergeRight,
  curry,
  equals,
  filter,
  head,
  identity as I,
  includes,
  indexOf,
  keys,
  length,
  lt,
  map,
  nth,
  objOf,
  pipe,
  replace,
  slice,
  split,
  startsWith,
  toPairs,
  trim,
  when,
} from 'ramda'
import {
  COMMA_NEWLINE,
  COLON,
  ESCAPED_COLON,
  AT,
  MEDIA,
  DOT_HOVER,
} from './constants'

export const classify = z => `.${z}`
export const classifyAll = map(classify)

export const anyMatch = curry(function _anyMatch(a, b) {
  return any(includes($, a))(b)
})

export const cleanSplit = pipe(
  split(' '),
  map(pipe(replace(COMMA_NEWLINE, ''), trim)),
)

export const cleanSelector = pipe(split(COMMA_NEWLINE), filter(I))

export const hasColon = pipe(indexOf(COLON), lt(0))
export const getScopedClass = when(
  hasColon,
  pipe(indexOf(COLON), slice($, Infinity)),
)

export const isEmptyObject = pipe(keys, length, equals(0))
export const isNotEmptyObject = complement(isEmptyObject)

export const isAtRule = startsWith(AT)
export const isMediaRule = includes(MEDIA)
export const isAtMediaRule = both(isAtRule, isMediaRule)
export const getAtRules = filter(pipe(head, isAtRule))
export const fixColons = replace(ESCAPED_COLON, COLON)
export const fixColonPairs = map(([k, v]) => [fixColons(k), v])
export const getResponsiveSelectors = pipe(
  filter(pipe(head, isAtMediaRule)),
  chain(pipe(nth(1), toPairs, fixColonPairs)),
)
export const getHoverSelectors = pipe(
  filter(pipe(head, startsWith(DOT_HOVER))),
  fixColonPairs,
  map(([k, v]) => [k.slice(0, -6), v]),
)

export const matchingSelectors = curry(function _matchingSelectors(
  dotClasses,
  cssPairs,
) {
  return filter(pipe(head, cleanSplit, anyMatch(dotClasses)))(
    cssPairs,
  )
})

export const conditionalMergeAs = curry((key, list, a, b) =>
  ifElse(
    isNotEmptyObject,
    pipe(objOf(key), mergeRight(a), of, concat(list)),
    always(list),
  )(b),
)
