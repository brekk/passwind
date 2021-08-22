import { pipe as pipe$1, times, join, pathOr, memoizeWith, ifElse, equals, always, split, map, trim, replace, filter as filter$1, length as length$1, lt, curry as curry$1, chain, is, head, uniqBy, prop as prop$1, __, any, includes, identity, indexOf, when, slice, keys as keys$1, complement, startsWith, both, nth, toPairs, objOf, mergeRight, of, concat, reduce, ap, apply, fromPairs, propOr, omit, values } from 'ramda';
import { readFile } from 'torpor';
import { parse } from 'postcss';
import { objectify } from 'postcss-js';
import { Future, ap as ap$1, resolve } from 'fluture';
import { parser as parser$1 } from 'posthtml-parser';

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
var objectLength = pipe(keys, propLength);
var length = function (x) { return (typeof x === "object" ? objectLength(x) : propLength(x)); };

var delegatee = curry(function (method, arg, x) { return (x[method](arg)); });

var filter = delegatee("filter");

var flipIncludes = curry(function (list, x) { return list.includes(x); });

var matchingKeys = curry(
  function (list, o) { return filter(
    flipIncludes(list),
    keys(o)
  ); }
);

var matchingKeyCount = curry(
  function (list, o) { return pipe(
    matchingKeys(list),
    length
  )(o); }
);

var expectKArgs = function (expected, args) { return (
  matchingKeyCount(expected, args) >= Object.keys(expected).length
); };
var curryObjectK = curry(
  function (keys, fn) {
    return function λcurryObjectK(args) {
      var includes = function (y) { return keys.includes(y); };
      return (
        Object.keys(args).filter(includes).length === keys.length ?
          fn(args) :
          function (z) { return λcurryObjectK(Object.assign({}, args, z)); }
      )
    }
  }
);

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

function curryObjectKN(ref, fn) {
  var k = ref.k;
  var n = ref.n;
  return function λcurryObjectKN(args) {
    var joined = function (z) { return λcurryObjectKN(Object.assign({}, args, z)); };
    return (
      expectKArgs(k, args) || Object.keys(args).length >= n ?
        fn(args) :
        joined
    )
  }
}

function compose() {
  var arguments$1 = arguments;
  var argLength = arguments.length;
  var args = new Array(argLength);
  for (var i = argLength - 1; i > -1; --i) {
    args[i] = arguments$1[i];
  }
  return innerpipe(args)
}

var curryify = function (test) {
  if (typeof test !== "function") {
    throw new TypeError("Expected to be given a function to test placeholders!")
  }
  return function (fn) {
    if (typeof fn !== "function") {
      throw new TypeError("Expected to be given a function to curry!")
    }
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
      var length = some$1(args, test) ? countNonPlaceholders(args) : args.length;
      return (
        length >= fn.length ?
        fn.apply(this, args) :
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
      )
    }
  }
};

var version$1 = "0.7.7";

var K = function (x) { return function () { return x; }; };

var I = function (x) { return x; };

var remapParameters = function (indices, arr) {
  var copy = Array.from(arr);
  if (!copy.length) {
    return copy
  }
  return copy.map(
    function (x, index) {
      if (indices.includes(index)) {
        return copy[indices[index]]
      }
      return x
    }
  )
};
var remapArray = curry(remapParameters);
var remapFunction = function (indices, fn) {
  var remapArgs = remapArray(indices);
  var curried = curry(fn);
  return function remappedFn() {
    var args = remapArgs(Array.from(arguments));
    return curried.apply(null, args)
  }
};
var remap = curry(remapFunction);

var katsuCurry_es = /*#__PURE__*/Object.freeze({
  __proto__: null,
  $: $,
  PLACEHOLDER: PLACEHOLDER,
  curry: curry,
  curryObjectK: curryObjectK,
  curryObjectN: curryObjectN,
  curryObjectKN: curryObjectKN,
  pipe: pipe,
  compose: compose,
  curryify: curryify,
  version: version$1,
  K: K,
  I: I,
  remap: remap,
  remapArray: remapArray
});

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var katsuCurry = /*@__PURE__*/getAugmentedNamespace(katsuCurry_es);

