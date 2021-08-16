import { ap, resolve } from 'fluture'
import {
  pipe,
  curry,
  filter,
  toPairs,
  fromPairs,
  reduce,
  concat,
  prop,
  map
} from 'ramda'
import { trace } from 'xtrace'
import { css, html } from './reader'
import { anyMatch, classifyAll, cleanSplit } from './utils'

const getAllClasses = pipe(
  map(prop('selector')),
  reduce(concat, []),
  classifyAll
)

const cutClasses = curry(function _cutDownClasses(
  parsedCSS,
  htmlClasses
) {
  const dotClasses = getAllClasses(htmlClasses)
  return pipe(
    toPairs,
    filter(([k]) => anyMatch(dotClasses, cleanSplit(k))),
    fromPairs
  )(parsedCSS)
})

const grabDefinition = curry(function _grabDefinition(defs, lookup) {
  return pipe(map(cls => defs[cls]))(lookup)
})

const consumer = curry((parsedCSS, htmlClasses) => {
  const filtered = cutClasses(parsedCSS, htmlClasses)
  console.log({ filtered })
  pipe(
    reduce((agg, def) => {
      const grabbed = grabDefinition(
        filtered,
        classifyAll(def.selector)
      )
      console.log({ def, grabbed })
      return agg.concat(grabbed)
    }, [])
  )(htmlClasses)
  return filtered
})

export const passwind = curry(function _passwind(cssFile, htmlFile) {
  return pipe(ap(css(cssFile)), ap(html(htmlFile)))(resolve(consumer))
})
