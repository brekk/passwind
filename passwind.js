'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var ramda = require('ramda')
var torpor = require('torpor')
var postcss = require('postcss')
var postcssJs = require('postcss-js')
var fluture = require('fluture')
var posthtmlParser = require('posthtml-parser')

const uniq = ramda.uniqBy(ramda.identity)
const fashion = ramda.pipe(
  ramda.pathOr('', ['attrs', 'class']),
  ramda.ifElse(
    ramda.equals(''),
    ramda.always(false),
    ramda.pipe(
      ramda.split(' '),
      ramda.map(ramda.pipe(ramda.trim, ramda.replace(/\n/g, ''))),
      ramda.filter(z => !!z)
    )
  )
)

const hasKids = ramda.pipe(ramda.length, ramda.lt(0))

const walk = ramda.curry(function _walk(steps, node) {
  const pulled = fashion(node)
  const aggregated = pulled ? steps.concat(pulled) : steps
  if (hasKids(node.content)) {
    return ramda.pipe(
      ramda.chain(walk(aggregated)),
      uniq
    )(node.content)
  }
  return aggregated
})

function cancel() {}
const cssWithCancel = ramda.curry(function _cssWithCancel(
  canceller,
  raw
) {
  return new fluture.Future(function parseCSS(bad, good) {
    try {
      ramda.pipe(postcss.parse, postcssJs.objectify, good)(raw)
    } catch (e) {
      bad(e)
    }
    return canceller
  })
})

const htmlWithCancel = ramda.curry(function _htmlWithCancel(
  canceller,
  raw
) {
  return new fluture.Future(function parseHTMLAsync(bad, good) {
    try {
      const steps = []
      const parsed = posthtmlParser.parser(raw, {
        lowerCaseTags: true
      })
      ramda.pipe(ramda.head, walk(steps), x => x.sort(), good)(parsed)
    } catch (e) {
      bad(e)
    }
    return () => {}
  })
})

const css$1 = cssWithCancel(cancel)
const html$1 = htmlWithCancel(cancel)

const readAndParseWith = fn =>
  ramda.pipe(torpor.readFile(ramda.__, 'utf8'), ramda.chain(fn))

const css = readAndParseWith(css$1)
const html = readAndParseWith(html$1)

const consumer = ramda.curry((parsedCSS, htmlClasses) => {
  const dotClasses = htmlClasses.map(z => `.${z}`)
  return ramda.pipe(
    ramda.toPairs,
    ramda.filter(([k]) => {
      return dotClasses.includes(k)
    }),
    ramda.fromPairs
  )(parsedCSS)
})

function passwind(htmlFile, cssFile) {
  const futureCSS = css(cssFile)
  const futureHTML = html(htmlFile)
  return ramda.pipe(
    fluture.ap(futureCSS),
    fluture.ap(futureHTML)
  )(fluture.resolve(consumer))
}

const reader = {
  readAndParseWith,
  css: css,
  html: html
}

const parser = {
  walk,
  cssWithCancel,
  css: css$1,
  htmlWithCancel,
  html: html$1
}

exports.parser = parser
exports.passwind = passwind
exports.reader = reader
