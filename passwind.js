'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var postcss = require('postcss');
var postcssJs = require('postcss-js');
var ramda = require('ramda');
var fluture = require('fluture');
var posthtmlParser = require('posthtml-parser');
var torpor = require('torpor');

var PLACEHOLDER = "🍛";
var $ = PLACEHOLDER;
var bindInternal3 = function bindInternal3 (func, thisContext) {
  return function (a, b, c) {
    return func.call(thisContext, a, b, c);
  };
};
var some$1 = function fastSome (subject, fn, thisContext) {
  var length = subject.length,
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      i;
  for (i = 0; i < length; i++) {
    if (iterator(subject[i], i, subject)) {
      return true;
    }
  }
  return false;
};

var curry = function (fn) {
  var test = function (x) { return x === PLACEHOLDER; };
  return function curried() {
    var arguments$1 = arguments;
    var argLength = arguments.length;
    var args = new Array(argLength);
    for (var i = 0; i < argLength; ++i) {
      args[i] = arguments$1[i];
    }
    var countNonPlaceholders = function (toCount) {
      var count = toCount.length;
      while (!test(toCount[count])) {
        count--;
      }
      return count
    };
    var length = (
      some$1(args, test) ?
        countNonPlaceholders(args) :
        args.length
    );
    function saucy() {
      var arguments$1 = arguments;
      var arg2Length = arguments.length;
      var args2 = new Array(arg2Length);
      for (var j = 0; j < arg2Length; ++j) {
        args2[j] = arguments$1[j];
      }
      return curried.apply(this, args.map(
        function (y) { return (
          test(y) && args2[0] ?
            args2.shift() :
            y
        ); }
      ).concat(args2))
    }
    return (
      length >= fn.length ?
        fn.apply(this, args) :
        saucy
    )
  }
};

var innerpipe = function (args) { return function (x) {
  var first = args[0];
  var rest = args.slice(1);
  var current = first(x);
  for (var a = 0; a < rest.length; a++) {
    current = rest[a](current);
  }
  return current
}; };
function pipe() {
  var arguments$1 = arguments;
  var argLength = arguments.length;
  var args = new Array(argLength);
  for (var i = 0; i < argLength; ++i) {
    args[i] = arguments$1[i];
  }
  return innerpipe(args)
}

var prop = curry(function (property, o) { return o && property && o[property]; });
var _keys = Object.keys;
var keys = _keys;

var propLength = prop("length");
pipe(keys, propLength);

var delegatee = curry(function (method, arg, x) { return (x[method](arg)); });

delegatee("filter");

function curryObjectN(arity, fn) {
  return function λcurryObjectN(args) {
    var joined = function (z) { return λcurryObjectN(Object.assign({}, args, z)); };
    return (
      args && Object.keys(args).length >= arity ?
        fn(args) :
        joined
    )
  }
}

var callWithScopeWhen = curry(function (effect, when, what, value) {
  var scope = what(value);
  if (when(scope)) effect(scope);
  return value;
});
var callBinaryWithScopeWhen = curry(function (effect, when, what, tag, value) {
  var scope = what(value);
  if (when(tag, scope)) effect(tag, scope);
  return value;
});

var always = function always() {
  return true;
};
var I = function I(x) {
  return x;
};

callWithScopeWhen($, $, I);
callWithScopeWhen($, always, I);
callWithScopeWhen($, always);
callBinaryWithScopeWhen($, $, I);
callBinaryWithScopeWhen($, always);
callBinaryWithScopeWhen($, always, I);

var traceWithScopeWhen = callBinaryWithScopeWhen(console.log);
var traceWithScope = traceWithScopeWhen(always);
var inspect = traceWithScope;
inspect(I);
callBinaryWithScopeWhen(console.log, $, I);

var segment = curryObjectN(3, function (_ref) {
  var _ref$what = _ref.what,
      what = _ref$what === void 0 ? I : _ref$what,
      _ref$when = _ref.when,
      when = _ref$when === void 0 ? always : _ref$when,
      tag = _ref.tag,
      value = _ref.value,
      effect = _ref.effect;
  if (when(tag, what(value))) {
    effect(tag, what(value));
  }
  return value;
});
segment({
  effect: console.log
});

const uniq = ramda.uniqBy(ramda.identity);

// const u = new Unusual(pkg.version)

const trim = x => x.trim();

const fashion = ramda.pipe(
  ramda.pathOr('', ['attrs', 'class']),
  ramda.ifElse(
    ramda.equals(''),
    ramda.always(false),
    ramda.pipe(
      ramda.split(' '),
      ramda.map(ramda.pipe(trim, ramda.replace(/\n/g, ''))),
      ramda.filter(z => !!z)
    )
  )
);

const hasKids = ramda.pipe(ramda.length, ramda.lt(0));

const walk = ramda.curry((steps, node) => {
  const pulled = fashion(node);
  const aggregated = pulled ? steps.concat(pulled) : steps;
  console.log({ pulled, aggregated });
  if (hasKids(node.content)) {
    return ramda.pipe(ramda.chain(walk(aggregated)), uniq)(node.content)
  }
  return aggregated
});

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
  html: function parseHTML(raw) {
    return new fluture.Future(function parseHTMLAsync(bad, good) {
      try {
        const steps = [];
        const parsed = posthtmlParser.parser(raw, { lowerCaseTags: true });
        ramda.pipe(ramda.head, walk(steps), x => x.sort(), good)(parsed);
      } catch (e) {
        bad(e);
      }
      return () => {}
    })
  }
};

const readAndParseWith = fn =>
  ramda.pipe(torpor.readFile(ramda.__, 'utf8'), ramda.chain(fn));

const reader = ramda.map(readAndParseWith)(parser);

exports.parser = parser;
exports.readAndParseWith = readAndParseWith;
exports.reader = reader;
