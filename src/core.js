import { ap, resolve } from 'fluture'
import {
  uniqBy,
  of,
  ap as functionAp,
  propOr,
  apply,
  concat,
  curry,
  filter,
  fromPairs,
  identity as I,
  map,
  pipe,
  prop,
  reduce,
  toPairs,
} from 'ramda'
import { css, html } from './reader'
import {
  matchingSelectors,
  classifyAll,
  conditionalMergeAs,
  getResponsiveSelectors,
  getHoverSelectors,
} from './utils'

const getAllClasses = pipe(
  map(prop('selector')),
  reduce(concat, []),
  classifyAll,
  uniqBy(I),
)

const cutClasses = curry(function _cutDownClasses(
  parsedCSS,
  htmlClasses,
) {
  const dotClasses = getAllClasses(htmlClasses)
  return pipe(
    toPairs,
    pairs =>
      pipe(
        of,
        functionAp([getResponsiveSelectors, getHoverSelectors]),
        apply(concat),
        concat(pairs),
        matchingSelectors(dotClasses),
      )(pairs),
    fromPairs,
  )(parsedCSS)
})

const looseClassMatch = curry(function _looseClassMatch(defs, cls) {
  const lookup = defs[cls]
  return lookup ? [cls, lookup] : false
})

const grabDefinition = curry(function _grabDefinition(defs, lookup) {
  return pipe(
    map(looseClassMatch(defs)),
    filter(I),
    fromPairs,
  )(lookup)
})

const consumer = curry(function _consumer(parsedCSS, htmlClasses) {
  const cut = cutClasses(parsedCSS, htmlClasses)
  return reduce(
    (agg, def) =>
      pipe(
        propOr([], 'selector'),
        classifyAll,
        grabDefinition(cut),
        conditionalMergeAs('definitions', agg, def),
      )(def),
    [],
    htmlClasses,
  )
})

export const passwind = curry(function _passwind(cssFile, htmlFile) {
  return pipe(ap(css(cssFile)), ap(html(htmlFile)))(resolve(consumer))
})
