import { parse } from 'postcss';
import { objectify } from 'postcss-js';
import { uniqBy, identity, pipe as pipe$1, pathOr, ifElse, equals, always as always$1, split, map, replace, filter, length, lt, curry as curry$1, chain, head, __ } from 'ramda';
import { Future } from 'fluture';
import { parser as parser$1 } from 'posthtml-parser';
import { readFile } from 'torpor';

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

const uniq = uniqBy(identity);

// const u = new Unusual(pkg.version)

const trim = x => x.trim();

const fashion = pipe$1(
  pathOr('', ['attrs', 'class']),
  ifElse(
    equals(''),
    always$1(false),
    pipe$1(
      split(' '),
      map(pipe$1(trim, replace(/\n/g, ''))),
      filter(z => !!z)
    )
  )
);

const hasKids = pipe$1(length, lt(0));

const walk = curry$1((steps, node) => {
  const pulled = fashion(node);
  const aggregated = pulled ? steps.concat(pulled) : steps;
  console.log({ pulled, aggregated });
  if (hasKids(node.content)) {
    return pipe$1(chain(walk(aggregated)), uniq)(node.content)
  }
  return aggregated
});

const parser = {
  css: raw =>
    new Future(function parseCSS(bad, good) {
      try {
        pipe$1(parse, objectify, good)(raw);
      } catch (e) {
        bad(e);
      }
      return () => {}
    }),
  html: function parseHTML(raw) {
    return new Future(function parseHTMLAsync(bad, good) {
      try {
        const steps = [];
        const parsed = parser$1(raw, { lowerCaseTags: true });
        pipe$1(head, walk(steps), x => x.sort(), good)(parsed);
      } catch (e) {
        bad(e);
      }
      return () => {}
    })
  }
};

const readAndParseWith = fn =>
  pipe$1(readFile(__, 'utf8'), chain(fn));

const reader = map(readAndParseWith)(parser);

export { parser, readAndParseWith, reader };
