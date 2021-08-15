import { uniqBy, identity, pipe, pathOr, ifElse, equals, always, split, map, trim, replace, filter, length, lt, curry, chain, head, __, toPairs, fromPairs } from 'ramda';
import { readFile } from 'torpor';
import { parse } from 'postcss';
import { objectify } from 'postcss-js';
import { Future, ap, resolve } from 'fluture';
import { parser as parser$1 } from 'posthtml-parser';

const uniq = uniqBy(identity);
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
);

const hasKids = pipe(length, lt(0));

const walk = curry(function _walk(steps, node) {
  const pulled = fashion(node);
  const aggregated = pulled ? steps.concat(pulled) : steps;
  if (hasKids(node.content)) {
    return pipe(chain(walk(aggregated)), uniq)(node.content)
  }
  return aggregated
});

function cancel() {}
const cssWithCancel = curry(function _cssWithCancel(
  canceller,
  raw
) {
  return new Future(function parseCSS(bad, good) {
    try {
      pipe(parse, objectify, good)(raw);
    } catch (e) {
      bad(e);
    }
    return canceller
  })
});

const htmlWithCancel = curry(function _htmlWithCancel(
  canceller,
  raw
) {
  return new Future(function parseHTMLAsync(bad, good) {
    try {
      const steps = [];
      const parsed = parser$1(raw, { lowerCaseTags: true });
      pipe(head, walk(steps), x => x.sort(), good)(parsed);
    } catch (e) {
      bad(e);
    }
    return () => {}
  })
});

const css$1 = cssWithCancel(cancel);
const html$1 = htmlWithCancel(cancel);

const readAndParseWith = fn =>
  pipe(readFile(__, 'utf8'), chain(fn));

const css = readAndParseWith(css$1);
const html = readAndParseWith(html$1);

const consumer = curry((parsedCSS, htmlClasses) => {
  const dotClasses = htmlClasses.map(z => `.${z}`);
  return pipe(
    toPairs,
    filter(([k]) => {
      return dotClasses.includes(k)
    }),
    fromPairs
  )(parsedCSS)
});

function passwind(htmlFile, cssFile) {
  const futureCSS = css(cssFile);
  const futureHTML = html(htmlFile);
  return pipe(ap(futureCSS), ap(futureHTML))(resolve(consumer))
}

const reader = {
  readAndParseWith,
  css: css,
  html: html
};

const parser = {
  walk,
  cssWithCancel,
  css: css$1,
  htmlWithCancel,
  html: html$1
};

export { parser, passwind, reader };
