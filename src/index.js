import {
  readAndParseWith,
  css as readCSS,
  html as readHTML
} from './reader'
import {
  walk,
  cssWithCancel,
  htmlWithCancel,
  css,
  html
} from './parser'

export * from './core'

export const reader = {
  readAndParseWith,
  css: readCSS,
  html: readHTML
}

export const parser = {
  walk,
  cssWithCancel,
  css,
  htmlWithCancel,
  html
}
