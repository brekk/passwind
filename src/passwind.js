import postcss, { parse as cssParse } from 'postcss'
import htmlSyntax from 'postcss-html'
import safeCSSParse from 'postcss-safe-parser'
import { objectify } from 'postcss-js'
import { prop, pipe } from 'ramda'
import { Future } from 'fluture'

const html = htmlSyntax({ css: safeCSSParse })

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
  html: raw =>
    new Future(function parseHTML(bad, good) {
      postcss()
        .process(raw, { syntax: html })
        .catch(bad)
        .then(pipe(prop('css'), good))
      return () => {}
    })
}
