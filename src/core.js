import { ap, resolve } from 'fluture'
import {
  ap as functionAp,
  apply,
  concat,
  curry,
  filter,
  fromPairs,
  identity as I,
  join,
  map,
  mergeRight,
  objOf,
  of,
  omit,
  pipe,
  prop,
  propOr,
  reduce,
  toPairs,
  uniqBy,
  values,
} from 'ramda'
import { css, html } from './reader'
import {
  matchingSelectors,
  classifyAll,
  conditionalMergeAs,
  getResponsiveSelectors,
  getHoverSelectors,
} from './utils'
import { DEFINITION, DEFINITIONS, SELECTOR } from './constants'

const getAllClasses = pipe(
  map(prop(SELECTOR)),
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

const cleanKey = propertyName =>
  propertyName.replace(
    /[A-Z]/g,
    (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase(),
  )

const fixKeys = pipe(
  toPairs,
  map(([k, v]) => [cleanKey(k), v]),
  fromPairs,
)

const mergeDefinitions = raw =>
  pipe(
    propOr([], DEFINITIONS),
    values,
    reduce((agg, x) => mergeRight(agg, fixKeys(x)), {}),
    objOf(DEFINITION),
    mergeRight(raw),
  )(raw)
const print = pipe(
  toPairs,
  map(pipe(join(': '), z => `  ${z};`)),
  join('\n'),
)

const stringifyDefinition = ({
  id,
  selector,
  definition,
}) => `.${id} {
  /* tailwind selectors: ${selector.join(' ')} */
${print(definition)}
}`
const stringifyDefinitions = pipe(
  map(stringifyDefinition),
  join('\n'),
)

const consumer = curry(function _consumer(
  options,
  parsedCSS,
  htmlClasses,
) {
  const cut = cutClasses(parsedCSS, htmlClasses)
  return pipe(
    reduce(
      (agg, def) =>
        pipe(
          propOr([], SELECTOR),
          classifyAll,
          grabDefinition(cut),
          conditionalMergeAs(DEFINITIONS, agg, def),
        )(def),
      [],
    ),
    map(mergeDefinitions),
    options.drop ? map(omit([DEFINITIONS, SELECTOR])) : I,
    options.flatten ? stringifyDefinitions : I,
  )(htmlClasses)
})

export const passwind = curry(function _passwind(
  options,
  cssFile,
  htmlFile,
) {
  return pipe(
    ap(css(cssFile)),
    ap(html(htmlFile)),
  )(resolve(consumer(options)))
})
