import { parse as cssParse } from 'postcss'
import { objectify } from 'postcss-js'
import {
  uniqBy,
  identity as I,
  map,
  filter,
  head,
  concat,
  reduce,
  chain,
  curry,
  pathOr,
  length,
  lt,
  ifElse,
  equals,
  always,
  split,
  pipe,
  replace
} from 'ramda'
import { Future } from 'fluture'
import { parser as htmlParse } from 'posthtml-parser'
// import Unusual from 'unusual'
import { trace } from 'xtrace'
import pkg from '../package.json'

const uniq = uniqBy(I)

// const u = new Unusual(pkg.version)

const trim = x => x.trim()

const fashion = pipe(
  pathOr('', ['attrs', 'class']),
  ifElse(
    equals(''),
    always(false),
    pipe(
      split(' '),
      map(pipe(trim, replace(/\n/g, ''))),
      filter(z => !!z)
    )
  )
)

const hasKids = pipe(length, lt(0))

const walk = curry((steps, node) => {
  const pulled = fashion(node)
  const aggregated = pulled ? steps.concat(pulled) : steps
  if (hasKids(node.content)) {
    return pipe(chain(walk(aggregated)), uniq)(node.content)
  }
  return aggregated
})

export const parser = {
  css: raw =>
    new Future(function parseCSS(bad, good) {
      try {
        pipe(cssParse, objectify, good)(raw)
      } catch (e) {
        bad(e)
      }
      return () => {}
    }),
  html: function parseHTML(raw) {
    return new Future(function parseHTMLAsync(bad, good) {
      try {
        const steps = []
        const parsed = htmlParse(raw, { lowerCaseTags: true })
        pipe(head, walk(steps), x => x.sort(), good)(parsed)
      } catch (e) {
        bad(e)
      }
      return () => {}
    })
  }
}
