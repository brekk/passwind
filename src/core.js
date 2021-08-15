import { ap, resolve } from 'fluture'
import { pipe, curry, filter, toPairs, fromPairs } from 'ramda'
import { css, html } from './reader'

const consumer = curry((parsedCSS, htmlClasses) => {
  const dotClasses = htmlClasses.map(z => `.${z}`)
  return pipe(
    toPairs,
    filter(([k]) => {
      return dotClasses.includes(k)
    }),
    fromPairs
  )(parsedCSS)
})

export function passwind(htmlFile, cssFile) {
  const futureCSS = css(cssFile)
  const futureHTML = html(htmlFile)
  return pipe(ap(futureCSS), ap(futureHTML))(resolve(consumer))
}
