'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var postcss = require('postcss');
var htmlSyntax = require('postcss-html');
var safeCSSParse = require('postcss-safe-parser');
var postcssJs = require('postcss-js');
var ramda = require('ramda');
var fluture = require('fluture');
var torpor = require('torpor');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var htmlSyntax__default = /*#__PURE__*/_interopDefaultLegacy(htmlSyntax);
var safeCSSParse__default = /*#__PURE__*/_interopDefaultLegacy(safeCSSParse);

const html = htmlSyntax__default['default']({ css: safeCSSParse__default['default'] });

const parser = {
  css: raw =>
    new fluture.Future(function parseCSS(bad, good) {
      try {
        ramda.pipe(postcss.parse, postcssJs.objectify, good)(raw);
      } catch (e) {
        bad(e);
      }
      return () => {}
    }),
  html: raw =>
    new fluture.Future(function parseHTML(bad, good) {
      postcss__default['default']()
        .process(raw, { syntax: html })
        .catch(bad)
        .then(ramda.pipe(ramda.prop('css'), good));
      return () => {}
    })
};

const readAndParseWith = fn =>
  ramda.pipe(torpor.readFile(ramda.__, 'utf8'), ramda.chain(fn));

const reader = ramda.map(readAndParseWith)(parser);

exports.parser = parser;
exports.readAndParseWith = readAndParseWith;
exports.reader = reader;