// This is a nearly 1:1 port of fast-twister
// A few small modifications were made, in order to:
// 1. add conditional logging
// 2. match existing lint / best-practices
// 3. deal with ESM modules
// The original license of fast-twister: https://gitlab.com/rockerest/fast-mersenne-twister/-/blob/master/LICENSE
// and it has been placed below for consistency
/*
-------------------------
The below license is duplicated per the terms of the original software.

Per http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/elicense.html, the Mersenne Twister has no usage restrictions.
-------------------------

Coded by Takuji Nishimura and Makoto Matsumoto.

Before using, initialize the state by using init_genrand(seed)
or init_by_array(init_key, key_length).

Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

	1. Redistributions of source code must retain the above copyright
	notice, this list of conditions and the following disclaimer.

	2. Redistributions in binary form must reproduce the above copyright
	notice, this list of conditions and the following disclaimer in the
	documentation and/or other materials provided with the distribution.

	3. The names of its contributors may not be used to endorse or promote
	products derived from this software without specific prior written
	permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


Any feedback is very welcome.
http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)

-------------------------

Additionally, the implementation in this repository (mersenne.js), is a VERY
heavily modified version of Stephan Brumme's version of the Mersenne Twister,
found here: https://create.stephan-brumme.com/mersenne-twister/

The license for that implementation is below.

-------------------------

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.

-------------------------

It has already been stated, but bears repeating:

While this implementation is based on Stephan Brumme's code, it has been
    very heavily modified - primarily for syntax, but also some small algorithm changes
    to make it agree with the original C version from Matsumoto & Nishimura

*/

const N = 624;
const N_MINUS_1 = 623;
const M = 397;
const M_MINUS_1 = 396;
const DIFF = N - M;
const MATRIX_A = 0x9908b0df;
const UPPER_MASK = 0x80000000;
const LOWER_MASK = 0x7fffffff;

function twist(state) {
  let bits;

  for (let i = 0; i < DIFF; i++) {
    bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);
    state[i] = state[i + M] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
  }
  for (let i = DIFF; i < N_MINUS_1; i++) {
    bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);
    state[i] = state[i - DIFF] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
  }

  bits = (state[N_MINUS_1] & UPPER_MASK) | (state[0] & LOWER_MASK);
  state[N_MINUS_1] = state[M_MINUS_1] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);

  return state
}

function initializeWithArray(seedArray) {
  const state = initializeWithNumber(19650218);
  const len = seedArray.length;

  let i = 1;
  let j = 0;
  let k = N > len ? N : len;

  for (; k; k--) {
    const s = state[i - 1] ^ (state[i - 1] >>> 30);
    state[i] =
      (state[i] ^
        (((((s & 0xffff0000) >>> 16) * 1664525) << 16) +
          (s & 0x0000ffff) * 1664525)) +
      seedArray[j] +
      j;
    i++;
    j++;
    if (i >= N) {
      state[0] = state[N_MINUS_1];
      i = 1;
    }
    if (j >= len) {
      j = 0;
    }
  }
  for (k = N_MINUS_1; k; k--) {
    const s = state[i - 1] ^ (state[i - 1] >>> 30);

    state[i] =
      (state[i] ^
        (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) +
          (s & 0x0000ffff) * 1566083941)) -
      i;
    i++;
    if (i >= N) {
      state[0] = state[N_MINUS_1];
      i = 1;
    }
  }

  state[0] = UPPER_MASK;

  return state
}

