import { parse as cssParse } from 'postcss'
import { objectify } from 'postcss-js'
import {
  always,
  chain,
  curry,
  equals,
  filter,
  head,
  identity as I,
  ifElse,
  length,
  lt,
  map,
  pathOr,
  pipe,
  replace,
  split,
  trim,
  uniqBy
} from 'ramda'
import { Future } from 'fluture'
import { parser as htmlParse } from 'posthtml-parser'

const uniq = uniqBy(I)
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

export const walk = curry(function _walk(steps, node) {
  const pulled = fashion(node)
  const aggregated = pulled ? steps.concat(pulled) : steps
  if (hasKids(node.content)) {
    return pipe(chain(walk(aggregated)), uniq)(node.content)
  }
  return aggregated
})

export function cancel() {}
export const cssWithCancel = curry(function _cssWithCancel(
  canceller,
  raw
) {
  return new Future(function parseCSS(bad, good) {
    try {
      pipe(cssParse, objectify, good)(raw)
    } catch (e) {
      bad(e)
    }
    return canceller
  })
})

export const htmlWithCancel = curry(function _htmlWithCancel(
  canceller,
  raw
) {
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
})

export const css = cssWithCancel(cancel)
export const html = htmlWithCancel(cancel)
