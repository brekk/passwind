import postcss, { parse } from 'postcss';
import htmlSyntax from 'postcss-html';
import safeCSSParse from 'postcss-safe-parser';
import { objectify } from 'postcss-js';
import { pipe, prop, map, __, chain } from 'ramda';
import { Future } from 'fluture';
import { readFile } from 'torpor';

const html = htmlSyntax({ css: safeCSSParse });

const parser = {
  css: raw =>
    new Future(function parseCSS(bad, good) {
      try {
        pipe(parse, objectify, good)(raw);
      } catch (e) {
        bad(e);
      }
      return () => {}
    }),
  html: raw =>
    new Future(function parseHTML(bad, good) {
      postcss()
        .process(raw, { syntax: html })
        .catch(bad)
        .then(pipe(prop('css'), good));
      return () => {}
    })
};

const readAndParseWith = fn =>
  pipe(readFile(__, 'utf8'), chain(fn));

const reader = map(readAndParseWith)(parser);

export { parser, readAndParseWith, reader };