function initializeWithNumber(seed) {
  const state = new Array(N);

  // fill initial state
  state[0] = seed;
  for (let i = 1; i < N; i++) {
    const s = state[i - 1] ^ (state[i - 1] >>> 30);
    state[i] =
      ((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
      (s & 0x0000ffff) * 1812433253 +
      i;
  }

  return state
}

function initialize(seed = Date.now()) {
  const state = Array.isArray(seed)
    ? initializeWithArray(seed)
    : initializeWithNumber(seed);
  return twist(state)
}
function MersenneTwister(seed) {
  let state = initialize(seed);
  let next = 0;
  const randomInt32 = () => {
    let x;
    if (next >= N) {
      state = twist(state);
      next = 0;
    }

    x = state[next++];

    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;

    return x >>> 0
  };
  const api = {
    // [0,0xffffffff]
    randomNumber: () => randomInt32(),
    // [0,0x7fffffff]
    random31Bit: () => randomInt32() >>> 1,
    // [0,1]
    randomInclusive: () => randomInt32() * (1.0 / 4294967295.0),
    // [0,1)
    random: () => randomInt32() * (1.0 / 4294967296.0),
    // (0,1)
    randomExclusive: () => (randomInt32() + 0.5) * (1.0 / 4294967296.0),
    // [0,1), 53-bit resolution
    random53Bit: () => {
      const a = randomInt32() >>> 5;
      const b = randomInt32() >>> 6;
      return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0)
    },
  };

  return api
}

const MAX_INT = 9007199254740992;
const CONSTANTS = {
  MAX_INT,
  MIN_INT: MAX_INT * -1,
};

const ERRORS = {
  TOO_BIG: "Number exceeds acceptable JavaScript integer size!",
  TOO_SMALL: "Number is below acceptable JavaScript integer size!",
  MIN_UNDER_MAX: "Minimum must be smaller than maximum!",
};

function throwOnInvalidInteger(x) {
  const minTest = testValidInteger(x);
  if (minTest) {
    throw new RangeError(ERRORS[minTest])
  }
}

function testValidInteger(x) {
  if (x > CONSTANTS.MAX_INT) {
    return "TOO_BIG"
  }
  if (x < CONSTANTS.MIN_INT) {
    return "TOO_SMALL"
  }
  return false
}

function Unusual(seed) {
  if (!(this instanceof Unusual)) {
    // eslint-disable-next-line no-unused-vars
    return seed ? new Unusual(seed) : new Unusual()
  }
  this.seed = Array.isArray(seed) || typeof seed === "number" ? seed : 0;
  if (typeof seed === "string") {
    let seedling = 0;
    let hash = 0;
    seed.split("").forEach((c, i) => {
      hash = seed.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
      seedling += hash;
    });
    this.seed += seedling;
  }
  const twister = new MersenneTwister(this.seed);
  const random = twister.random;

  function integer({ min, max }) {
    const test = [min, max];
    test.map(throwOnInvalidInteger);
    if (min > max) {
      throw new RangeError(ERRORS.MIN_UNDER_MAX)
    }
    return Math.floor(random() * (max - min + 1) + min)
  }
  function pick(list) {
    const max = list.length - 1;
    const index = integer({ min: 0, max });
    return list[index]
  }

  function pickKey(obj) {
    const keys = Object.keys(obj);
    return pick(keys)
  }
  function pickValue(obj) {
    const key = pickKey(obj);
    return obj[key]
  }
  function floor(x) {
    return Math.floor(random() * x)
  }
  function floorMin(min, x) {
    const output = floor(x) + min;
    return output
  }
  function shuffle(list) {
    const copy = [].concat(list);
    let start = copy.length;
    while (start-- > 0) {
      const index = floor(start + 1);
      const a = copy[index];
      const b = copy[start];
      copy[index] = b;
      copy[start] = a;
    }
    return copy
  }
  this.random = random;
  this.integer = integer;
  this.pick = pick;
  this.pickKey = pickKey;
  this.pickValue = pickValue;
  this.floor = floor;
  this.floorMin = katsuCurry.curry(floorMin);
  this.shuffle = shuffle;
  return this
}

var unusual = Unusual;

var devDependencies = {
	"@babel/core": "^7.0.0-0",
	"@babel/eslint-parser": "^7.13.14",
	"@babel/plugin-proposal-object-rest-spread": "^7.13.8",
	"@babel/plugin-transform-destructuring": "^7.13.0",
	"@babel/preset-env": "^7.13.15",
	"@rollup/plugin-alias": "^3.1.2",
	"@rollup/plugin-babel": "^5.3.0",
	"@rollup/plugin-commonjs": "^18.0.0",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.1",
	eslint: "^7.24.0",
	"eslint-config-sorcerers": "^0.0.7",
	husky: ">=6",
	"lint-staged": ">=10",
	nps: "^5.10.0",
	prettier: "^2.2.1",
	"prettier-eslint": "^12.0.0",
	ripjam: "^0.0.9",
	rollup: "^2.45.2"
};
var name = "passwind";
var version = "0.0.0";
var description = "tailwind? pass";
var main = "passwind.js";
var repository = "https://github.com/brekk/passwind";
var author = "Brekk <brekk@brekkbockrath.com>";
var license = "ISC";
var dependencies = {
	fluture: "^14.0.0",
	postcss: "^8.3.6",
	"postcss-discard-empty": "^5.0.1",
	"postcss-discard-unused": "^5.0.1",
	"postcss-html": "^0.36.0",
	"postcss-js": "^3.0.3",
	"postcss-safe-parser": "^6.0.0",
	"postcss-selector-parser": "^6.0.6",
	"postcss-syntax": "^0.36.2",
	"posthtml-parser": "^0.10.0",
	ramda: "^0.27.1",
	torpor: "^0.1.0",
	"yargs-parser": "^20.2.9"
};
var scripts = {
	prepare: "husky install"
};
var files = [
	"passwind.js",
	"passwind.mjs",
	"passwind.umd.js"
];
var pkg = {
	devDependencies: devDependencies,
	name: name,
	version: version,
	description: description,
	main: main,
	repository: repository,
	author: author,
	license: license,
	"private": false,
	dependencies: dependencies,
	"lint-staged": {
	"*.js": "eslint --cache --fix",
	"*.{js,css,md}": "prettier --write"
},
	scripts: scripts,
	files: files
};

const random = new unusual(`${pkg.name}${pkg.version}`);

const ALPHABET = `abcdefghijklmnopqrstuvwxyz`;
const NUMBERS = `0123456789`;
const letter = () => random.pick(ALPHABET);
const number = () => random.pick(NUMBERS);

const letters = pipe$1(times(letter), join(''));
const numbers = pipe$1(times(number), join(''));
const uniqId = () => letters(8) + '-' + numbers(4);

// const uniq = uniqBy(I)
//
const classAttributes = pathOr('', ['attrs', 'class']);
const fashion = memoizeWith(
  classAttributes,
  pipe$1(
    classAttributes,
    ifElse(equals(''), always(false), classes => ({
      id: uniqId(),
      selector: pipe$1(
        split(' '),
        map(pipe$1(trim, replace(/\n/g, ''))),
        filter$1(z => !!z),
      )(classes),
    })),
  ),
);

const hasKids = pipe$1(length$1, lt(0));

const walk = curry$1(function _walk(steps, node) {
  const pulled = fashion(node);
  const aggregated = pulled ? steps.concat(pulled) : steps;
  if (hasKids(node.content)) {
    return chain(walk(aggregated))(node.content)
  }
  return aggregated
});

function cancel() {}
const cssWithCancel = curry$1(function _cssWithCancel(
  canceller,
  raw,
) {
  return new Future(function parseCSS(bad, good) {
    try {
      pipe$1(parse, objectify, good)(raw);
    } catch (e) {
      bad(e);
    }
    return canceller
  })
});

const htmlWithCancel = curry$1(function _htmlWithCancel(
  canceller,
  raw,
) {
  return new Future(function parseHTMLAsync(bad, good) {
    try {
      if (!is(String, raw)) {
        bad(new TypeError('Expected an html string'));
      } else {
        const steps = [];
        const parsed = parser$1(raw, { lowerCaseTags: true });
        pipe$1(head, walk(steps), uniqBy(prop$1('id')), good)(parsed);
      }
    } catch (e) {
      bad(e);
    }
    return canceller
  })
});

const css$1 = cssWithCancel(cancel);
const html$1 = htmlWithCancel(cancel);

const readAndParseWith = fn =>
  pipe$1(readFile(__, 'utf8'), chain(fn));

const css = readAndParseWith(css$1);
const html = readAndParseWith(html$1);

const SELECTOR = 'selector';
const DEFINITIONS = 'definitions';
const DEFINITION = 'definition';
const COMMA_NEWLINE = /,\n/g;
const COLON = ':';
const ESCAPED_COLON = /\\:/g;
const AT = '@';
const MEDIA = 'media';
const DOT_HOVER = '.hover';

const classify = z => `.${z}`;
const classifyAll = map(classify);

const anyMatch = curry$1(function _anyMatch(a, b) {
  return any(includes(__, a))(b)
});

const cleanSplit = pipe$1(
  split(' '),
  map(pipe$1(replace(COMMA_NEWLINE, ''), trim)),
);

pipe$1(split(COMMA_NEWLINE), filter$1(identity));

const hasColon = pipe$1(indexOf(COLON), lt(0));
when(
  hasColon,
  pipe$1(indexOf(COLON), slice(__, Infinity)),
);

const isEmptyObject = pipe$1(keys$1, length$1, equals(0));
const isNotEmptyObject = complement(isEmptyObject);

const isAtRule = startsWith(AT);
const isMediaRule = includes(MEDIA);
const isAtMediaRule = both(isAtRule, isMediaRule);
filter$1(pipe$1(head, isAtRule));
const fixColons = replace(ESCAPED_COLON, COLON);
const fixColonPairs = map(([k, v]) => [fixColons(k), v]);
const getResponsiveSelectors = pipe$1(
  filter$1(pipe$1(head, isAtMediaRule)),
  chain(pipe$1(nth(1), toPairs, fixColonPairs)),
);
const getHoverSelectors = pipe$1(
  filter$1(pipe$1(head, startsWith(DOT_HOVER))),
  fixColonPairs,
  map(([k, v]) => [k.slice(0, -6), v]),
);

const matchingSelectors = curry$1(function _matchingSelectors(
  dotClasses,
  cssPairs,
) {
  return filter$1(pipe$1(head, cleanSplit, anyMatch(dotClasses)))(
    cssPairs,
  )
});

const conditionalMergeAs = curry$1((key, list, a, b) =>
  ifElse(
    isNotEmptyObject,
    pipe$1(objOf(key), mergeRight(a), of, concat(list)),
    always(list),
  )(b),
);

const getAllClasses = pipe$1(
  map(prop$1(SELECTOR)),
  reduce(concat, []),
  classifyAll,
  uniqBy(identity),
);

const cutClasses = curry$1(function _cutDownClasses(
  parsedCSS,
  htmlClasses,
) {
  const dotClasses = getAllClasses(htmlClasses);
  return pipe$1(
    toPairs,
    pairs =>
      pipe$1(
        of,
        ap([getResponsiveSelectors, getHoverSelectors]),
        apply(concat),
        concat(pairs),
        matchingSelectors(dotClasses),
      )(pairs),
    fromPairs,
  )(parsedCSS)
});

const looseClassMatch = curry$1(function _looseClassMatch(defs, cls) {
  const lookup = defs[cls];
  return lookup ? [cls, lookup] : false
});

const grabDefinition = curry$1(function _grabDefinition(defs, lookup) {
  return pipe$1(
    map(looseClassMatch(defs)),
    filter$1(identity),
    fromPairs,
  )(lookup)
});

const cleanKey = propertyName =>
  propertyName.replace(
    /[A-Z]/g,
    (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase(),
  );

const fixKeys = pipe$1(
  toPairs,
  map(([k, v]) => [cleanKey(k), v]),
  fromPairs,
);

const mergeDefinitions = raw =>
  pipe$1(
    propOr([], DEFINITIONS),
    values,
    reduce((agg, x) => mergeRight(agg, fixKeys(x)), {}),
    objOf(DEFINITION),
    mergeRight(raw),
  )(raw);
const print = pipe$1(
  toPairs,
  map(pipe$1(join(': '), z => `  ${z};`)),
  join('\n'),
);

const stringifyDefinition = ({
  id,
  selector,
  definition,
}) => `.${id} {
  /* tailwind selectors: ${selector.join(' ')} */
${print(definition)}
}`;
const stringifyDefinitions = pipe$1(
  map(stringifyDefinition),
  join('\n'),
);

const consumer = curry$1(function _consumer(
  options,
  parsedCSS,
  htmlClasses,
) {
  const cut = cutClasses(parsedCSS, htmlClasses);
  return pipe$1(
    reduce(
      (agg, def) =>
        pipe$1(
          propOr([], SELECTOR),
          classifyAll,
          grabDefinition(cut),
          conditionalMergeAs(DEFINITIONS, agg, def),
        )(def),
      [],
    ),
    map(mergeDefinitions),
    options.drop ? map(omit([DEFINITIONS, SELECTOR])) : identity,
    options.flatten ? stringifyDefinitions : identity,
  )(htmlClasses)
});

const passwind = curry$1(function _passwind(
  options,
  cssFile,
  htmlFile,
) {
  return pipe$1(
    ap$1(css(cssFile)),
    ap$1(html(htmlFile)),
  )(resolve(consumer(options)))
});

const reader = {
  readAndParseWith,
  css: css,
  html: html,
};

const parser = {
  walk,
  cssWithCancel,
  css: css$1,
  htmlWithCancel,
  html: html$1,
};

export { parser, passwind, reader };
