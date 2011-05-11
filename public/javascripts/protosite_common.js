/*  Prototype JavaScript framework, version 1.7
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/
// DO NOT UPGRADE WITHOUT CHECKING THAT THINGS ARE PROPERLY USING Element.method(element, args)
// XXX - THIS FILE HAS BEEN MODIFIED IN PROTOSITE.

var Prototype = {

  Version: '1.7',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,

    SelectorsAPI: !!document.querySelector,

    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div'),
          form = document.createElement('form'),
          isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },

  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString,
      NULL_TYPE = 'Null',
      UNDEFINED_TYPE = 'Undefined',
      BOOLEAN_TYPE = 'Boolean',
      NUMBER_TYPE = 'Number',
      STRING_TYPE = 'String',
      OBJECT_TYPE = 'Object',
      FUNCTION_CLASS = '[object Function]',
      BOOLEAN_CLASS = '[object Boolean]',
      NUMBER_CLASS = '[object Number]',
      STRING_CLASS = '[object String]',
      ARRAY_CLASS = '[object Array]',
      DATE_CLASS = '[object Date]',
      NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
        typeof JSON.stringify === 'function' &&
        JSON.stringify(0) === '0' &&
        typeof JSON.stringify(Prototype.K) === 'undefined';

  function Type(o) {
    switch(o) {
      case null: return NULL_TYPE;
      case (void 0): return UNDEFINED_TYPE;
    }
    var type = typeof o;
    switch(type) {
      case 'boolean': return BOOLEAN_TYPE;
      case 'number':  return NUMBER_TYPE;
      case 'string':  return STRING_TYPE;
    }
    return OBJECT_TYPE;
  }

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(value) {
    return Str('', { '': value }, []);
  }

  function Str(key, holder, stack) {
    var value = holder[key],
        type = typeof value;

    if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    var _class = _toString.call(value);

    switch (_class) {
      case NUMBER_CLASS:
      case BOOLEAN_CLASS:
      case STRING_CLASS:
        value = value.valueOf();
    }

    switch (value) {
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    type = typeof value;
    switch (type) {
      case 'string':
        return value.inspect(true);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'object':

        for (var i = 0, length = stack.length; i < length; i++) {
          if (stack[i] === value) { throw new TypeError(); }
        }
        stack.push(value);

        var partial = [];
        if (_class === ARRAY_CLASS) {
          for (var i = 0, length = value.length; i < length; i++) {
            var str = Str(i, value, stack);
            partial.push(typeof str === 'undefined' ? 'null' : str);
          }
          partial = '[' + partial.join(',') + ']';
        } else {
          var keys = Object.keys(value);
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i], str = Str(key, value, stack);
            if (typeof str !== "undefined") {
               partial.push(key.inspect(true)+ ':' + str);
             }
          }
          partial = '{' + partial.join(',') + '}';
        }
        stack.pop();
        return partial;
    }
  }

  function stringify(object) {
    return JSON.stringify(object);
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
    var results = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        results.push(property);
      }
    }
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) === ARRAY_CLASS;
  }

  var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return _toString.call(object) === FUNCTION_CLASS;
  }

  function isString(object) {
    return _toString.call(object) === STRING_CLASS;
  }

  function isNumber(object) {
    return _toString.call(object) === NUMBER_CLASS;
  }

  function isDate(object) {
    return _toString.call(object) === DATE_CLASS;
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          Object.keys || keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isDate:        isDate,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());



(function(proto) {


  function toISOString() {
    return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
  }


  function toJSON() {
    return this.toISOString();
  }

  if (!proto.toISOString) proto.toISOString = toISOString;
  if (!proto.toJSON) proto.toJSON = toJSON;

})(Date.prototype);


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {
  var NATIVE_JSON_PARSE_SUPPORT = window.JSON &&
    typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];

        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON(),
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    if (cx.test(json)) {
      json = json.replace(cx, function (a) {
        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
    }
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function parseJSON() {
    var json = this.unfilterJSON();
    return JSON.parse(json);
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.indexOf(pattern, d) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim || strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();

function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}


function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator, context) {
    for (var i = 0, length = this.length >>> 0; i < length; i++) {
      if (i in this) iterator.call(context, this[i], i, this);
    }
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }


  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }



  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values)) {
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(toQueryPair(key, value));
          }
          return results.concat(queryValues);
        }
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toObject,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params += (params ? '&' : '') + "_method=" + this.method;
      this.method = 'post';
    }

    if (params && this.method === 'get') {
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 304;
  },

  getStatus: function() {
    try {
      if (this.transport.status === 1223) return 204;
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});


function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}



(function(global) {
  function shouldUseCache(tagName, attributes) {
    if (tagName === 'select') return false;
    if ('type' in attributes) return false;
    return true;
  }

  var HAS_EXTENDED_CREATE_ELEMENT_SYNTAX = (function(){
    try {
      var el = document.createElement('<input name="x">');
      return el.tagName.toLowerCase() === 'input' && el.name === 'x';
    }
    catch(err) {
      return false;
    }
  })();

  var element = global.Element;

  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;

    if (HAS_EXTENDED_CREATE_ELEMENT_SYNTAX && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }

    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));

    var node = shouldUseCache(tagName, attributes) ?
     cache[tagName].cloneNode(false) : document.createElement(tagName);

    return Element.writeAttribute(node, attributes);
  };

  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;

})(this);

Element.idCounter = 1;
Element.cache = { };

Element._purgeElement = function(element) {
  var uid = element._prototypeUID;
  if (uid) {
    Element.stopObserving(element);
    element._prototypeUID = void 0;
    delete Element.Storage[uid];
  }
}

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var LINK_ELEMENT_INNERHTML_BUGGY = (function() {
      try {
        var el = document.createElement('div');
        el.innerHTML = "<link>";
        var isBuggy = (el.childNodes.length === 0);
        el = null;
        return isBuggy;
      } catch(e) {
        return true;
      }
    })();

    var ANY_INNERHTML_BUGGY = SELECT_ELEMENT_INNERHTML_BUGGY ||
     TABLE_ELEMENT_INNERHTML_BUGGY || LINK_ELEMENT_INNERHTML_BUGGY;

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();


    function update(element, content) {
      element = $(element);
      var purgeElement = Element._purgeElement;

      var descendants = element.getElementsByTagName('*'),
       i = descendants.length;
      while (i--) purgeElement(descendants[i]);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (ANY_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        } else if (LINK_ELEMENT_INNERHTML_BUGGY && Object.isString(content) && content.indexOf('<link') > -1) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          var nodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts(), true);
          nodes.each(function(node) { element.appendChild(node) });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(),
          attribute = pair.last(),
          value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property, maximumLength) {
    element = $(element);
    maximumLength = maximumLength || -1;
    var elements = [];

    while (element = element[property]) {
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
      if (elements.length == maximumLength)
        break;
    }

    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    var results = [], child = $(element).firstChild;
    while (child) {
      if (child.nodeType === 1) {
        results.push(Element.extend(child));
      }
      child = child.nextSibling;
    }
    return results;
  },

  previousSiblings: function(element, maximumLength) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    element = $(element);
    if (Object.isString(selector))
      return Prototype.Selector.match(element, selector);
    return selector.match(element);
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Prototype.Selector.find(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.previousSiblings(), expression, index);
    } else {
      return element.recursivelyCollect("previousSibling", index + 1)[index];
    }
  },

  next: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.nextSiblings(), expression, index);
    } else {
      var maximumLength = Object.isNumber(index) ? index + 1 : 1;
      return element.recursivelyCollect("nextSibling", index + 1)[index];
    }
  },


  select: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element);
  },

  adjacent: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element.parentNode).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style, doc) {
    doc = doc || document;
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = doc.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return Element.getStyle(element, 'opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        Element.setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') Element.setOpacity(element, styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source), delta = [0, 0], parent = null;

    element = $(element);

    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className',
        forProp = 'for',
        el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div'), f;
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if (element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next(),
          fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html, force) {
  var div = new Element('div'),
      t = Element._insertionTranslations.tags[tagName];

  var workaround = false;
  if (t) workaround = true;
  else if (force) {
    workaround = true;
    t = ['', '', 0];
  }

  if (workaround) {
    div.innerHTML = '&nbsp;' + t[0] + html + t[1];
    div.removeChild(div.firstChild);
    for (var i = t[2]; i--; ) {
      div = div.firstChild;
    }
  }
  else {
    div.innerHTML = html;
  }
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'));

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2),
            el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

if (document.documentElement.hasAttribute) {
  Element.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
}
else {
  Element.hasAttribute = Element.Methods.Simulated.hasAttribute;
}

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods),
      "BUTTON":   Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName),
        proto = element['__proto__'] || element.constructor.prototype;

    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = Element.Storage.UID++;
      uid = element._prototypeUID;
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  },

  purge: function(element) {
    if (!(element = $(element))) return;
    var purgeElement = Element._purgeElement;

    purgeElement(element);

    var descendants = element.getElementsByTagName('*'),
     i = descendants.length;

    while (i--) purgeElement(descendants[i]);

    return null;
  }
});

(function() {

  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }

  function getPixelValue(value, property, context) {
    var element = null;
    if (Object.isElement(value)) {
      element = value;
      value = element.getStyle(property);
    }

    if (value === null) {
      return null;
    }

    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(value)) {
      return window.parseFloat(value);
    }

    var isPercentage = value.include('%'), isViewport = (context === document.viewport);

    if (/\d/.test(value) && element && element.runtimeStyle && !(isPercentage && isViewport)) {
      var style = element.style.left, rStyle = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;

      return value;
    }

    if (element && isPercentage) {
      context = context || element.parentNode;
      var decimal = toDecimal(value);
      var whole = null;
      var position = element.getStyle('position');

      var isHorizontal = property.include('left') || property.include('right') ||
       property.include('width');

      var isVertical =  property.include('top') || property.include('bottom') ||
        property.include('height');

      if (context === document.viewport) {
        if (isHorizontal) {
          whole = document.viewport.getWidth();
        } else if (isVertical) {
          whole = document.viewport.getHeight();
        }
      } else {
        if (isHorizontal) {
          whole = $(context).measure('width');
        } else if (isVertical) {
          whole = $(context).measure('height');
        }
      }

      return (whole === null) ? 0 : whole * decimal;
    }

    return 0;
  }

  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px')) {
      return number;
    }
    return number + 'px';
  }

  function isDisplayed(element) {
    var originalElement = element;
    while (element && element.parentNode) {
      var display = Element.getStyle(element, 'display');
      if (display === 'none') {
        return false;
      }
      element = $(element.parentNode);
    }
    return true;
  }

  var hasLayout = Prototype.K;
  if ('currentStyle' in document.documentElement) {
    hasLayout = function(element) {
      if (!element.currentStyle.hasLayout) {
        element.style.zoom = 1;
      }
      return element;
    };
  }

  function cssNameFor(key) {
    if (key.include('border')) key = key + '-width';
    return key.camelize();
  }

  Element.Layout = Class.create(Hash, {
    initialize: function($super, element, preCompute) {
      $super();
      this.element = $(element);

      Element.Layout.PROPERTIES.each( function(property) {
        this._set(property, null);
      }, this);

      if (preCompute) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each( this._compute, this );
        this._end();
        this._preComputing = false;
      }
    },

    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },

    set: function(property, value) {
      throw "Properties of Element.Layout are read-only.";
    },

    get: function($super, property) {
      var value = $super(property);
      return value === null ? this._compute(property) : value;
    },

    _begin: function() {
      if (this._prepared) return;

      var element = this.element;
      if (isDisplayed(element)) {
        this._prepared = true;
        return;
      }

      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };

      element.store('prototype_original_styles', originalStyles);

      var position = element.getStyle('position'),
       width = element.getStyle('width');

      if (width === "0px" || width === null) {
        element.style.display = 'block';
        width = element.getStyle('width');
      }

      var context = (position === 'fixed') ? document.viewport :
       element.parentNode;

      element.setStyle({
        position:   'absolute',
        visibility: 'hidden',
        display:    'block'
      });

      var positionedWidth = element.getStyle('width');

      var newWidth;
      if (width && (positionedWidth === width)) {
        newWidth = getPixelValue(element, 'width', context);
      } else if (position === 'absolute' || position === 'fixed') {
        newWidth = getPixelValue(element, 'width', context);
      } else {
        var parent = element.parentNode, pLayout = $(parent).getLayout();

        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }

      element.setStyle({ width: newWidth + 'px' });

      this._prepared = true;
    },

    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);
      element.setStyle(originalStyles);
      this._prepared = false;
    },

    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }

      return this._set(property, COMPUTATIONS[property].call(this, this.element));
    },

    toObject: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var obj = {};
      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        var value = this.get(key);
        if (value != null) obj[key] = value;
      }, this);
      return obj;
    },

    toHash: function() {
      var obj = this.toObject.apply(this, arguments);
      return new Hash(obj);
    },

    toCSS: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var css = {};

      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        if (Element.Layout.COMPOSITE_PROPERTIES.include(key)) return;

        var value = this.get(key);
        if (value != null) css[cssNameFor(key)] = value + 'px';
      }, this);
      return css;
    },

    inspect: function() {
      return "#<Element.Layout>";
    }
  });

  Object.extend(Element.Layout, {
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),

    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),

    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();

        var bHeight = this.get('border-box-height');
        if (bHeight <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bTop = this.get('border-top'),
         bBottom = this.get('border-bottom');

        var pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        if (!this._preComputing) this._end();

        return bHeight - bTop - bBottom - pTop - pBottom;
      },

      'width': function(element) {
        if (!this._preComputing) this._begin();

        var bWidth = this.get('border-box-width');
        if (bWidth <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bLeft = this.get('border-left'),
         bRight = this.get('border-right');

        var pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        if (!this._preComputing) this._end();

        return bWidth - bLeft - bRight - pLeft - pRight;
      },

      'padding-box-height': function(element) {
        var height = this.get('height'),
         pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        return height + pTop + pBottom;
      },

      'padding-box-width': function(element) {
        var width = this.get('width'),
         pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        return width + pLeft + pRight;
      },

      'border-box-height': function(element) {
        if (!this._preComputing) this._begin();
        var height = element.offsetHeight;
        if (!this._preComputing) this._end();
        return height;
      },

      'border-box-width': function(element) {
        if (!this._preComputing) this._begin();
        var width = element.offsetWidth;
        if (!this._preComputing) this._end();
        return width;
      },

      'margin-box-height': function(element) {
        var bHeight = this.get('border-box-height'),
         mTop = this.get('margin-top'),
         mBottom = this.get('margin-bottom');

        if (bHeight <= 0) return 0;

        return bHeight + mTop + mBottom;
      },

      'margin-box-width': function(element) {
        var bWidth = this.get('border-box-width'),
         mLeft = this.get('margin-left'),
         mRight = this.get('margin-right');

        if (bWidth <= 0) return 0;

        return bWidth + mLeft + mRight;
      },

      'top': function(element) {
        var offset = element.positionedOffset();
        return offset.top;
      },

      'bottom': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pHeight = parent.measure('height');

        var mHeight = this.get('border-box-height');

        return pHeight - mHeight - offset.top;
      },

      'left': function(element) {
        var offset = element.positionedOffset();
        return offset.left;
      },

      'right': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pWidth = parent.measure('width');

        var mWidth = this.get('border-box-width');

        return pWidth - mWidth - offset.left;
      },

      'padding-top': function(element) {
        return getPixelValue(element, 'paddingTop');
      },

      'padding-bottom': function(element) {
        return getPixelValue(element, 'paddingBottom');
      },

      'padding-left': function(element) {
        return getPixelValue(element, 'paddingLeft');
      },

      'padding-right': function(element) {
        return getPixelValue(element, 'paddingRight');
      },

      'border-top': function(element) {
        return getPixelValue(element, 'borderTopWidth');
      },

      'border-bottom': function(element) {
        return getPixelValue(element, 'borderBottomWidth');
      },

      'border-left': function(element) {
        return getPixelValue(element, 'borderLeftWidth');
      },

      'border-right': function(element) {
        return getPixelValue(element, 'borderRightWidth');
      },

      'margin-top': function(element) {
        return getPixelValue(element, 'marginTop');
      },

      'margin-bottom': function(element) {
        return getPixelValue(element, 'marginBottom');
      },

      'margin-left': function(element) {
        return getPixelValue(element, 'marginLeft');
      },

      'margin-right': function(element) {
        return getPixelValue(element, 'marginRight');
      }
    }
  });

  if ('getBoundingClientRect' in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      'right': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.right - rect.right).round();
      },

      'bottom': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.bottom - rect.bottom).round();
      }
    });
  }

  Element.Offset = Class.create({
    initialize: function(left, top) {
      this.left = left.round();
      this.top  = top.round();

      this[0] = this.left;
      this[1] = this.top;
    },

    relativeTo: function(offset) {
      return new Element.Offset(
        this.left - offset.left,
        this.top  - offset.top
      );
    },

    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
    },

    toString: function() {
      return "[#{left}, #{top}]".interpolate(this);
    },

    toArray: function() {
      return [this.left, this.top];
    }
  });

  function getLayout(element, preCompute) {
    return new Element.Layout(element, preCompute);
  }

  function measure(element, property) {
    return $(element).getLayout().get(property);
  }

  function getDimensions(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');

    if (display && display !== 'none') {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position:   style.position,
      display:    style.display
    };

    var newStyles = {
      visibility: 'hidden',
      display:    'block'
    };

    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';

    Element.setStyle(element, newStyles);

    var dimensions = {
      width:  element.offsetWidth,
      height: element.offsetHeight
    };

    Element.setStyle(element, originalStyles);

    return dimensions;
  }

  function getOffsetParent(element) {
    element = $(element);

    if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
      return $(document.body);

    var isInline = (Element.getStyle(element, 'display') === 'inline');
    if (!isInline && element.offsetParent) return $(element.offsetParent);

    while ((element = element.parentNode) && element !== document.body) {
      if (Element.getStyle(element, 'position') !== 'static') {
        return isHtml(element) ? $(document.body) : $(element);
      }
    }

    return $(document.body);
  }


  function cumulativeOffset(element) {
    element = $(element);
    var valueT = 0, valueL = 0;
    if (element.parentNode) {
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
    }
    return new Element.Offset(valueL, valueT);
  }

  function positionedOffset(element) {
    element = $(element);

    var layout = element.getLayout();

    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (isBody(element)) break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);

    valueL -= layout.get('margin-top');
    valueT -= layout.get('margin-left');

    return new Element.Offset(valueL, valueT);
  }

  function cumulativeScrollOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  function viewportOffset(forElement) {
    element = $(element);
    var valueT = 0, valueL = 0, docBody = document.body;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }

  function absolutize(element) {
    element = $(element);

    if (Element.getStyle(element, 'position') === 'absolute') {
      return element;
    }

    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      left:   element.getStyle('left'),
      top:    element.getStyle('top'),
      width:  element.getStyle('width'),
      height: element.getStyle('height')
    });

    element.setStyle({
      position: 'absolute',
      top:    offset.top + 'px',
      left:   offset.left + 'px',
      width:  layout.get('width') + 'px',
      height: layout.get('height') + 'px'
    });

    return element;
  }

  function relativize(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') === 'relative') {
      return element;
    }

    var originalStyles =
     element.retrieve('prototype_absolutize_original_styles');

    if (originalStyles) element.setStyle(originalStyles);
    return element;
  }

  if (Prototype.Browser.IE) {
    getOffsetParent = getOffsetParent.wrap(
      function(proceed, element) {
        element = $(element);

        if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
          return $(document.body);

        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);

        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );

    positionedOffset = positionedOffset.wrap(function(proceed, element) {
      element = $(element);
      if (!element.parentNode) return new Element.Offset(0, 0);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);

      var offsetParent = element.getOffsetParent();
      if (offsetParent && offsetParent.getStyle('position') === 'fixed')
        hasLayout(offsetParent);

      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    });
  } else if (Prototype.Browser.Webkit) {
    cumulativeOffset = function(element) {
      element = $(element);
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body)
          if (Element.getStyle(element, 'position') == 'absolute') break;

        element = element.offsetParent;
      } while (element);

      return new Element.Offset(valueL, valueT);
    };
  }


  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    getDimensions:          getDimensions,
    getOffsetParent:        getOffsetParent,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset,
    absolutize:             absolutize,
    relativize:             relativize
  });

  function isBody(element) {
    return element.nodeName.toUpperCase() === 'BODY';
  }

  function isHtml(element) {
    return element.nodeName.toUpperCase() === 'HTML';
  }

  function isDocument(element) {
    return element.nodeType === Node.DOCUMENT_NODE;
  }

  function isDetached(element) {
    return element !== document.body &&
     !Element.descendantOf(element, document.body);
  }

  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = $(element);
        if (isDetached(element)) return new Element.Offset(0, 0);

        var rect = element.getBoundingClientRect(),
         docEl = document.documentElement;
        return new Element.Offset(rect.left - docEl.clientLeft,
         rect.top - docEl.clientTop);
      }
    });
  }
})();
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};

Prototype.Selector = (function() {

  function select() {
    throw new Error('Method "Prototype.Selector.select" must be defined.');
  }

  function match() {
    throw new Error('Method "Prototype.Selector.match" must be defined.');
  }

  function find(elements, expression, index) {
    index = index || 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }

  function extendElements(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }


  var K = Prototype.K;

  return {
    select: select,
    match: match,
    find: find,
    extendElements: (Element.extend === K) ? K : extendElements,
    extendElement: Element.extend
  };
})();
Prototype._original_property = window.Sizzle;
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context),
		soFar = selector;

	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];

		parts.push( m[1] );

		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;

		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}

					var doneName = match[0],
						parent = elem.parentNode;

					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}
						parent.sizcache = doneName;
					}

					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}

	return array;
};

try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

(function(){
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){

	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}

	Sizzle = function(query, context, extra, seed){
		context = context || document;

		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}

		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	if ( div.getElementsByClassName("e").length === 0 )
		return;

	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};


window.Sizzle = Sizzle;

})();

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;

  function select(selector, scope) {
    return extendElements(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }

  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Sizzle);

window.Sizzle = Prototype._original_property;
delete Prototype._original_property;

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit, accumulator, initial;

    initial = {};
    accumulator = function(result, key, value) {
      if (key in result) {
        if (!Object.isArray(result[key])) result[key] = [result[key]];
        result[key].push(value);
      } else result[key] = value;
      return result;
    };

    var object = elements.inject(initial, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (element.type && element.type == 'checkbox' && value) delete initial[key];
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          result = accumulator(result, key, value);
        }
      }
      return result;
    });

    return (options.hash) ? object : Object.toQueryString(object);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    var element = form.findFirstElement();
    if (element) element.activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = (function() {
  function input(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return inputSelector(element, value);
      default:
        return valueSelector(element, value);
    }
  }

  function inputSelector(element, value) {
    if (Object.isUndefined(value))
      return element.checked ? element.value : null;
    else element.checked = !!value;
  }

  function valueSelector(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  }

  function select(element, value) {
    if (Object.isUndefined(value))
      return (element.type === 'select-one' ? selectOne : selectMany)(element);

    var opt, currentValue, single = !Object.isArray(value);
    for (var i = 0, length = element.length; i < length; i++) {
      opt = element.options[i];
      currentValue = this.optionValue(opt);
      if (single) {
        if (currentValue == value) {
          opt.selected = true;
          return;
        }
      }
      else opt.selected = value.include(currentValue);
    }
  }

  function selectOne(element) {
    var index = element.selectedIndex;
    return index >= 0 ? optionValue(element.options[index]) : null;
  }

  function selectMany(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(optionValue(opt));
    }
    return values;
  }

  function optionValue(opt) {
    return Element.hasAttribute(opt, 'value') ? opt.value : opt.text;
  }

  return {
    input:         input,
    inputSelector: inputSelector,
    textarea:      valueSelector,
    select:        select,
    selectOne:     selectOne,
    selectMany:    selectMany,
    optionValue:   optionValue,
    button:        valueSelector
  };
})();

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;



  var isIELegacyEvent = function(event) { return false; };

  if (window.attachEvent) {
    if (window.addEventListener) {
      isIELegacyEvent = function(event) {
        return !(event instanceof window.Event);
      };
    } else {
      isIELegacyEvent = function(event) { return true; };
    }
  }

  var _isButton;

  function _isButtonForDOMEvents(event, code) {
    return event.which ? (event.which === code + 1) : (event.button === code);
  }

  var legacyButtonMap = { 0: 1, 1: 4, 2: 2 };
  function _isButtonForLegacyEvents(event, code) {
    return event.button === legacyButtonMap[code];
  }

  function _isButtonForWebKit(event, code) {
    switch (code) {
      case 0: return event.which == 1 && !event.metaKey;
      case 1: return event.which == 2 || (event.which == 1 && event.metaKey);
      case 2: return event.which == 3;
      default: return false;
    }
  }

  if (window.attachEvent) {
    if (!window.addEventListener) {
      _isButton = _isButtonForLegacyEvents;
    } else {
      _isButton = function(event, code) {
        return isIELegacyEvent(event) ? _isButtonForLegacyEvents(event, code) :
         _isButtonForDOMEvents(event, code);
      }
    }
  } else if (Prototype.Browser.WebKit) {
    _isButton = _isButtonForWebKit;
  } else {
    _isButton = _isButtonForDOMEvents;
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);

    if (!expression) return element;
    while (element) {
      if (Object.isElement(element) && Prototype.Selector.match(element, expression)) {
        return Element.extend(element);
      }
      element = element.parentNode;
    }
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }


  Event.Methods = {
    isLeftClick:   isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick:  isRightClick,

    element:     element,
    findElement: findElement,

    pointer:  pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };

  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (window.attachEvent) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover':
        case 'mouseenter':
          element = event.fromElement;
          break;
        case 'mouseout':
        case 'mouseleave':
          element = event.toElement;
          break;
        default:
          return null;
      }
      return Element.extend(element);
    }

    var additionalMethods = {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    };

    Event.extend = function(event, element) {
      if (!event) return false;

      if (!isIELegacyEvent(event)) return event;

      if (event._extendedByPrototype) return event;
      event._extendedByPrototype = Prototype.emptyFunction;

      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      Object.extend(event, methods);
      Object.extend(event, additionalMethods);

      return event;
    };
  } else {
    Event.extend = Prototype.K;
  }

  if (window.addEventListener) {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K,
      translations = { mouseenter: "mouseover", mouseleave: "mouseout" };

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      return (translations[eventName] || eventName);
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');
    if (!registry) return element;

    if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key;
        stopObserving(element, eventName);
      });
      return element;
    }

    var responders = registry.get(eventName);
    if (!responders) return element;

    if (!handler) {
      responders.each(function(r) {
        stopObserving(element, eventName, r.handler);
      });
      return element;
    }

    var i = responders.length, responder;
    while (i--) {
      if (responders[i].handler === handler) {
        responder = responders[i];
        break;
      }
    }
    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', bubble, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }

  Event.Handler = Class.create({
    initialize: function(element, eventName, selector, callback) {
      this.element   = $(element);
      this.eventName = eventName;
      this.selector  = selector;
      this.callback  = callback;
      this.handler   = this.handleEvent.bind(this);
    },

    start: function() {
      Event.observe(this.element, this.eventName, this.handler);
      return this;
    },

    stop: function() {
      Event.stopObserving(this.element, this.eventName, this.handler);
      return this;
    },

    handleEvent: function(event) {
      var element = Event.findElement(event, this.selector);
      if (element) this.callback.call(this.element, event, element);
    }
  });

  function on(element, eventName, selector, callback) {
    element = $(element);
    if (Object.isFunction(selector) && Object.isUndefined(callback)) {
      callback = selector, selector = null;
    }

    return new Event.Handler(element, eventName, selector, callback).start();
  }

  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving,
    on:            on
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving,

    on:            on
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    on:            on.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

(function() {
  window.Selector = Class.create({
    initialize: function(expression) {
      this.expression = expression.strip();
    },

    findElements: function(rootElement) {
      return Prototype.Selector.select(this.expression, rootElement);
    },

    match: function(element) {
      return Prototype.Selector.match(element, this.expression);
    },

    toString: function() {
      return this.expression;
    },

    inspect: function() {
      return "#<Selector: " + this.expression + ">";
    }
  });

  Object.extend(Selector, {
    matchElements: function(elements, expression) {
      var match = Prototype.Selector.match,
          results = [];

      for (var i = 0, length = elements.length; i < length; i++) {
        var element = elements[i];
        if (match(element, expression)) {
          results.push(Element.extend(element));
        }
      }
      return results;
    },

    findElement: function(elements, expression, index) {
      index = index || 0;
      var matchIndex = 0, element;
      for (var i = 0, length = elements.length; i < length; i++) {
        element = elements[i];
        if (Prototype.Selector.match(element, expression) && index === matchIndex++) {
          return Element.extend(element);
        }
      }
    },

    findChildElements: function(element, expressions) {
      var selector = expressions.toArray().join(', ');
      return Prototype.Selector.select(selector, element || document);
    }
  });
})();
// script.aculo.us scriptaculous.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// For details, see the script.aculo.us web site: http://script.aculo.us/

var Scriptaculous = {
  Version: '1.9.0',
  require: function(libraryName) {
    return;
    try{
      // inserting via DOM fails in Safari 2.0, so brute force approach
      document.write('<script type="text/javascript" src="'+libraryName+'"><\/script>');
    } catch(e) {
      // for xhtml+xml served content, fall back to DOM methods
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = libraryName;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  },
  REQUIRED_PROTOTYPE: '1.6.0.3',
  load: function() {
    function convertVersionString(versionString) {
      var v = versionString.replace(/_.*|\./g, '');
      v = parseInt(v + '0'.times(4-v.length));
      return versionString.indexOf('_') > -1 ? v-1 : v;
    }

    if((typeof Prototype=='undefined') ||
       (typeof Element == 'undefined') ||
       (typeof Element.Methods=='undefined') ||
       (convertVersionString(Prototype.Version) <
        convertVersionString(Scriptaculous.REQUIRED_PROTOTYPE)))
       throw("script.aculo.us requires the Prototype JavaScript framework >= " +
        Scriptaculous.REQUIRED_PROTOTYPE);

    var js = /scriptaculous\.js(\?.*)?$/;
    $$('script[src]').findAll(function(s) {
      return s.src.match(js);
    }).each(function(s) {
      var path = s.src.replace(js, ''),
      includes = s.src.match(/\?.*load=([a-z,]*)/);
      (includes ? includes[1] : 'builder,effects,dragdrop,controls,slider,sound').split(',').each(
       function(include) { Scriptaculous.require(path+include+'.js') });
    });
  }
};

Scriptaculous.load();
// script.aculo.us effects.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable

// DO NOT UPGRADE WITHOUT CHECKING THAT THINGS ARE PROPERLY USING Element.method(element, args)
// XXX - THIS FILE HAS BEEN MODIFIED IN PROTOSITE.

String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect, options) {
    element = $(element);
    effect  = (effect || 'appear').toLowerCase();

    return Effect[ Effect.PAIRS[ effect ][ element.visible() ? 1 : 0 ] ](element, Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, options || {}));
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: Element.getOpacity(this.element) || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    Element.setOpacity(this.element, position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    Element.makePositioned(this.element);
    this.originalLeft = parseFloat(Element.getStyle(this.element, 'left') || '0');
    this.originalTop  = parseFloat(Element.getStyle(this.element, 'top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    Element.setStyle(this.element, {
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = Element.getInlineOpacity(element);
  var options = Object.extend({
    from: Element.getOpacity(element) || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      Element.hide(effect.element);
      Element.setStyle(effect.element, {opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);
// Additional Scriptaculous transitions
Effect.Transitions.elastic = function(pos) {
  return -1*Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
};
Effect.Transitions.swingFromTo = function(pos) {
  var s = 1.70158;
  if ((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s));
  return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
};
Effect.Transitions.swingFrom = function(pos) {
  var s = 1.70158;
  return pos*pos*((s+1)*pos - s);
};
Effect.Transitions.swingTo = function(pos) {
  var s = 1.70158;
  return (pos-=1)*pos*((s+1)*pos + s) + 1;
};
Effect.Transitions.bounce = function(pos) {
  if (pos < (1/2.75)) {
    return (7.5625*pos*pos);
  } else if (pos < (2/2.75)) {
    return (7.5625*(pos-=(1.5/2.75))*pos + .75);
  } else if (pos < (2.5/2.75)) {
    return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
  } else {
    return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
  }
};
Effect.Transitions.bouncePast = function(pos) {
  if (pos < (1/2.75)) {
    return (7.5625*pos*pos);
  } else if (pos < (2/2.75)) {
    return 2 - (7.5625*(pos-=(1.5/2.75))*pos + .75);
  } else if (pos < (2.5/2.75)) {
    return 2 - (7.5625*(pos-=(2.25/2.75))*pos + .9375);
  } else {
    return 2 - (7.5625*(pos-=(2.625/2.75))*pos + .984375);
  }
};
Effect.Transitions.easeFromTo = function(pos) {
  if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
  return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
};
Effect.Transitions.easeFrom = function(pos) {
  return Math.pow(pos,4);
};
Effect.Transitions.easeTo = function(pos) {
  return Math.pow(pos,0.33);
};
// script.aculo.us dragdrop.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if(Object.isUndefined(Effect))
  throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

    // cache containers
    if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }

    if(options.accept) options.accept = [options.accept].flatten();

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },

  findDeepestChild: function(drops) {
    deepest = drops[0];

    for (i = 1; i < drops.length; ++i)
      if (Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];

    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if(drop.tree) {
      containmentNode = element.treeNode;
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) { return containmentNode == c });
  },

  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ((!drop._containers) ||
        this.isContained(element, drop)) &&
      ((!drop.accept) ||
        (Element.classNames(element).detect(
          function(v) { return drop.accept.include(v) } ) )) &&
      Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];

    this.drops.each( function(drop) {
      if(Droppables.isAffected(point, element, drop))
        affected.push(drop);
    });

    if(affected.length>0)
      drop = Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));

      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event);
        return true;
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};

var Draggables = {
  drags: [],
  observers: [],

  register: function(draggable, doc) {
    doc = doc || document;
    if(!doc.__dragCount) {
      this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress  = this.keyPress.bindAsEventListener(this);

      Event.observe(doc, "mouseup", this.eventMouseUp);
      Event.observe(doc, "mousemove", this.eventMouseMove);
      Event.observe(doc, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
    doc.__dragCount = this.drags.length;
  },

  unregister: function(draggable, doc) {
    doc = doc || document;
    this.drags = this.drags.reject(function(d) { return d==draggable });
    doc.__dragCount = this.drags.length;
    if(doc.__dragCount == 0) {
      Event.stopObserving(doc, "mouseup", this.eventMouseUp);
      Event.stopObserving(doc, "mousemove", this.eventMouseMove);
      Event.stopObserving(doc, "keypress", this.eventKeypress);
    }
  },

  activate: function(draggable) {
    if(draggable.options.delay) {
      this._timeout = setTimeout(function() {
        Draggables._timeout = null;
        window.focus();
        Draggables.activeDraggable = draggable;
      }.bind(this), draggable.options.delay);
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },

  deactivate: function() {
    this.activeDraggable = null;
  },

  updateDrag: function(event) {
    if(!this.activeDraggable) return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
    this._lastPointer = pointer;

    this.activeDraggable.updateDrag(event, pointer);
  },

  endDrag: function(event) {
    if(this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if(!this.activeDraggable) return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },

  keyPress: function(event) {
    if(this.activeDraggable)
      this.activeDraggable.keyPress(event);
  },

  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },

  removeObserver: function(element) {  // element instead of observer fixes mem leaks
    this.observers = this.observers.reject( function(o) { return o.element==element });
    this._cacheObserverCallbacks();
  },

  notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
    if(this[eventName+'Count'] > 0)
      this.observers.each( function(o) {
        if(o[eventName]) o[eventName](eventName, draggable, event);
      });
    if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
  },

  _cacheObserverCallbacks: function() {
    ['onStart','onEnd','onDrag'].each( function(eventName) {
      Draggables[eventName+'Count'] = Draggables.observers.select(
        function(o) { return o[eventName]; }
      ).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
        new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
          queue: {scope:'_draggable', position:'end'}
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity,
          queue: {scope:'_draggable', position:'end'},
          afterFinish: function(){
            Draggable._dragging[element] = false
          }
        });
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };

    if(!arguments[1] || Object.isUndefined(arguments[1].endeffect))
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7});
        }
      });

    var options = Object.extend(defaults, arguments[1] || { });

    this.element = $(element);

    if(options.handle && Object.isString(options.handle))
      this.handle = this.element.down('.'+options.handle, 0);

    if(!this.handle) this.handle = $(options.handle);
    if(!this.handle) this.handle = this.element;

    if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE

    this.options  = options;
    this.dragging = false;

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);

    Draggables.register(this, this.options['document']);
  },

  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },

  currentDelta: function() {
    return([
      parseInt(Element.getStyle(this.element,'left') || '0'),
      parseInt(Element.getStyle(this.element,'top') || '0')]);
  },

  initDrag: function(event) {
    if(!Object.isUndefined(Draggable._dragging[this.element]) &&
      Draggable._dragging[this.element]) return;
    if(Event.isLeftClick(event)) {
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event);
      if((tag_name = src.tagName.toUpperCase()) && (
        tag_name=='INPUT' ||
        tag_name=='SELECT' ||
        tag_name=='OPTION' ||
        tag_name=='BUTTON' ||
        tag_name=='TEXTAREA')) return;

      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      var pos     = Element.cumulativeOffset(this.element);
      this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });

      Draggables.activate(this);
      Event.stop(event);
    }
  },

  startDrag: function(event) {
    this.dragging = true;
    if(!this.delta)
      this.delta = this.currentDelta();

    if(this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
      this.element.style.zIndex = this.options.zindex;
    }

    if(this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (Element.getStyle(this.element, 'position') == 'absolute');
      if (!this._originallyAbsolute)
        Position.absolutize(this.element);
      this.element.parentNode.insertBefore(this._clone, this.element);
    }

    if(this.options.scroll) {
      if (this.options.scroll == window) {
        var where = this._getWindowScroll(this.options.scroll);
        this.originalScrollLeft = where.left;
        this.originalScrollTop = where.top;
      } else {
        this.originalScrollLeft = this.options.scroll.scrollLeft;
        this.originalScrollTop = this.options.scroll.scrollTop;
      }
    }

    Draggables.notify('onStart', this, event);

    if(this.options.starteffect) this.options.starteffect(this.element);
  },

  updateDrag: function(event, pointer) {
    if(!this.dragging) this.startDrag(event);

    if(!this.options.quiet){
      Position.prepare();
      Droppables.show(pointer, this.element);
    }

    Draggables.notify('onDrag', this, event);

    this.draw(pointer);
    if(this.options.change) this.options.change(this);

    if(this.options.scroll) {
      this.stopScrolling();

      var p;
      if (this.options.scroll == window) {
        with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
      } else {
        p = Position.page(this.options.scroll).toArray();
        p[0] += this.options.scroll.scrollLeft + Position.deltaX;
        p[1] += this.options.scroll.scrollTop + Position.deltaY;
        p.push(p[0]+this.options.scroll.offsetWidth);
        p.push(p[1]+this.options.scroll.offsetHeight);
      }
      var speed = [0,0];
      if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
      if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
      if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
      if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
      this.startScrolling(speed);
    }

    // fix AppleWebKit rendering
    if(Prototype.Browser.WebKit) window.scrollBy(0,0);

    Event.stop(event);
  },

  finishDrag: function(event, success) {
    this.dragging = false;

    if(this.options.quiet){
      Position.prepare();
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      Droppables.show(pointer, this.element);
    }

    if(this.options.ghosting) {
      if (!this._originallyAbsolute)
        Position.relativize(this.element);
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false;
    if(success) {
      dropped = Droppables.fire(event, this.element);
      if (!dropped) dropped = false;
    }
    if(dropped && this.options.onDropped) this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if(revert && Object.isFunction(revert)) revert = revert(this.element);

    var d = this.currentDelta();
    if(revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure')
        this.options.reverteffect(this.element,
          d[1]-this.delta[1], d[0]-this.delta[0]);
    } else {
      this.delta = d;
    }

    if(this.options.zindex)
      this.element.style.zIndex = this.originalZ;

    if(this.options.endeffect)
      this.options.endeffect(this.element);

    Draggables.deactivate(this);
    Droppables.reset();
  },

  keyPress: function(event) {
    if(event.keyCode!=Event.KEY_ESC) return;
    this.finishDrag(event, false);
    Event.stop(event);
  },

  endDrag: function(event) {
    if(!this.dragging) return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },

  draw: function(point) {
    var pos = Element.cumulativeOffset(this.element);
    if(this.options.ghosting) {
      var r   = Position.realOffset(this.element);
      pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;
    }

    var d = this.currentDelta();
    pos[0] -= d[0]; pos[1] -= d[1];

    if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
      pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
      pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
    }

    var p = [0,1].map(function(i){
      return (point[i]-pos[i]-this.offset[i])
    }.bind(this));

    if(this.options.snap) {
      if(Object.isFunction(this.options.snap)) {
        p = this.options.snap(p[0],p[1],this);
      } else {
      if(Object.isArray(this.options.snap)) {
        p = p.map( function(v, i) {
          return (v/this.options.snap[i]).round()*this.options.snap[i] }.bind(this));
      } else {
        p = p.map( function(v) {
          return (v/this.options.snap).round()*this.options.snap }.bind(this));
      }
    }}

    var style = this.element.style;
    if((!this.options.constraint) || (this.options.constraint=='horizontal'))
      style.left = p[0] + "px";
    if((!this.options.constraint) || (this.options.constraint=='vertical'))
      style.top  = p[1] + "px";

    if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
  },

  stopScrolling: function() {
    if(this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },

  startScrolling: function(speed) {
    if(!(speed[0] || speed[1])) return;
    this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },

  scroll: function() {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if(this.options.scroll == window) {
      with (this._getWindowScroll(this.options.scroll)) {
        if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
          var d = delta / 1000;
          this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
        }
      }
    } else {
      this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
      this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
    }

    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
      if (Draggables._lastScrollPointer[0] < 0)
        Draggables._lastScrollPointer[0] = 0;
      if (Draggables._lastScrollPointer[1] < 0)
        Draggables._lastScrollPointer[1] = 0;
      this.draw(Draggables._lastScrollPointer);
    }

    if(this.options.change) this.options.change(this);
  },

  _getWindowScroll: function(w) {
    var T, L, W, H;
    with (w.document) {
      if (w.document.documentElement && documentElement.scrollTop) {
        T = documentElement.scrollTop;
        L = documentElement.scrollLeft;
      } else if (w.document.body) {
        T = body.scrollTop;
        L = body.scrollLeft;
      }
      if (w.innerWidth) {
        W = w.innerWidth;
        H = w.innerHeight;
      } else if (w.document.documentElement && documentElement.clientWidth) {
        W = documentElement.clientWidth;
        H = documentElement.clientHeight;
      } else {
        W = body.offsetWidth;
        H = body.offsetHeight;
      }
    }
    return { top: T, left: L, width: W, height: H };
  }
});

Draggable._dragging = { };

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function() {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element)
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

  sortables: { },

  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {
      if(element.id && Sortable.sortables[element.id]) return element;
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if(!element) return;
    return Sortable.sortables[element.id];
  },

  destroy: function(element){
    element = $(element);
    var s = Sortable.sortables[element.id];

    if(s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d){ Droppables.remove(d) });
      s.draggables.invoke('destroy');

      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({
      element:     element,
      tag:         'li',       // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree:        false,
      treeTag:     'ul',
      overlap:     'vertical', // one of 'vertical', 'horizontal'
      constraint:  'vertical', // one of 'vertical', 'horizontal', false
      containment: element,    // also takes array of elements (or id's); or false
      handle:      false,      // or a CSS class
      only:        false,
      delay:       0,
      hoverclass:  null,
      ghosting:    false,
      quiet:       false,
      scroll:      false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format:      this.SERIALIZE_RULE,

      // these take arrays of elements or ids and can be
      // used for better initialization performance
      elements:    false,
      handles:     false,

      onChange:    Prototype.emptyFunction,
      onUpdate:    Prototype.emptyFunction
    }, arguments[1] || { });

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      document:    null,
      revert:      true,
      quiet:       options.quiet,
      scroll:      options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay:       options.delay,
      ghosting:    options.ghosting,
      constraint:  options.constraint,
      handle:      options.handle };

    if(options.starteffect)
      options_for_draggable.starteffect = options.starteffect;

    if(options.document)
      options_for_draggable.document = options.document;

    if(options.reverteffect)
      options_for_draggable.reverteffect = options.reverteffect;
    else
      if(options.ghosting) options_for_draggable.reverteffect = function(element) {
        element.style.top  = 0;
        element.style.left = 0;
      };

    if(options.endeffect)
      options_for_draggable.endeffect = options.endeffect;

    if(options.zindex)
      options_for_draggable.zindex = options.zindex;

    // build options for the droppables
    var options_for_droppable = {
      overlap:     options.overlap,
      containment: options.containment,
      tree:        options.tree,
      hoverclass:  options.hoverclass,
      onHover:     Sortable.onHover
    };

    var options_for_tree = {
      onHover:      Sortable.onEmptyHover,
      overlap:      options.overlap,
      containment:  options.containment,
      hoverclass:   options.hoverclass,
      tree:         options.tree
    };

    // fix for gecko engine
    Element.cleanWhitespace(element);

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if(options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each( function(e,i) {
      var handle = options.handles ? $(options.handles[i]) :
        (options.handle ? $(e).select('.' + options.handle)[0] : e);
      options.draggables.push(
        new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
      Droppables.add(e, options_for_droppable);
      if(options.tree) e.treeNode = element;
      options.droppables.push(e);
    });

    if(options.tree) {
      (Sortable.findTreeElements(element, options) || []).each( function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[Element.identify(element)] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.tag);
  },

  findTreeElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if(Element.isParent(dropon, element)) return;

    if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
      return;
    } else if(overlap>0.5) {
      Sortable.mark(dropon, 'before');
      if(dropon.previousSibling != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if(nextElement != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },

  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);

    if(!Element.isParent(dropon, element)) {
      var index;

      var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
      var child = null;

      if(children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize (children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }

      dropon.insertBefore(element, child);

      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if(Sortable._marker) Sortable._marker.hide();
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if(sortable && !sortable.ghosting) return;

    if(!Sortable._marker) {
      Sortable._marker =
        ($('dropmarker') || Element.extend(document.createElement('DIV'))).
          hide().addClassName('dropmarker').setStyle({position:'absolute'});
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = dropon.cumulativeOffset();
    Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});

    if(position=='after')
      if(sortable.overlap == 'horizontal')
        Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
      else
        Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});

    Sortable._marker.show();
  },

  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];

    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) continue;

      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };

      /* Get the element containing the children and recurse over it */
      if (child.container)
        this._tree(child.container, options, child);

      parent.children.push (child);
    }

    return parent;
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || { });

    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };

    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || { });

    return $(this.findElements(element, options) || []).map( function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || { });

    var nodeMap = { };
    this.findElements(element, options).each( function(n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });

    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },

  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || { });
    var name = encodeURIComponent(
      (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map( function (item) {
        return [name + Sortable._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map( function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) return false;
  if (child.parentNode == element) return true;
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
  if(!element.hasChildNodes()) return null;
  tagName = tagName.toUpperCase();
  if(only) only = [only].flatten();
  var elements = [];
  $A(element.childNodes).each( function(e) {
    if(e.tagName && e.tagName.toUpperCase()==tagName &&
      (!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
        elements.push(e);
    if(recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if(grandchildren) elements.push(grandchildren);
    }
  });

  return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
  return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};
// script.aculo.us controls.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2010 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2010 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least,
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most
// useful when one of the tokens is \n (a newline), as it
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer =
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector'
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&
          ret.length < instance.options.choices ; i++) {

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase()) :
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) {
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" +
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars &&
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ?
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML.unescapeHTML();
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer,
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element);
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});
// script.aculo.us slider.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Marty Haught, Thomas Fuchs
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if (!Control) var Control = { };

// options:
//  axis: 'vertical', or 'horizontal' (default)
//
// callbacks:
//  onChange(value)
//  onSlide(value)
Control.Slider = Class.create({
  initialize: function(handle, track, options) {
    var slider = this;

    if (Object.isArray(handle)) {
      this.handles = handle.collect( function(e) { return $(e) });
    } else {
      this.handles = [$(handle)];
    }

    this.track   = $(track);
    this.options = options || { };

    this.axis      = this.options.axis || 'horizontal';
    this.increment = this.options.increment || 1;
    this.step      = parseInt(this.options.step || '1');
    this.range     = this.options.range || $R(0,1);

    this.value     = 0; // assure backwards compat
    this.values    = this.handles.map( function() { return 0 });
    this.spans     = this.options.spans ? this.options.spans.map(function(s){ return $(s) }) : false;
    this.options.startSpan = $(this.options.startSpan || null);
    this.options.endSpan   = $(this.options.endSpan || null);

    this.restricted = this.options.restricted || false;

    this.maximum   = this.options.maximum || this.range.end;
    this.minimum   = this.options.minimum || this.range.start;

    // Will be used to align the handle onto the track, if necessary
    this.alignX = parseInt(this.options.alignX || '0');
    this.alignY = parseInt(this.options.alignY || '0');

    this.trackLength = this.maximumOffset() - this.minimumOffset();

    this.handleLength = this.isVertical() ?
      (this.handles[0].offsetHeight != 0 ?
        this.handles[0].offsetHeight : this.handles[0].style.height.replace(/px$/,"")) :
      (this.handles[0].offsetWidth != 0 ? this.handles[0].offsetWidth :
        this.handles[0].style.width.replace(/px$/,""));

    this.active   = false;
    this.dragging = false;
    this.disabled = false;

    if (this.options.disabled) this.setDisabled();

    // Allowed values array
    this.allowedValues = this.options.values ? this.options.values.sortBy(Prototype.K) : false;
    if (this.allowedValues) {
      this.minimum = this.allowedValues.min();
      this.maximum = this.allowedValues.max();
    }

    this.eventMouseDown = this.startDrag.bindAsEventListener(this);
    this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
    this.eventMouseMove = this.update.bindAsEventListener(this);

    // Initialize handles in reverse (make sure first handle is active)
    this.handles.each( function(h,i) {
      i = slider.handles.length-1-i;
      slider.setValue(parseFloat(
        (Object.isArray(slider.options.sliderValue) ?
          slider.options.sliderValue[i] : slider.options.sliderValue) ||
         slider.range.start), i);
      h.makePositioned().observe("mousedown", slider.eventMouseDown);
    });

    this.track.observe("mousedown", this.eventMouseDown);
    document.observe("mouseup", this.eventMouseUp);
    document.observe("mousemove", this.eventMouseMove);

    this.initialized = true;
  },
  dispose: function() {
    var slider = this;
    Event.stopObserving(this.track, "mousedown", this.eventMouseDown);
    Event.stopObserving(document, "mouseup", this.eventMouseUp);
    Event.stopObserving(document, "mousemove", this.eventMouseMove);
    this.handles.each( function(h) {
      Event.stopObserving(h, "mousedown", slider.eventMouseDown);
    });
  },
  setDisabled: function(){
    this.disabled = true;
  },
  setEnabled: function(){
    this.disabled = false;
  },
  getNearestValue: function(value){
    if (this.allowedValues){
      if (value >= this.allowedValues.max()) return(this.allowedValues.max());
      if (value <= this.allowedValues.min()) return(this.allowedValues.min());

      var offset = Math.abs(this.allowedValues[0] - value);
      var newValue = this.allowedValues[0];
      this.allowedValues.each( function(v) {
        var currentOffset = Math.abs(v - value);
        if (currentOffset <= offset){
          newValue = v;
          offset = currentOffset;
        }
      });
      return newValue;
    }
    if (value > this.range.end) return this.range.end;
    if (value < this.range.start) return this.range.start;
    return value;
  },
  setValue: function(sliderValue, handleIdx){
    if (!this.active) {
      this.activeHandleIdx = handleIdx || 0;
      this.activeHandle    = this.handles[this.activeHandleIdx];
      this.updateStyles();
    }
    handleIdx = handleIdx || this.activeHandleIdx || 0;
    if (this.initialized && this.restricted) {
      if ((handleIdx>0) && (sliderValue<this.values[handleIdx-1]))
        sliderValue = this.values[handleIdx-1];
      if ((handleIdx < (this.handles.length-1)) && (sliderValue>this.values[handleIdx+1]))
        sliderValue = this.values[handleIdx+1];
    }
    sliderValue = this.getNearestValue(sliderValue);
    this.values[handleIdx] = sliderValue;
    this.value = this.values[0]; // assure backwards compat

    this.handles[handleIdx].style[this.isVertical() ? 'top' : 'left'] =
      this.translateToPx(sliderValue);

    this.drawSpans();
    if (!this.dragging || !this.event) this.updateFinished();
  },
  setValueBy: function(delta, handleIdx) {
    this.setValue(this.values[handleIdx || this.activeHandleIdx || 0] + delta,
      handleIdx || this.activeHandleIdx || 0);
  },
  translateToPx: function(value) {
    return Math.round(
      ((this.trackLength-this.handleLength)/(this.range.end-this.range.start)) *
      (value - this.range.start)) + "px";
  },
  translateToValue: function(offset) {
    return ((offset/(this.trackLength-this.handleLength) *
      (this.range.end-this.range.start)) + this.range.start);
  },
  getRange: function(range) {
    var v = this.values.sortBy(Prototype.K);
    range = range || 0;
    return $R(v[range],v[range+1]);
  },
  minimumOffset: function(){
    return(this.isVertical() ? this.alignY : this.alignX);
  },
  maximumOffset: function(){
    return(this.isVertical() ?
      (this.track.offsetHeight != 0 ? this.track.offsetHeight :
        this.track.style.height.replace(/px$/,"")) - this.alignY :
      (this.track.offsetWidth != 0 ? this.track.offsetWidth :
        this.track.style.width.replace(/px$/,"")) - this.alignX);
  },
  isVertical:  function(){
    return (this.axis == 'vertical');
  },
  drawSpans: function() {
    var slider = this;
    if (this.spans)
      $R(0, this.spans.length-1).each(function(r) { slider.setSpan(slider.spans[r], slider.getRange(r)) });
    if (this.options.startSpan)
      this.setSpan(this.options.startSpan,
        $R(0, this.values.length>1 ? this.getRange(0).min() : this.value ));
    if (this.options.endSpan)
      this.setSpan(this.options.endSpan,
        $R(this.values.length>1 ? this.getRange(this.spans.length-1).max() : this.value, this.maximum));
  },
  setSpan: function(span, range) {
    if (this.isVertical()) {
      span.style.top = this.translateToPx(range.start);
      span.style.height = this.translateToPx(range.end - range.start + this.range.start);
    } else {
      span.style.left = this.translateToPx(range.start);
      span.style.width = this.translateToPx(range.end - range.start + this.range.start);
    }
  },
  updateStyles: function() {
    this.handles.each( function(h){ Element.removeClassName(h, 'selected') });
    Element.addClassName(this.activeHandle, 'selected');
  },
  startDrag: function(event) {
    if (Event.isLeftClick(event)) {
      if (!this.disabled){
        this.active = true;

        var handle = Event.element(event);
        var pointer  = [Event.pointerX(event), Event.pointerY(event)];
        var track = handle;
        if (track==this.track) {
          var offsets  = this.track.cumulativeOffset();
          this.event = event;
          this.setValue(this.translateToValue(
           (this.isVertical() ? pointer[1]-offsets[1] : pointer[0]-offsets[0])-(this.handleLength/2)
          ));
          var offsets  = this.activeHandle.cumulativeOffset();
          this.offsetX = (pointer[0] - offsets[0]);
          this.offsetY = (pointer[1] - offsets[1]);
        } else {
          // find the handle (prevents issues with Safari)
          while((this.handles.indexOf(handle) == -1) && handle.parentNode)
            handle = handle.parentNode;

          if (this.handles.indexOf(handle)!=-1) {
            this.activeHandle    = handle;
            this.activeHandleIdx = this.handles.indexOf(this.activeHandle);
            this.updateStyles();

            var offsets  = this.activeHandle.cumulativeOffset();
            this.offsetX = (pointer[0] - offsets[0]);
            this.offsetY = (pointer[1] - offsets[1]);
          }
        }
      }
      Event.stop(event);
    }
  },
  update: function(event) {
   if (this.active) {
      if (!this.dragging) this.dragging = true;
      this.draw(event);
      if (Prototype.Browser.WebKit) window.scrollBy(0,0);
      Event.stop(event);
   }
  },
  draw: function(event) {
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    var offsets = this.track.cumulativeOffset();
    pointer[0] -= this.offsetX + offsets[0];
    pointer[1] -= this.offsetY + offsets[1];
    this.event = event;
    this.setValue(this.translateToValue( this.isVertical() ? pointer[1] : pointer[0] ));
    if (this.initialized && this.options.onSlide)
      this.options.onSlide(this.values.length>1 ? this.values : this.value, this);
  },
  endDrag: function(event) {
    if (this.active && this.dragging) {
      this.finishDrag(event, true);
      Event.stop(event);
    }
    this.active = false;
    this.dragging = false;
  },
  finishDrag: function(event, success) {
    this.active = false;
    this.dragging = false;
    this.updateFinished();
  },
  updateFinished: function() {
    if (this.initialized && this.options.onChange)
      this.options.onChange(this.values.length>1 ? this.values : this.value, this);
    this.event = null;
  }
});
//  Lightview 2.5.6 - 12-01-2011
//  Copyright (c) 2008-2011 Nick Stakenburg (http://www.nickstakenburg.com)
//
//  Licensed under a Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 Unported License
//  http://creativecommons.org/licenses/by-nc-nd/3.0/

//  More information on this project:
//  http://www.nickstakenburg.com/projects/lightview/

var Lightview = {
  Version: '2.5.6',

  // Configuration
  options: {
    backgroundColor: '#666666',                            // Background color of the view
    border: 9,                                            // Size of the border
    buttons: {
      opacity: {                                           // Opacity of inner buttons
        disabled: 0.4,
        normal: 0.75,
        hover: 1
      },
      side: { display: true },                             // Toggle side buttons
      innerPreviousNext: { display: true },                // Toggle the inner previous and next button
      slideshow: { display: true },                        // Toggle slideshow button
      topclose: { side: 'right' }                          // 'right' or 'left'
    },
    controller: {                                          // The controller is used on sets
      backgroundColor: '#4d4d4d',
      border: 6,
      buttons: {
        innerPreviousNext: true,
        side: false
      },
      margin: 18,
      opacity: 0.7,
      radius: 9,
      setNumberTemplate: '#{position} of #{total}'
    },
    cyclic: false,                                         // Makes galleries cyclic, no end/begin
    images: '/images/protosite/lightview/',                // The directory of the images, from this file
    imgNumberTemplate: 'Image #{position} of #{total}',    // Want a different language? change it here
    keyboard: true,                                        // Toggle keyboard buttons
    menubarPadding: 6,                                     // Space between menubar and content in px
    overlay: {                                             // Overlay
      background: '#000',                                  // Background color, Mac Firefox & Mac Safari use overlay.png
      close: true,
      opacity: 0.85,
      display: true
    },
    preloadHover: false,                                   // Preload images on mouseover
    radius: 6,                                            // Corner radius of the border
    removeTitles: true,                                    // Set to false if you want to keep title attributes intact
    resizeDuration: 0.45,                                  // The duration of the resize effect in seconds
    slideshowDelay: 5,                                     // Delay in seconds before showing the next slide
    titleSplit: '::',                                      // The characters you want to split title with
    transition: function(pos) {                            // Or your own transition
      return ((pos/=0.5) < 1 ? 0.5 * Math.pow(pos, 4) :
        -0.5 * ((pos-=2) * Math.pow(pos,3) - 2));
    },
    viewport: true,                                        // Stay within the viewport, true is recommended
    zIndex: 15000,                                          // zIndex of #lightview, #overlay is this -1

    startDimensions: {                                     // Dimensions Lightview starts at
      width: 100,
      height: 100
    },
    closeDimensions: {                                     // Modify if you've changed the close button images
      large: { width: 77, height: 22 },
      small: { width: 25, height: 22 }
    },
    sideDimensions: {                                      // Modify if you've changed the side button images
      width: 16,
      height: 22
    },

    defaultOptions: {                                      // Default options for each type of view
      image: {
        menubar: 'bottom',
        closeButton: 'large'
      },
      gallery: {
        menubar: 'bottom',
        closeButton: 'large'
      },
      ajax:   {
        width: 400,
        height: 300,
        menubar: 'top',
        closeButton: 'small',
        overflow: 'auto'
      },
      iframe: {
        width: 400,
        height: 300,
        menubar: 'top',
        scrolling: true,
        closeButton: 'small'
      },
      inline: {
        width: 400,
        height: 300,
        menubar: 'top',
        closeButton: 'small',
        overflow: 'auto'
      },
      flash: {
        width: 400,
        height: 300,
        menubar: 'bottom',
        closeButton: 'large'
      },
      quicktime: {
        width: 480,
        height: 220,
        autoplay: true,
        controls: true,
        closeButton: 'large'
      }
    }
  },
  classids: {
    quicktime: 'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
    flash: 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'
  },
  codebases: {
    quicktime: 'http://www.apple.com/qtactivex/qtplugin.cab#version=7,5,5,0',
    flash: 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,115,0'
  },
  errors: {
    requiresPlugin: "<div class='message'> The content your are attempting to view requires the <span class='type'>#{type}</span> plugin.</div><div class='pluginspage'><p>Please download and install the required plugin from:</p><a href='#{pluginspage}' target='_blank'>#{pluginspage}</a></div>"
  },
  mimetypes: {
    quicktime: 'video/quicktime',
    flash: 'application/x-shockwave-flash'
  },
  pluginspages: {
    quicktime: 'http://www.apple.com/quicktime/download',
    flash: 'http://www.adobe.com/go/getflashplayer'
  },
  // used with auto detection
  typeExtensions: {
    flash: 'swf',
    image: 'bmp gif jpeg jpg png',
    iframe: 'asp aspx cgi cfm htm html jsp php pl php3 php4 php5 phtml rb rhtml shtml txt',
    quicktime: 'avi mov mpg mpeg movie'
  }
};

(function () {
	function pixelClone(a) {
		var b = {};
		Object.keys(a).each(function (c) {
			b[c] = a[c] + "px"
		});
		return b
	}
	var l = !!document.createElement("canvas").getContext,
	BROWSER_IS_IE_LT7 = Prototype.Browser.IE &&
	function (a) {
		var b = (new RegExp("MSIE ([\\d.]+)")).exec(a);
		return b ? parseFloat(b[1]) : -1
	} (navigator.userAgent) < 7,
	BROWSER_IS_WEBKIT_419 = Prototype.Browser.WebKit && !document.evaluate,
	BROWSER_IS_FIREFOX_LT3 = Prototype.Browser.Gecko &&
	function (a) {
		var b = navigator.userAgent.match(/rv\:(\d+)/);
		return b && parseFloat(b[1]) < 2
	} (navigator.userAgent),
	FIX_OVERLAY_WITH_PNG = !!navigator.userAgent.match(/mac/i) && (BROWSER_IS_WEBKIT_419 || BROWSER_IS_FIREFOX_LT3);
	Object.extend(Lightview, {
		REQUIRED_Prototype: "1.7",
		REQUIRED_Scriptaculous: "1.8.3",
		queue: {
			position: "end",
			scope: "lightview"
		},
		require: function (a) {
			if (typeof window[a] == "undefined" || this.convertVersionString(window[a].Version) < this.convertVersionString(this["REQUIRED_" + a])) {
				throw "Lightview requires " + a + " >= " + this["REQUIRED_" + a]
			}
		},
		convertVersionString: function (a) {
			var b = a.replace(/_.*|\./g, "");
			b = parseInt(b + "0".times(4 - b.length));
			return a.indexOf("_") > -1 ? b - 1 : b
		},
		load: function () {
			this.require("Prototype"),
			!!window.Effect && !window.Scriptaculous && this.require("Scriptaculous");
			if (/^(https?:\/\/|\/)/.test(this.options.images)) {
				this.images = this.options.images
			} else {
				var a = /lightview(?:-[\w\d.]+)?\.js(.*)/;
				this.images = (($$("script[src]").find(function (b) {
					return b.src.match(a)
				}) || {}).src || "").replace(a, "") + this.options.images
			}
			l || (document.documentMode < 8 || document.namespaces.ns_vml ? document.observe("dom:loaded", function () {
				var a = document.createStyleSheet();
				a.cssText = "ns_vml\\:*{behavior:url(#default#VML)}"
			}) : document.namespaces.add("ns_vml", "urn:schemas-microsoft-com:vml", "#default#VML"))
		},
		start: function () {
			this.radius = this.options.radius,
			this.border = this.radius > this.options.border ? this.radius: this.options.border,
			this.closeDimensions = this.options.closeDimensions,
			this.sideDimensions = this.options.sideDimensions,
			this.build()
		}
	}),
	Object.extend(Lightview, {
		_lightviewLoadedEvents: 14,
		_lightviewLoadedEvent: function () {
			var a = arguments.callee;
			a.counter++,
			a.counter == this._lightviewLoadedEvents && Event.fire.defer(document.body, "lightview:loaded")
		}
	}),
	Lightview._lightviewLoadedEvent.counter = 0,
	Object.extend(Lightview, {
		build: function () {
			this.lightview = new Element("div", {
				id: "lightview"
			});
			var a, b, c = pixelClone(this.sideDimensions);
			BROWSER_IS_WEBKIT_419 && (this.lightview.hide = function () {
				this.setStyle("left:-9500px;top:-9500px;visibility:hidden;");
				return this
			},
			this.lightview.show = function () {
				this.setStyle("visibility:visible");
				return this
			},
			this.lightview.visible = function () {
				return this.getStyle("visibility") == "visible" && parseFloat(this.getStyle("top").replace("px", "")) > -9500
			}),
			$(document.body).insert(this.overlay = (new Element("div", {
				id: "lv_overlay"
			})).setStyle({
				zIndex: this.options.zIndex - 1,
				position: !BROWSER_IS_FIREFOX_LT3 && !BROWSER_IS_IE_LT7 ? "fixed": "absolute",
				background: FIX_OVERLAY_WITH_PNG ? "url(" + this.images + "overlay.png) top left repeat": this.options.overlay.background
			}).setOpacity(FIX_OVERLAY_WITH_PNG ? 1 : this.options.overlay.opacity).hide()).insert(this.lightview.setStyle({
				zIndex: this.options.zIndex,
				top: "-9500px",
				left: "-9500px"
			}).setOpacity(0).insert(this.container = (new Element("div", {
				className: "lv-container"
			})).insert(this.sideButtons = (new Element("ul", {
				className: "lv-sides"
			})).insert(this.prevSide = (new Element("li", {
				className: "lv-prev-side"
			})).setStyle(b = Object.extend({
				marginLeft: -1 * this.sideDimensions.width + "px"
			},
			c)).insert(this.prevButtonImage = (new Element("div", {
				className: "lv-wrapper"
			})).setStyle(Object.extend({
				marginLeft: this.sideDimensions.width + "px"
			},
			c)).insert(new Element("div", {
				className: "lv-button"
			})))).insert(this.nextSide = (new Element("li", {
				className: "lv-next-side"
			})).setStyle(Object.extend({
				marginRight: -1 * this.sideDimensions.width + "px"
			},
			c)).insert(this.nextButtonImage = (new Element("div", {
				className: "lv-wrapper"
			})).setStyle(b).insert(new Element("div", {
				className: "lv-button"
			}))))).insert(this.topButtons = (new Element("div", {
				className: "lv-top-buttons"
			})).insert(this.topcloseButtonImage = (new Element("div", {
				className: "lv-wrapper lv-topclose-button-image"
			})).insert(this.topcloseButton = new Element("div", {
				className: "lv-button"
			})))).insert((new Element("ul", {
				className: "lv-frames"
			})).insert((new Element("li", {
				className: "lv-frame lv-frame-top"
			})).insert(a = (new Element("div", {
				className: "lv-liquid"
			})).setStyle({
				height: this.border + "px"
			}).insert((new Element("ul", {
				className: "lv-half lv-half-left"
			})).insert((new Element("li", {
				className: "lv-corner-wrapper"
			})).insert(new Element("div", {
				className: "lv-corner"
			})).insert((new Element("div", {
				className: "lv-fill"
			})).setStyle({
				left: this.border + "px"
			})))).insert(new Element("div", {
				className: "lv-filler"
			})).insert((new Element("ul", {
				className: "lv-half lv-half-right"
			})).insert((new Element("li", {
				className: "lv-corner-wrapper"
			})).setStyle("margin-top: " + -1 * this.border + "px").insert(new Element("div", {
				className: "lv-corner"
			})).insert((new Element("div", {
				className: "lv-fill"
			})).setStyle("left: " + -1 * this.border + "px")))))).insert(this.resizeCenter = (new Element("li", {
				className: "lv-center"
			})).setStyle("height: " + (150 - this.border) + "px").insert((new Element("div", {
				className: "lv-wrap-up"
			})).insert((new Element("div", {
				className: "lv-wrap-down"
			})).setStyle("margin-top: " + this.border + "px").insert(this.center = (new Element("div", {
				className: "lv-wrap-center"
			})).setOpacity(0).setStyle("padding: 0 " + this.border + "px").insert(this.contentTop = new Element("div", {
				className: "lv-content-top lv-fill"
			})).insert(this.menubar = (new Element("div", {
				className: "lv-menu-bar clearfix"
			})).insert(this.closeButton = (new Element("div", {
				className: "lv-button lv-close"
			})).setStyle(pixelClone(this.options.closeDimensions.large)).setStyle({
				background: this.options.backgroundColor
			}).setOpacity(this.options.buttons.opacity.normal)).insert(this.data = (new Element("ul", {
				className: "lv-data"
			})).insert(this.dataText = (new Element("li", {
				className: "lv-data-text"
			})).insert(this.title = new Element("div", {
				className: "lv-title"
			})).insert(this.caption = new Element("div", {
				className: "lv-caption"
			}))).insert(this.innerController = (new Element("div", {
				className: "lv-inner-controller"
			})).insert(this.imgNumber = (new Element("li", {
				className: "lv-img-number"
			})).insert(new Element("div"))).insert(this.innerPrevNext = (new Element("li", {
				className: "lv-inner-prev-next"
			})).insert(this.innerPrevButton = (new Element("div", {
				className: "lv-button"
			})).setOpacity(this.options.buttons.opacity.normal).setStyle({
				backgroundColor: this.options.backgroundColor
			}).setPngBackground(this.images + "inner_prev.png", {
				backgroundColor: this.options.backgroundColor
			})).insert(this.innerNextButton = (new Element("div", {
				className: "lv-button"
			})).setOpacity(this.options.buttons.opacity.normal).setStyle({
				backgroundColor: this.options.backgroundColor
			}).setPngBackground(this.images + "inner_next.png", {
				backgroundColor: this.options.backgroundColor
			}))).insert(this.slideshow = (new Element("li", {
				className: "lv-slideshow"
			})).insert(this.slideshowButton = (new Element("div", {
				className: "lv-button"
			})).setOpacity(this.options.buttons.opacity.normal).setStyle({
				backgroundColor: this.options.backgroundColor
			}).setPngBackground(this.images + "inner_slideshow_play.png", {
				backgroundColor: this.options.backgroundColor
			})))))).insert(this.contentBottom = new Element("div", {
				className: "lv-content-bottom "
			}))))).insert(this.loading = (new Element("div", {
				className: "lv-loading"
			})).insert(this.loadingButton = (new Element("div", {
				className: "lv-button"
			})).setStyle("background: url(" + this.images + "loading.gif) top left no-repeat")))).insert((new Element("li", {
				className: "lv-frame lv-frame-bottom"
			})).insert(a.cloneNode(!0))).insert(this.prevnext = (new Element("li", {
				className: "lv-prev-next"
			})).hide().setStyle("margin-top: " + this.border + "px; background: url(" + this.images + "blank.gif) top left repeat"))))).insert((new Element("div", {
				id: "lightviewError"
			})).hide());
			var d = new Image;
			d.onload = function () {
				d.onload = Prototype.emptyFunction,
				this.sideDimensions = {
					width: d.width,
					height: d.height
				};
				var a = pixelClone(this.sideDimensions),
				b;
				this.sideButtons.setStyle({
					marginTop: 0 - (d.height / 2).round() + "px",
					height: d.height + "px"
				}),
				this.prevSide.setStyle(b = Object.extend({
					marginLeft: -1 * this.sideDimensions.width + "px"
				},
				a)),
				this.prevButtonImage.setStyle(Object.extend({
					marginLeft: a.width
				},
				a)),
				this.nextSide.setStyle(Object.extend({
					marginRight: -1 * this.sideDimensions.width + "px"
				},
				a)),
				this.nextButtonImage.setStyle(b),
				this._lightviewLoadedEvent()
			}.bind(this),
			d.src = this.images + "prev.png",
			$w("center title caption imgNumber")._each(function (a) {
				this[a].setStyle({
					backgroundColor: this.options.backgroundColor
				})
			}.bind(this));
			var e = this.container.select(".lv-corner");
			$w("tl tr bl br").each(function (a, b) {
				this.radius > 0 ? this.createCorner(e[b], a) : e[b].insert(new Element("div", {
					className: "lv-fill"
				})),
				e[b].setStyle({
					width: this.border + "px",
					height: this.border + "px"
				}).addClassName("lv-corner" + a.capitalize()),
				this._lightviewLoadedEvent()
			}.bind(this)),
			this.lightview.select(".lv-filler", ".lv-fill", ".lv-wrap-down").invoke("setStyle", {
				backgroundColor: this.options.backgroundColor
			});
			var f = {};
			$w("prev next topclose").each(function (a) {
				this[a + "ButtonImage"].side = a;
				var b = this.images + a + ".png";
				a == "topclose" ? (f[a] = new Image, f[a].onload = function () {
					f[a].onload = Prototype.emptyFunction,
					this.closeDimensions[a] = {
						width: f[a].width,
						height: f[a].height
					};
					var c = this.options.buttons.topclose.side,
					d = Object.extend({
						"float": c,
						marginTop: this.closeDimensions[a].height + "px"
					},
					pixelClone(this.closeDimensions[a]));
					d["padding" + c.capitalize()] = this.border + "px",
					this[a + "ButtonImage"].setStyle(d),
					this.topButtons.setStyle({
						height: f[a].height + "px",
						top: -1 * this.closeDimensions[a].height + "px"
					}),
					this[a + "ButtonImage"].down().setPngBackground(b).setStyle(pixelClone(this.closeDimensions[a])),
					this._lightviewLoadedEvent()
				}.bind(this), f[a].src = this.images + a + ".png") : this[a + "ButtonImage"].setPngBackground(b)
			},
			this);
			var g = {};
			$w("large small").each(function (a) {
				g[a] = new Image,
				g[a].onload = function () {
					g[a].onload = Prototype.emptyFunction,
					this.closeDimensions[a] = {
						width: g[a].width,
						height: g[a].height
					},
					this._lightviewLoadedEvent()
				}.bind(this),
				g[a].src = this.images + "close_" + a + ".png"
			},
			this);
			var h = new Image;
			h.onload = function () {
				h.onload = Prototype.emptyFunction,
				this.loading.setStyle({
					width: h.width + "px",
					height: h.height + "px",
					marginTop: -0.5 * h.height + 0.5 * this.border + "px",
					marginLeft: -0.5 * h.width + "px"
				}),
				this._lightviewLoadedEvent()
			}.bind(this),
			h.src = this.images + "loading.gif";
			var i = new Image;
			i.onload = function (a) {
				i.onload = Prototype.emptyFunction;
				var b = {
					width: i.width + "px",
					height: i.height + "px"
				};
				this.slideshow.setStyle(b),
				this.slideshowButton.setStyle(b),
				this._lightviewLoadedEvent()
			}.bind(this),
			i.src = this.images + "inner_slideshow_stop.png",
			$w("prev next").each(function (a) {
				var b = a.capitalize(),
				c = new Image;
				c.onload = function () {
					c.onload = Prototype.emptyFunction,
					this["inner" + b + "Button"].setStyle({
						width: c.width + "px",
						height: c.height + "px"
					}),
					this._lightviewLoadedEvent()
				}.bind(this),
				c.src = this.images + "inner_" + a + ".png",
				this["inner" + b + "Button"].prevnext = a
			},
			this),
			$w("slideshow innerPrevNext imgNumber").each(function (a) {
				this[a].hide = this[a].hide.wrap(function (a, b) {
					this.style.position = "absolute",
					a(b);
					return this
				}),
				this[a].show = this[a].show.wrap(function (a, b) {
					this.style.position = "relative",
					a(b);
					return this
				})
			},
			this),
			this.lightview.select("*").invoke("setStyle", {
				zIndex: this.options.zIndex + 1
			}),
			this.lightview.hide(),
			this._lightviewLoadedEvent()
		},
		prepare: function () {
			Effect.Queues.get("lightview")._each(function (a) {
				a.cancel()
			}),
			this.scaledInnerDimensions = null,
			this.view.isSet() ? (this.controllerHeight = this._controllerHeight, this.controller && !this.controller.visible() && (this.controller.setStyle("visibility:hidden").show(), this.controllerCenter.setOpacity(0))) : (this.controllerHeight = null, this.controller.hide()),
			parseInt(this.topcloseButtonImage.getStyle("marginTop")) < this.closeDimensions.topclose.height && this.toggleTopClose(!1),
			this.hideOverlapping(),
			this.hideContent(),
			new Effect.Event({
				queue: this.queue,
				afterFinish: function () {
					$w("top bottom").each(function (a) {
						var b = a.capitalize();
						this["content" + b].remove();
						var c = {};
						this["content" + b] = (new Element("div", {
							className: "lv-content" + b
						})).hide(),
						c[a] = this["content" + b],
						this.center.insert(c)
					}.bind(this))
				}.bind(this)
			}),
			this.disableKeyboardNavigation(),
			this.views = null
		},
		restoreInlineContent: function () {
			this.inlineContent && this.inlineMarker && (this.inlineMarker.insert({
				before: this.inlineContent.setStyle({
					display: this.inlineContent._inlineDisplayRestore
				})
			}), this.inlineMarker.remove(), this.inlineMarker = null)
		},
		show: function (a) {
			this.element = null;
			var b = Object.isString(a);
			if (Object.isElement(a) || b) {
				if (b && a.startsWith("#")) {
					this.show({
						href: a,
						options: Object.extend({
							autosize: !0
						},
						arguments[1] || {})
					});
					return
				}
				this.element = $(a);
				if (!this.element) {
					return
				}
				this.element.blur(),
				this.view = this.element._view || new Lightview.View(this.element)
			} else {
				a.href ? (this.element = $(document.body), this.view = new Lightview.View(a)) : Object.isNumber(a) && (this.element = this.getSet(this.view.rel)[a], this.view = this.element._view)
			}
			if (this.view.href) {
				this.prepare();
				if (this.view.isGallery() || this.view.isSet()) {
					this.extendSet(this.view.rel),
					this.views = this.getViews(this.view.rel),
					this.view.isSet() && (this.controllerOffset = this.views.length > 1 ? this._controllerOffset: 0, this.isSetGallery = this.views.all(function (a) {
						return a.isImage()
					}))
				}
				this.restoreCenter(),
				this.appear();
				if (this.view.href != "#lightviewError" && Object.keys(Lightview.Plugin).join(" ").indexOf(this.view.type) >= 0) {
					if (!Lightview.Plugin[this.view.type]) {
						$("lightviewError").update((new Template(this.errors.requiresPlugin)).evaluate({
							type: this.view.type.capitalize(),
							pluginspage: this.pluginspages[this.view.type]
						}));
						var c = $("lightviewError").getDimensions();
						this.show({
							href: "#lightviewError",
							title: this.view.type.capitalize() + " plugin required",
							options: c
						});
						return ! 1
					}
				}
				var d = Object.extend({
					menubar: "bottom",
					topclose: !1,
					wmode: "transparent",
					innerPreviousNext: this.view.isGallery() && this.options.buttons.innerPreviousNext.display,
					keyboard: this.options.keyboard,
					slideshow: this.view.isGallery() && this.options.buttons.slideshow.display || this.isSetGallery,
					overflow: "hidden",
					overlayClose: this.options.overlay.close,
					viewport: this.options.viewport
				},
				this.options.defaultOptions[this.view.type] || {});
				this.view.options = Object.extend(d, this.view.options),
				this.view.isSet() && (this.view.options.topclose = this.views.length <= 1),
				!(this.view.title || this.view.caption || this.views && this.views.length > 1) && this.view.options.topclose && (this.view.options.menubar = !1),
				this._contentPosition = "content" + (this.view.options.menubar == "top" ? "Bottom": "Top");
				if (this.view.isImage()) {
					if (!l && !this.view._VMLPreloaded) {
						this.view._VMLPreloaded = !0;
						var e = (new Element("ns_vml:image", {
							src: this.view.href,
							display: "none"
						})).setStyle("height:1px;width:1px;");
						$(document.body).insert(e),
						Element.remove.delay(0.1, e)
					}
					if (this.view.isGallery() || this.view.isSet()) {
						this.position = this.views.indexOf(this.view),
						this.preloadSurroundingImages()
					}
					this.innerDimensions = this.view.preloadedDimensions;
					if (this.innerDimensions) {
						this.afterEffect()
					} else {
						this.startLoading();
						var e = new Image;
						e.onload = function () {
							e.onload = Prototype.emptyFunction,
							this.stopLoading(),
							this.innerDimensions = {
								width: e.width,
								height: e.height
							},
							this.afterEffect()
						}.bind(this),
						e.src = this.view.href
					}
				} else {
					this.view.isSet() && (this.position = this.views.indexOf(this.view)),
					this.innerDimensions = this.view.options.fullscreen ? document.viewport.getDimensions() : {
						width: this.view.options.width,
						height: this.view.options.height
					},
					this.afterEffect()
				}
			}
		},
    resizeNewContent: function(keepVisible) {
      if (!keepVisible) this.center.setOpacity(0);
      this.stopLoading();
      this.view.options.autosize && (this[this._contentPosition].setStyle({
        width: "auto",
        height: "auto"
      }), this.innerDimensions = this.getHiddenDimensions(this[this._contentPosition])),
      new Effect.Event({
        queue: this.queue,
        afterFinish: this.resizeWithinViewport.bind(this)
      });
    },
		insertContent: function () {
			function a(a, b, c) {
				a = $(a);
				var d = pixelClone(c);
				a.update((new Element("img", {
					id: "lightviewContent",
					src: b,
					alt: "",
					galleryimg: "no"
				})).setStyle(d))
			}
			var b = function () {
				function c(b, c, d) {
					b = $(b);
					var e = pixelClone(d),
					f = new Image;
					f.onload = function () {
						canvas = new Element("canvas", e),
						b.update(canvas);
						try {
							var g = canvas.getContext("2d");
							g.drawImage(f, 0, 0, d.width, d.height)
						} catch(h) {
							a(b, c, d)
						}
					}.bind(this),
					f.src = c
				}
				function b(a, b, c) {
					a = $(a);
					var d = Object.extend({
						"float": "left"
					},
					pixelClone(c)),
					e = (new Element("ns_vml:image", {
						src: b,
						id: "lightviewContent"
					})).setStyle(d);
					a.update(e),
					e.outerHTML = e.outerHTML
				}
				return Prototype.Browser.IE ? b: c
			} ();
			return function () {
				var c = this.detectExtension(this.view.href),
				d = this.scaledInnerDimensions || this.innerDimensions;
				if (this.view.isImage()) {
					var e = pixelClone(d);
					this[this._contentPosition].setStyle(e),
					this.scaledInnerDimensions ? b(this[this._contentPosition], this.view.href, d) : a(this[this._contentPosition], this.view.href, d)
				} else {
					if (this.view.isExternal()) {
						switch (this.view.type) {
						case "ajax":
							var f = Object.clone(this.view.options.ajax) || {},
							g = function () {
								this.stopLoading(),
								this.view.options.autosize && (this[this._contentPosition].setStyle({
									width: "auto",
									height: "auto"
								}), this.innerDimensions = this.getHiddenDimensions(this[this._contentPosition])),
								new Effect.Event({
									queue: this.queue,
									afterFinish: this.resizeWithinViewport.bind(this)
								})
							}.bind(this);
							f.onComplete ? f.onComplete = f.onComplete.wrap(function (a, b) {
								g(),
								a(b)
							}) : f.onComplete = g,
              f.evalScripts = true;
							this.startLoading(),
							new Ajax.Updater(this[this._contentPosition], this.view.href, f);
							break;
						case "iframe":
							this.scaledInnerDimensions && (d.height -= this.menubarDimensions.height),
							this[this._contentPosition].update(this.iframe = (new Element("iframe", {
								frameBorder: 0,
								hspace: 0,
								src: this.view.href,
								id: "lightviewContent",
								name: "lightviewContent_" + (Math.random() * 99999).round(),
								scrolling: this.view.options && this.view.options.scrolling ? "auto": "no"
							})).setStyle(Object.extend({
								border: 0,
								margin: 0,
								padding: 0
							},
							pixelClone(d))));
							break;
						case "inline":
							var h = this.view.href,
							i = $(h.substr(h.indexOf("#") + 1));
							if (!i || !i.tagName) {
								return
							}
							var j = i.getDimensions();
							i.insert({
								before: this.inlineMarker = (new Element(i.tagName)).hide()
							}),
							i._inlineDisplayRestore = i.getStyle("display"),
							this.inlineContent = i.show(),
							this[this._contentPosition].update(this.inlineContent),
							this[this._contentPosition].select("select, object, embed").each(function (a) {
								this.overlappingRestore.each(function (b) {
									b.element == a && a.setStyle({
										visibility: b.visibility
									})
								})
							}.bind(this)),
							this.view.options.autosize && (this.innerDimensions = j, new Effect.Event({
								queue: this.queue,
								afterFinish: this.resizeWithinViewport.bind(this)
							}))
						}
					} else {
						var k = {
							tag: "object",
							id: "lightviewContent",
							width: d.width,
							height: d.height
						};
						switch (this.view.type) {
						case "quicktime":
							Object.extend(k, {
								pluginspage: this.pluginspages[this.view.type],
								children: [{
									tag: "param",
									name: "autoplay",
									value: this.view.options.autoplay
								},
								{
									tag: "param",
									name: "scale",
									value: "tofit"
								},
								{
									tag: "param",
									name: "controller",
									value: this.view.options.controls
								},
								{
									tag: "param",
									name: "enablejavascript",
									value: !0
								},
								{
									tag: "param",
									name: "src",
									value: this.view.href
								},
								{
									tag: "param",
									name: "loop",
									value: this.view.options.loop || !1
								}]
							}),
							Object.extend(k, Prototype.Browser.IE ? {
								codebase: this.codebases[this.view.type],
								classid: this.classids[this.view.type]
							}: {
								data: this.view.href,
								type: this.mimetypes[this.view.type]
							});
							break;
						case "flash":
							Object.extend(k, {
								data: this.view.href,
								type: this.mimetypes[this.view.type],
								quality: "high",
								wmode: this.view.options.wmode,
								pluginspage: this.pluginspages[this.view.type],
								children: [{
									tag: "param",
									name: "movie",
									value: this.view.href
								},
								{
									tag: "param",
									name: "allowFullScreen",
									value: "true"
								}]
							}),
							this.view.options.flashvars && k.children.push({
								tag: "param",
								name: "FlashVars",
								value: this.view.options.flashvars
							})
						}
						this[this._contentPosition].setStyle(pixelClone(d)).update(this.createHTML(k)).setStyle("visibility:hidden").show(),
						this.view.isQuicktime() &&
						function () {
							try {
								"SetControllerVisible" in $("lightviewContent") && $("lightviewContent").SetControllerVisible(this.view.options.controls)
							} catch(a) {}
						}.bind(this).defer()
					}
				}
			}
		} (),
		getHiddenDimensions: function (a) {
			a = $(a);
			var b = a.ancestors(),
			c = [],
			d = [];
			b.push(a),
			b.each(function (b) {
				if (b == a || !b.visible()) {
					c.push(b),
					d.push({
						display: b.getStyle("display"),
						position: b.getStyle("position"),
						visibility: b.getStyle("visibility")
					}),
					b.setStyle({
						display: "block",
						position: "absolute",
						visibility: "visible"
					})
				}
			});
			var e = {
				width: a.clientWidth,
				height: a.clientHeight
			};
			c.each(function (a, b) {
				a.setStyle(d[b])
			});
			return e
		},
		clearContent: function () {
			var a = $("lightviewContent");
			if (a) {
				switch (a.tagName.toLowerCase()) {
				case "object":
					if (Prototype.Browser.WebKit && this.view.isQuicktime()) {
						try {
							a.Stop()
						} catch(b) {}
						a.innerHTML = ""
					}
					a.parentNode ? a.remove() : a = Prototype.emptyFunction;
					break;
				case "iframe":
					a.remove(),
					Prototype.Browser.Gecko && window.frames.lightviewContent && delete window.frames.lightviewContent;
					break;
				default:
					a.remove()
				}
			}
			$w("Top Bottom").each(function (a) {
				this["content" + a].setStyle("width:auto;height:auto;").update("").hide()
			},
			this)
		},
		adjustDimensionsToView: Prototype.K,
		afterEffect: function () {
			new Effect.Event({
				queue: this.queue,
				afterFinish: this.afterShow.bind(this)
			})
		},
		afterShow: function () {
			this.fillMenuBar(),
			this.view.isAjax() || this.stopLoading(),
			this.view.options.autosize && this.view.isInline() || this.view.isAjax() || this.resizeWithinViewport(),
			this.view.isIframe() || new Effect.Event({
				queue: this.queue,
				afterFinish: this.insertContent.bind(this)
			}),
			this.view.options.topclose && new Effect.Event({
				queue: this.queue,
				afterFinish: this.toggleTopClose.bind(this, !0)
			})
		},
		finishShow: function () {
			new Effect.Event({
				queue: this.queue,
				afterFinish: this.showContent.bind(this)
			}),
			this.view.isIframe() && new Effect.Event({
				delay: 0.2,
				queue: this.queue,
				afterFinish: this.insertContent.bind(this)
			}),
			this.sliding && new Effect.Event({
				queue: this.queue,
				afterFinish: this.nextSlide.bind(this)
			}),
			(this.view.isQuicktime() || this.view.isFlash()) && new Effect.Event({
				queue: this.queue,
				delay: 0.1,
				afterFinish: Element.setStyle.bind(this, this[this._contentPosition], "visibility:visible")
			})
		},
		previous: function () {
			Effect.Queues.get(Lightview.queue.scope).effects.length || this.show(this.getSurroundingIndexes().previous)
		},
		next: function () {
			Effect.Queues.get(Lightview.queue.scope).effects.length || this.show(this.getSurroundingIndexes().next)
		},
		resizeWithinViewport: function () {
			this.adjustDimensionsToView();
			var a = this.getInnerDimensions(),
			b = this.getBounds();
			if (this.view.options.viewport && (a.width > b.width || a.height > b.height)) {
				if (this.view.options.fullscreen) {
					this.scaledInnerDimensions = b,
					this.fillMenuBar(),
					a = b
				} else {
					var c = this.getOuterDimensions(),
					d = b;
					if (this.view.isMedia()) {
						var e = [b.height / c.height, b.width / c.width, 1].min();
						this.scaledInnerDimensions = {
							width: (this.innerDimensions.width * e).round(),
							height: (this.innerDimensions.height * e).round()
						}
					} else {
						this.scaledInnerDimensions = {
							width: c.width > d.width ? d.width: c.width,
							height: c.height > d.height ? d.height: c.height
						}
					}
					this.fillMenuBar(),
					a = Object.clone(this.scaledInnerDimensions),
					this.view.isMedia() && (a.height += this.menubarDimensions.height)
				}
			} else {
				this.fillMenuBar(),
				this.scaledInnerDimensions = null
			}
			this._resize(a)
		},
		resize: function (a) {
			this._resize(a, {
				duration: 0
			})
		},
		_resize: function () {
			var a, b, c, d, e, f, g, h = function () {
				function g(f) {
					d = (a.width + f * b).toFixed(0),
					e = (a.height + f * c).toFixed(0)
				}
				var d, e, h;
				BROWSER_IS_IE_LT7 ? h = function (d) {
					this.lightview.setStyle({
						width: (a.width + d * b).toFixed(0) + "px",
						height: (a.height + d * c).toFixed(0) + "px"
					}),
					this.resizeCenter.setStyle({
						height: e - 1 * this.border + "px"
					})
				}: BROWSER_IS_FIREFOX_LT3 ? h = function (a) {
					var b = this.getViewportDimensions(),
					c = document.viewport.getScrollOffsets();
					this.lightview.setStyle({
						position: "absolute",
						marginLeft: 0,
						marginTop: 0,
						width: d + "px",
						height: e + "px",
						left: (c[0] + b.width / 2 - d / 2).floor() + "px",
						top: (c[1] + b.height / 2 - e / 2).floor() + "px"
					}),
					this.resizeCenter.setStyle({
						height: e - 1 * this.border + "px"
					})
				}: h = function (a) {
					this.lightview.setStyle({
						position: "fixed",
						width: d + "px",
						height: e + "px",
						marginLeft: ((0 - d) / 2).round() + "px",
						marginTop: ((0 - e) / 2 - f).round() + "px"
					}),
					this.resizeCenter.setStyle({
						height: e - 1 * this.border + "px"
					})
				};
				return function (a) {
					g.call(this, a),
					h.call(this, a)
				}
			} ();
			return function (i) {
				var j = arguments[1] || {};
				a = this.lightview.getDimensions(),
				g = 2 * this.border,
				width = i.width ? i.width + g: a.width,
				height = i.height ? i.height + g: a.height,
				this.hidePrevNext();
				if (a.width == width && a.height == height) {
					new Effect.Event({
						queue: this.queue,
						afterFinish: this._afterResize.bind(this, i)
					})
				} else {
					var k = {
						width: width + "px",
						height: height + "px"
					};
					b = width - a.width,
					c = height - a.height,
					d = parseInt(this.lightview.getStyle("marginLeft").replace("px", "")),
					e = parseInt(this.lightview.getStyle("marginTop").replace("px", "")),
					f = this.controller.visible() ? this.controllerOffset / 2 : 0,
					BROWSER_IS_IE_LT7 || Object.extend(k, {
						marginLeft: 0 - width / 2 + "px",
						marginTop: 0 - height / 2 + "px"
					}),
					j.duration == 0 ? h.call(this, 1) : this.resizing = new Effect.Tween(this.lightview, 0, 1, Object.extend({
						duration: this.options.resizeDuration,
						queue: this.queue,
						transition: this.options.transition,
						afterFinish: this._afterResize.bind(this, i)
					},
					j), h.bind(this))
				}
			}
		} (),
		_afterResize: function (a) {
			if (this.menubarDimensions) {
				var b = this[this._contentPosition],
				c;
				this.view.options.overflow == "auto" && (c = b.getDimensions()),
				b.setStyle({
					height: a.height - this.menubarDimensions.height + "px",
					width: a.width + "px"
				});
				if (this.view.options.overflow != "hidden" && (this.view.isAjax() || this.view.isInline())) {
					if (Prototype.Browser.IE) {
						if (this.view.options.overflow == "auto") {
							var d = b.getDimensions();
							b.setStyle("overflow:visible");
							var e = {
								overflowX: "hidden",
								overflowY: "hidden"
							},
							f = 0,
							g = 15;
							c.height > a.height && (e.overflowY = "auto", e.width = d.width - g, e.paddingRight = "15px", f = g),
							c.width - f > a.width && (e.overflowX = "auto", e.height = d.height - g, e.paddingBottom = "15px"),
							b.setStyle(e)
						} else {
							b.setStyle({
								overflow: this.view.options.overflow
							})
						}
					} else {
						b.setStyle({
							overflow: this.view.options.overflow
						})
					}
				} else {
					b.setStyle("overflow:hidden")
				}
				this.restoreCenter(),
				this.resizing = null,
				this.finishShow()
			}
		},
		showContent: function () {
			new Effect.Event({
				queue: this.queue,
				afterFinish: this.hidePrevNext.bind(this)
			}),
			new Effect.Event({
				queue: this.queue,
				afterFinish: function () {
					this[this._contentPosition].show(),
					this.fillMenuBar(),
					this.menubar.visible() && this.menubar.setStyle("visibility:visible").setOpacity(1)
				}.bind(this)
			}),
			new Effect.Parallel([new Effect.Opacity(this.center, {
				sync: !0,
				from: 0,
				to: 1
			}), new Effect.Appear(this.sideButtons, {
				sync: !0
			})], {
				queue: this.queue,
				duration: 0.25,
				afterFinish: function () {
					this.element && this.element.fire("lightview:opened")
				}.bind(this)
			}),
			(this.view.isGallery() || this.isSetGallery && this.options.controller.buttons.side) && new Effect.Event({
				queue: this.queue,
				afterFinish: this.showPrevNext.bind(this)
			})
		},
		hideContent: function () {
			function b(a) {
				this.center.setOpacity(a),
				this.sideButtons.setOpacity(a)
			}
			function a() {
				this.restoreInlineContent(),
				this.clearContent(),
				this.topcloseButtonImage.setStyle({
					marginTop: this.closeDimensions.topclose.height + "px"
				})
			}
			return function () {
				this.lightview.visible() ? new Effect.Tween(this.lightview, 1, 0, {
					duration: 0.2,
					queue: this.queue,
					afterFinish: a.bind(this)
				},
				b.bind(this)) : (this.center.setOpacity(0), this.sideButtons.setOpacity(0), this.clearContent())
			}
		} (),
		hideData: function () {
			$w("innerController data dataText title caption imgNumber innerPrevNext slideshow closeButton").each(function (a) {
				Element.hide(this[a])
			},
			this),
			this.menubar.setStyle("visibility:hidden").setOpacity(0)
		},
		fillMenuBar: function () {
			this.hideData(),
			this.view.options.menubar ? this.menubar.show() : (this.menubarDimensions = {
				width: 0,
				height: 0
			},
			this.closeButtonWidth = 0, this.menubar.hide());
			if (this.view.title || this.view.caption) {
				this.dataText.show(),
				this.data.show()
			}
			this.view.title && this.title.update(this.view.title).show(),
			this.view.caption && this.caption.update(this.view.caption).show(),
			this.views && this.views.length > 1 && (this.view.isSet() ? (this.setNumber.update((new Template(this.options.controller.setNumberTemplate)).evaluate({
				position: this.position + 1,
				total: this.views.length
			})), this.controller.getStyle("visibility") == "hidden" && (this.controller.setStyle("visibility:visible"), this._controllerCenterEffect && Effect.Queues.get("lightview").remove(this._controllerCenterEffect), this._controllerCenterEffect = new Effect.Appear(this.controllerCenter, {
				queue: this.queue,
				duration: 0.1
			}))) : (this.data.show(), this.view.isImage() && (this.innerController.show(), this.imgNumber.show().down().update((new Template(this.options.imgNumberTemplate)).evaluate({
				position: this.position + 1,
				total: this.views.length
			})), this.view.options.slideshow && (this.slideshowButton.show(), this.slideshow.show()))));
			var a = this.view.isSet();
			if ((this.view.options.innerPreviousNext || a) && this.views.length > 1) {
				var b = {
					prev: this.options.cyclic || this.position != 0,
					next: this.options.cyclic || (this.view.isGallery() || a) && this.getSurroundingIndexes().next != 0
				};
				$w("prev next").each(function (c) {
					var d = c.capitalize(),
					e = b[c] ? "pointer": "auto";
					a ? this["controller" + d].setStyle({
						cursor: e
					}).setOpacity(b[c] ? 1 : this.options.buttons.opacity.disabled) : this["inner" + d + "Button"].setStyle({
						cursor: e
					}).setOpacity(b[c] ? this.options.buttons.opacity.normal: this.options.buttons.opacity.disabled)
				}.bind(this)),
				(this.view.options.innerPreviousNext || this.options.controller.innerPreviousNext) && this.innerPrevNext.show()
			}
			this.controllerSlideshow.setOpacity(this.isSetGallery ? 1 : this.options.buttons.opacity.disabled).setStyle({
				cursor: this.isSetGallery ? "pointer": "auto"
			}),
			this.setCloseButtons(),
			this.menubar.childElements().find(Element.visible) || (this.menubar.hide(), this.view.options.menubar = !1),
			this.setMenubarDimensions()
		},
		setCloseButtons: function () {
			var a = this.closeDimensions.small.width,
			b = this.closeDimensions.large.width,
			c = this.scaledInnerDimensions ? this.scaledInnerDimensions.width: this.innerDimensions.width,
			d = 180,
			e = 0,
			f = this.view.options.closeButton || "large",
			g = this.options.borderColor;
			this.view.options.topclose || this.view.isSet() || !this.view.options.closeButton ? g = null: c >= d + a && c < d + b ? (g = "small", e = a) : c >= d + b && (g = f, e = this.closeDimensions[f].width),
			e > 0 ? (this.data.show(), this.closeButton.setStyle({
				width: e + "px"
			}).show()) : this.closeButton.hide(),
			g && this.closeButton.setPngBackground(this.images + "close_" + g + ".png", {
				backgroundColor: this.options.backgroundColor
			}),
			this.closeButtonWidth = e
		},
		startLoading: function () {
			this.loading.show()
		},
		stopLoading: function () {
			this.loadingEffect && Effect.Queues.get("lightview").remove(this.loadingEffect),
			new Effect.Fade(this.loading, {
				duration: 0.2,
				queue: this.queue,
				delay: 0.2
			})
		},
		setPrevNext: function () {
			if (this.view.isImage()) {
				var a = this.options.cyclic || this.position != 0,
				b = this.options.cyclic || (this.view.isGallery() || this.view.isSet()) && this.getSurroundingIndexes().next != 0;
				this.prevButtonImage[a ? "show": "hide"](),
				this.nextButtonImage[b ? "show": "hide"]();
				var c = this.scaledInnerDimensions || this.innerDimensions;
				this.prevnext.setStyle({
					height: c.height + "px",
					marginTop: this.border + (this.view.options.menubar == "top" ? this.menubar.getHeight() : 0) + "px"
				});
				var d = (c.width / 2 - 1 + this.border).floor();
				a && (this.prevnext.insert(this.prevButton = (new Element("div", {
					className: "lv-button lv-prev-button"
				})).setStyle({
					width: d + "px"
				})), this.prevButton.side = "prev"),
				b && (this.prevnext.insert(this.nextButton = (new Element("div", {
					className: "lv-button lv-next-button"
				})).setStyle({
					width: d + "px"
				})), this.nextButton.side = "next"),
				(a || b) && this.prevnext.show()
			}
		},
		showPrevNext: function () {
			this.view && this.options.buttons.side.display && this.view.isImage() && (this.setPrevNext(), this.prevnext.show())
		},
		hidePrevNext: function () {
			this.prevnext.update("").hide(),
			this.prevButtonImage.hide().setStyle({
				marginLeft: this.sideDimensions.width + "px"
			}),
			this.nextButtonImage.hide().setStyle({
				marginLeft: -1 * this.sideDimensions.width + "px"
			})
		},
		appear: function () {
			function a() {
				this.lightview.setOpacity(1)
			}
			BROWSER_IS_WEBKIT_419 || (a = a.wrap(function (a, b) {
				a(b),
				this.lightview.show()
			}));
			return function () {
				this.lightview.getStyle("opacity") == 0 && (this.options.overlay.display ? new Effect.Appear(this.overlay, {
					duration: 0.2,
					from: 0,
					to: FIX_OVERLAY_WITH_PNG ? 1 : this.options.overlay.opacity,
					queue: this.queue,
					beforeStart: this.maxOverlay.bind(this),
					afterFinish: a.bind(this)
				}) : a.call(this))
			}
		} (),
		hide: function () {
			Prototype.Browser.IE && this.iframe && this.view.isIframe() && this.iframe.remove();
			if (BROWSER_IS_WEBKIT_419 && this.view.isQuicktime()) {
				var a = $$("object#lightviewContent")[0];
				if (a) {
					try {
						a.Stop()
					} catch(b) {}
				}
			}
			if (this.lightview.getStyle("opacity") != 0) {
				this.stopSlideshow(),
				this.prevnext.hide(),
				(!Prototype.Browser.IE || !this.view.isIframe()) && this.center.hide();
				if (Effect.Queues.get("lightview_hide").effects.length > 0) {
					return
				}
				Effect.Queues.get("lightview").each(function (a) {
					a.cancel()
				}),
				new Effect.Event({
					queue: this.queue,
					afterFinish: this.restoreInlineContent.bind(this)
				}),
				new Effect.Opacity(this.lightview, {
					duration: 0.1,
					from: 1,
					to: 0,
					queue: {
						position: "end",
						scope: "lightview_hide"
					}
				}),
				new Effect.Fade(this.overlay, {
					duration: 0.16,
					queue: {
						position: "end",
						scope: "lightview_hide"
					},
					afterFinish: this.afterHide.bind(this)
				})
			}
		},
		afterHide: function () {
			this.clearContent(),
			this.lightview.hide(),
			this.center.setOpacity(0).show(),
			this.prevnext.update("").hide(),
			this.contentTop.update("").hide(),
			this.contentBottom.update("").hide(),
			this.disableKeyboardNavigation(),
			this.showOverlapping(),
			new Effect.Event({
				queue: this.queue,
				afterFinish: this.resize.bind(this, this.options.startDimensions)
			}),
			new Effect.Event({
				queue: this.queue,
				afterFinish: function () {
					this.element && this.element.fire("lightview:hidden"),
					$w("element views view scaledInnerDimensions isSetGallery _openEffect content")._each(function (a) {
						this[a] = null
					}.bind(this))
				}.bind(this)
			})
		},
		setMenubarDimensions: function () {
			this.menubar.setStyle("padding:0;");
			var a = {},
			b = this[(this.scaledInnerDimensions ? "scaledI": "i") + "nnerDimensions"].width;
			this.menubar.setStyle({
				width: b + "px"
			}),
			this.data.setStyle({
				width: b - this.closeButtonWidth - 1 + "px"
			}),
			a = this.getHiddenDimensions(this.menubar);
			if (this.view.options.menubar) {
				a.height += this.options.menubarPadding;
				switch (this.view.options.menubar) {
				case "bottom":
					this.menubar.setStyle("padding:" + this.options.menubarPadding + "px 0 0 0");
					break;
				case "top":
					this.menubar.setStyle("padding: 0 0 " + this.options.menubarPadding + "px 0")
				}
			}
			this.menubar.setStyle({
				width: "100%"
			}),
			this.menubarDimensions = this.view.options.menubar ? a: {
				width: a.width,
				height: 0
			}
		},
		restoreCenter: function () {
			function c() {
				a = this.lightview.getDimensions(),
				b = this.controller.visible() ? this.controllerOffset / 2 : 0
			}
			var a, b, d;
			BROWSER_IS_IE_LT7 ? d = function () {
				this.lightview.setStyle({
					top: "50%",
					left: "50%"
				})
			}: BROWSER_IS_WEBKIT_419 || BROWSER_IS_FIREFOX_LT3 ? d = function () {
				var b = this.getViewportDimensions(),
				c = document.viewport.getScrollOffsets();
				this.lightview.setStyle({
					marginLeft: 0,
					marginTop: 0,
					left: (c[0] + b.width / 2 - a.width / 2).floor() + "px",
					top: (c[1] + b.height / 2 - a.height / 2).floor() + "px"
				})
			}: d = function () {
				this.lightview.setStyle({
					position: "fixed",
					left: "50%",
					top: "50%",
					marginLeft: (0 - a.width / 2).round() + "px",
					marginTop: (0 - a.height / 2 - b).round() + "px"
				})
			};
			return function () {
				c.call(this),
				d.call(this)
			}
		} (),
		startSlideshow: function () {
			this.stopSlideshow(),
			this.sliding = !0,
			this.next.bind(this).delay(0.25),
			this.slideshowButton.setPngBackground(this.images + "inner_slideshow_stop.png", {
				backgroundColor: this.options.backgroundColor
			}).hide(),
			this.controllerSlideshow.setPngBackground(this.images + "controller_slideshow_stop.png", {
				backgroundColor: this.options.controller.backgroundColor
			})
		},
		stopSlideshow: function () {
			this.sliding && (this.sliding = !1),
			this.slideTimer && clearTimeout(this.slideTimer),
			this.slideshowButton.setPngBackground(this.images + "inner_slideshow_play.png", {
				backgroundColor: this.options.backgroundColor
			}),
			this.controllerSlideshow.setPngBackground(this.images + "controller_slideshow_play.png", {
				backgroundColor: this.options.controller.backgroundColor
			})
		},
		toggleSlideshow: function () { (!this.view.isSet() || this.isSetGallery) && this[(this.sliding ? "stop": "start") + "Slideshow"]()
		},
		nextSlide: function () {
			this.sliding && (this.slideTimer = this.next.bind(this).delay(this.options.slideshowDelay))
		},
		updateViews: function () {
			$$("a[class~=lightview], area[class~=lightview]").each(function (a) {
				var b = a._view;
				b && (b._title && a.writeAttribute("title", b._title), a._view = null)
			})
		},
		getSet: function (a) {
			var b = a.indexOf("][");
			b > -1 && (a = a.substr(0, b + 1));
			return $$('a[rel^="' + a + '"], area[rel^="' + a + '"]')
		},
		getViews: function (a) {
			return this.getSet(a).pluck("_view")
		},
		addObservers: function () {
			$(document.body).observe("click", this.delegateClose.bindAsEventListener(this)),
			$w("mouseover mouseout").each(function (a) {
				this.prevnext.observe(a, function (a) {
					var b = a.findElement("div");
					b && ((this.prevButton && this.prevButton == b || this.nextButton && this.nextButton == b) && this.toggleSideButton(a))
				}.bindAsEventListener(this))
			}.bind(this)),
			this.prevnext.observe("click", function (a) {
				var b = a.findElement("div");
				if (b) {
					var c = this.prevButton && this.prevButton == b ? "previous": this.nextButton && this.nextButton == b ? "next": null;
					c && this[c].wrap(function (a, b) {
						this.stopSlideshow(),
						a(b)
					}).bind(this)()
				}
			}.bindAsEventListener(this)),
			$w("prev next").each(function (a) {
				var b = a.capitalize(),
				c = function (a, b) {
					this.stopSlideshow(),
					a(b)
				},
				d = function (a, b) {
					var c = b.element().prevnext;
					(c == "prev" && (this.options.cyclic || this.position != 0) || c == "next" && (this.options.cyclic || (this.view.isGallery() || this.view.isSet()) && this.getSurroundingIndexes().next != 0)) && a(b)
				};
				this[a + "ButtonImage"].observe("mouseover", this.toggleSideButton.bindAsEventListener(this)).observe("mouseout", this.toggleSideButton.bindAsEventListener(this)).observe("click", this[a == "next" ? a: "previous"].wrap(c).bindAsEventListener(this)),
				this["inner" + b + "Button"].observe("click", this[a == "next" ? a: "previous"].wrap(d).wrap(c).bindAsEventListener(this)).observe("mouseover", Element.setOpacity.curry(this["inner" + b + "Button"], this.options.buttons.opacity.hover).wrap(d).bindAsEventListener(this)).observe("mouseout", Element.setOpacity.curry(this["inner" + b + "Button"], this.options.buttons.opacity.normal).wrap(d).bindAsEventListener(this)),
				this["controller" + b].observe("click", this[a == "next" ? a: "previous"].wrap(d).wrap(c).bindAsEventListener(this))
			},
			this);
			var a = [this.closeButton, this.slideshowButton];
			BROWSER_IS_WEBKIT_419 ? a.invoke("setOpacity", 1) : a.each(function (a) {
				a.observe("mouseover", Element.setOpacity.bind(this, a, this.options.buttons.opacity.hover)).observe("mouseout", Element.setOpacity.bind(this, a, this.options.buttons.opacity.normal))
			},
			this),
			this.slideshowButton.observe("click", this.toggleSlideshow.bindAsEventListener(this)),
			this.controllerSlideshow.observe("click", this.toggleSlideshow.bindAsEventListener(this));
			if (BROWSER_IS_WEBKIT_419 || BROWSER_IS_FIREFOX_LT3) {
				var b = function (a, b) {
					this.lightview.getStyle("top").charAt(0) != "-" && a(b)
				};
				Event.observe(window, "scroll", this.restoreCenter.wrap(b).bindAsEventListener(this)),
				Event.observe(window, "resize", this.restoreCenter.wrap(b).bindAsEventListener(this))
			}
			BROWSER_IS_FIREFOX_LT3 && Event.observe(window, "resize", this.maxOverlay.bindAsEventListener(this));
			if (BROWSER_IS_IE_LT7) {
				function c() {
					this.controller && this.controller.setStyle({
						left: ((document.documentElement.scrollLeft || 0) + document.viewport.getWidth() / 2).round() + "px"
					})
				}
				Event.observe(window, "scroll", c.bindAsEventListener(this)),
				Event.observe(window, "resize", c.bindAsEventListener(this))
			}
			this.options.preloadHover && (this._preloadImageHover = function (a) {
				var b = a.findElement("a[class~=lightview], area[class~=lightview]");
				b && (a.stop(), b._view || new Lightview.View(b), this.preloadImageHover(b))
			}.bindAsEventListener(this), $(document.body).observe("mouseover", this._preloadImageHover))
		},
		toggleTopClose: function (a) {
			this._topCloseEffect && Effect.Queues.get("lightview_topCloseEffect").remove(this.topCloseEffect);
			var b = {
				marginTop: (a ? 0 : this.closeDimensions.topclose.height) + "px"
			};
			this._topCloseEffect = new Effect.Morph(this.topcloseButtonImage, {
				style: b,
				duration: 0.16,
				queue: this.queue,
				delay: a ? 0.15 : 0
			})
		},
		getScrollDimensions: function () {
			var a = {};
			$w("width height").each(function (b) {
				var c = b.capitalize(),
				d = document.documentElement;
				a[b] = Prototype.Browser.IE ? [d["offset" + c], d["scroll" + c]].max() : Prototype.Browser.WebKit ? document.body["scroll" + c] : d["scroll" + c]
			});
			return a
		},
		maxOverlay: function () {
			BROWSER_IS_FIREFOX_LT3 && this.overlay.setStyle(pixelClone(this.getScrollDimensions()))
		},
		delegateClose: function () {
			var a = ".lv-close, .lv-top-buttons .lv-button, .lv-loading, .lv-controller-close";
			return function (b) {
				this.view && this.view.options && b.findElement(a + (this.view.options.overlayClose ? ", #lv_overlay": "")) && this.hide()
			}
		} (),
		toggleSideButton: function (a) {
			var b = a.target,
			c = b.side,
			d = this.sideDimensions.width,
			e = a.type == "mouseover" ? 0 : c == "prev" ? d: -1 * d,
			f = {
				marginLeft: e + "px"
			};
			this.sideEffect || (this.sideEffect = {}),
			this.sideEffect[c] && Effect.Queues.get("lightview_side" + c).remove(this.sideEffect[c]),
			this.sideEffect[c] = new Effect.Morph(this[c + "ButtonImage"], {
				style: f,
				duration: 0.2,
				queue: {
					scope: "lightview_side" + c,
					limit: 1
				},
				delay: a.type == "mouseout" ? 0.1 : 0
			})
		},
		getSurroundingIndexes: function () {
			if (this.views) {
				var a = this.position,
				b = this.views.length,
				c = a <= 0 ? b - 1 : a - 1,
				d = a >= b - 1 ? 0 : a + 1;
				return {
					previous: c,
					next: d
				}
			}
		},
		createCorner: function (a, b) {
			var c = arguments[2] || this.options,
			d = c.radius,
			e = c.border;
			position = {
				top: b.charAt(0) == "t",
				left: b.charAt(1) == "l"
			};
			if (l) {
				var f = new Element("canvas", {
					className: "cornerCanvas" + b.capitalize(),
					width: e + "px",
					height: e + "px"
				});
				f.setStyle("float:left"),
				a.insert(f);
				var g = f.getContext("2d");
				g.fillStyle = c.backgroundColor,
				g.arc(position.left ? d: e - d, position.top ? d: e - d, d, 0, Math.PI * 2, !0),
				g.fill(),
				g.fillRect(position.left ? d: 0, 0, e - d, e),
				g.fillRect(0, position.top ? d: 0, e, e - d)
			} else {
				var h = (new Element("ns_vml:roundrect", {
					fillcolor: c.backgroundColor,
					strokeWeight: "1px",
					strokeColor: c.backgroundColor,
					arcSize: (d / e * 0.5).toFixed(2)
				})).setStyle({
					width: 2 * e - 1 + "px",
					height: 2 * e - 1 + "px",
					position: "absolute",
					left: (position.left ? 0 : -1 * e) + "px",
					top: (position.top ? 0 : -1 * e) + "px"
				});
				a.insert(h),
				h.outerHTML = h.outerHTML
			}
		},
		hideOverlapping: function () {
			function a() {
				return $$("object, embed, select")
			}
			Prototype.Browser.IE && document.documentMode >= 8 && (a = function () {
				return document.querySelectorAll("object, embed, select")
			});
			return function () {
				if (!this.preventingOverlap) {
					var b = a();
					this.overlappingRestore = [];
					for (var c = 0, d = b.length; c < d; c++) {
						var e = b[c];
						this.overlappingRestore.push({
							element: e,
							visibility: e.style.visibility
						}),
						e.style.visibility = "hidden"
					}
					this.preventingOverlap = !0
				}
			}
		} (),
		showOverlapping: function () {
			this.overlappingRestore.each(function (a, b) {
				a.element.style.visibility = a.visibility
			}),
			delete this.overlappingRestore,
			this.preventingOverlap = !1
		},
		getInnerDimensions: function () {
			return {
				width: this.innerDimensions.width,
				height: this.innerDimensions.height + this.menubarDimensions.height
			}
		},
		getOuterDimensions: function () {
			var a = this.getInnerDimensions(),
			b = 2 * this.border;
			return {
				width: a.width + b,
				height: a.height + b
			}
		},
		getBounds: function () {
			var a = 21,
			b = 2 * this.sideDimensions.height + a,
			c = this.getViewportDimensions();
			return {
				width: c.width - b,
				height: c.height - b
			}
		},
		getViewportDimensions: function () {
			var a = document.viewport.getDimensions();
			this.controller && this.controller.visible() && this.views && this.views.length > 1 && (a.height -= this.controllerOffset);
			return a
		}
	}),
	function () {
		function a(a, b) {
			this.view && a(b)
		}
		$w("fillMenuBar insertContent").each(function (b) {
			this[b] = this[b].wrap(a)
		},
		Lightview)
	} (),
	Object.extend(Lightview, {
		enableKeyboardNavigation: function () {
			this.view.options.keyboard && (this.keyboardEvent = this.keyboardDown.bindAsEventListener(this), document.observe("keydown", this.keyboardEvent))
		},
		disableKeyboardNavigation: function () {
			this.keyboardEvent && document.stopObserving("keydown", this.keyboardEvent)
		},
		keyboardDown: function (a) {
			var b = String.fromCharCode(a.keyCode).toLowerCase(),
			c = a.keyCode,
			d = (this.view.isGallery() || this.isSetGallery) && !this.resizing,
			e = this.view.options.slideshow,
			f;
			this.view.isMedia() ? (a.stop(), f = c == Event.KEY_ESC || ["x", "c"].member(b) ? "hide": c == 37 && d && (this.options.cyclic || this.position != 0) ? "previous": c == 39 && d && (this.options.cyclic || this.getSurroundingIndexes().next != 0) ? "next": b == "p" && e && d ? "startSlideshow": b == "s" && e && d ? "stopSlideshow": null, b != "s" && this.stopSlideshow()) : f = c == Event.KEY_ESC ? "hide": null,
			f && this[f](),
			d && (c == Event.KEY_HOME && this.views.first() != this.view && this.show(0), c == Event.KEY_END && this.views.last() != this.view && this.show(this.views.length - 1))
		}
	}),
	Lightview.afterShow = Lightview.afterShow.wrap(function (a, b) {
		this.enableKeyboardNavigation(),
		a(b)
	}),
	Object.extend(Lightview, {
		extendSet: function (a) {
			var b = this.getSet(a);
			b && b._each(Lightview.Extend)
		},
		preloadSurroundingImages: function () {
			if (this.views.length != 0) {
				var a = this.getSurroundingIndexes();
				this.preloadFromSet([a.next, a.previous])
			}
		},
		preloadFromSet: function (a) {
			var b = this.views && this.views.member(a) || Object.isArray(a) ? this.views: a.rel ? this.getViews(a.rel) : null;
			if (b) {
				var c = $A(Object.isNumber(a) ? [a] : a.type ? [b.indexOf(a)] : a).uniq();
				c.each(function (a) {
					var c = b[a];
					this.preloadImageDimensions(c)
				},
				this)
			}
		},
		setPreloadedDimensions: function (a, b) {
			a.preloadedDimensions = {
				width: b.width,
				height: b.height
			}
		},
		preloadImageDimensions: function (a) {
			if (!a.preloadedDimensions && !a.isPreloading && a.href) {
				var b = new Image;
				b.onload = function () {
					b.onload = Prototype.emptyFunction,
					a.isPreloading = null,
					this.setPreloadedDimensions(a, b)
				}.bind(this),
				a.isPreloading = !0,
				b.src = a.href
			}
		},
		preloadImageHover: function (a) {
			var b = a._view; ! (b && b.preloadedDimensions || b.isPreloading) && b.isImage() && this.preloadImageDimensions(b)
		}
	}),
	Element.addMethods({
		setPngBackground: function (a, b) {
			a = $(a);
			var c = Object.extend({
				align: "top left",
				repeat: "no-repeat",
				sizingMethod: "scale",
				backgroundColor: ""
			},
			arguments[2] || {});
			a.setStyle(BROWSER_IS_IE_LT7 ? {
				filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + b + "'', sizingMethod='" + c.sizingMethod + "')"
			}: {
				background: c.backgroundColor + " url(" + b + ") " + c.align + " " + c.repeat
			});
			return a
		}
	}),
	Object.extend(Lightview, {
		detectType: function (a, b) {
			var c;
			$w("flash image iframe quicktime").each(function (b) { (new RegExp("\\.(" + this.typeExtensions[b].replace(/\s+/g, "|") + ")(\\?.*)?", "i")).test(a) && (c = b)
			}.bind(this));
			if (c) {
				return c
			}
			if (a.startsWith("#")) {
				return "inline"
			}
			if (document.domain && document.domain != a.replace(/(^.*\/\/)|(:.*)|(\/.*)/g, "")) {
				return "iframe"
			}
			return "image"
		},
		detectExtension: function (a) {
			var b = a.gsub(/\?.*/, "").match(/\.([^.]{3,4})$/);
			return b ? b[1] : null
		},
		createHTML: function (a) {
			var b = "<" + a.tag;
			for (var c in a) { ["children", "html", "tag"].member(c) || (b += " " + c + '="' + a[c] + '"')
			} (new RegExp("^(?:area|base|basefont|br|col|frame|hr|img|input|link|isindex|meta|param|range|spacer|wbr)$", "i")).test(a.tag) ? b += "/>": (b += ">", a.children && a.children.each(function (a) {
				b += this.createHTML(a)
			}.bind(this)), a.html && (b += a.html), b += "</" + a.tag + ">");
			return b
		}
	}),
	function () {
		document.observe("dom:loaded", function () {
			function b(b) {
				var c = !1;
				if (a) {
					c = $A(navigator.plugins).pluck("name").join(",").indexOf(b) >= 0
				} else {
					try {
						c = new ActiveXObject(b)
					} catch(d) {}
				}
				return !! c
			}
			var a = navigator.plugins && navigator.plugins.length;
			a ? window.Lightview.Plugin = {
				flash: b("Shockwave Flash"),
				quicktime: b("QuickTime")
			}: window.Lightview.Plugin = {
				flash: b("ShockwaveFlash.ShockwaveFlash"),
				quicktime: b("QuickTime.QuickTime")
			}
		})
	} (),
	Lightview.View = Class.create({
		initialize: function (d) {
			if (!d._view) {
				var e = Object.isElement(d);
				e && !d._view && (d._view = this, d.title && (d._view._title = d.title, Lightview.options.removeTitles && d.setAttribute("title", ""))),
				this.href = e ? d.getAttribute("href") : d.href,
				this.href.indexOf("#") >= 0 && (this.href = this.href.substr(this.href.indexOf("#")));
				var f = d.rel;
				if (f) {
					this.rel = f;
					if (f.startsWith("gallery")) {
						this.type = "gallery"
					} else {
						if (f.startsWith("set")) {
							if (f.include("][")) {
								var g = f.split("]["),
								relType = g[1].match(/([a-zA-Z]*)/)[1];
								if (relType) {
									this.type = relType;
									var h = g[0] + "]";
									d.writeAttribute("rel", h),
									this.rel = h
								}
							} else {
								this.type = Lightview.detectType(this.href)
							}
						} else {
							this.type = f
						}
					}
				} else {
					this.type = Lightview.detectType(this.href),
					this.rel = this.type
				}
				$w("ajax flash gallery iframe image inline quicktime external media set")._each(function (a) {
					var b = a.capitalize(),
					c = a.toLowerCase();
					"image gallery media external set".indexOf(a) < 0 && (this["is" + b] = function () {
						return this.type == c
					}.bind(this))
				}.bind(this));
				if (e && d._view._title) {
					var i = d._view._title.split(Lightview.options.titleSplit).invoke("strip");
					i[0] && (this.title = i[0]),
					i[1] && (this.caption = i[1]);
					var j = i[2];
					this.options = j && Object.isString(j) ? eval("({" + j + "})") : {}
				} else {
					this.title = d.title,
					this.caption = d.caption,
					this.options = d.options || {}
				}
				this.options.ajaxOptions && (this.options.ajax = Object.clone(this.options.ajaxOptions), delete this.options.ajaxOptions)
			}
		},
		isGallery: function () {
			return this.type.startsWith("gallery")
		},
		isSet: function () {
			return this.rel.startsWith("set")
		},
		isImage: function () {
			return this.isGallery() || this.type == "image"
		},
		isExternal: function () {
			return "iframe inline ajax".indexOf(this.type) >= 0
		},
		isMedia: function () {
			return ! this.isExternal()
		}
	}),
	Lightview.Extend = function (a) {
		var b = $(a);
		new Lightview.View(a);
		return b
	},
	function () {
		function e(a) {
			var b = c(a);
			b && d(b, "lightview") && this.Extend(b)
		}
		function d(a, b) {
			if (a) {
				var c = a.className;
				return c.length > 0 && (c == b || (new RegExp("(^|\\s)" + b + "(\\s|$)")).test(c))
			}
		}
		function c(a) {
			var b = a.target,
			c = a.type,
			d = a.currentTarget;
			if (d && d.tagName) {
				if (c === "load" || c === "error" || c === "click" && d.tagName.toLowerCase() === "input" && d.type === "radio") {
					b = d
				}
			}
			b.nodeType == Node.TEXT_NODE && (b = b.parentNode);
			return b
		}
		function b(a) {
			var b = a.findElement("a[class~=lightview], area[class~=lightview]");
			b && this.Extend(b)
		}
		function a(a) {
			var b = a.findElement("a[class~=lightview], area[class~=lightview]");
			b && (a.stop(), this.Extend(b), this.show(b))
		}
		document.observe("lightview:loaded", function () {
			$(document.body).observe("click", a.bindAsEventListener(Lightview)),
			Lightview.options.removeTitles && Prototype.Browser.IE && document.documentMode >= 8 ? $(document.body).observe("mouseover", e.bindAsEventListener(Lightview)) : $(document.body).observe("mouseover", b.bindAsEventListener(Lightview))
		})
	} (),
	Object.extend(Lightview, {
		buildController: function () {
			var a = this.options.controller,
			b = a.border;
			$(document.body).insert(this.controller = (new Element("div", {
				id: "lightviewController"
			})).setStyle({
				zIndex: this.options.zIndex + 1,
				marginBottom: a.margin + "px",
				position: "absolute",
				visibility: "hidden"
			}).insert(this.controllerTop = (new Element("div", {
				className: "lv-controller-top"
			})).insert((new Element("div", {
				className: "lv-controller-corner-wrapper lv-controller-corner-wrapper-top-left"
			})).setStyle("margin-left: " + b + "px").insert(new Element("div", {
				className: "lv-corner"
			}))).insert((new Element("div", {
				className: "lv-controller-between-corners"
			})).setStyle({
				margin: "0 " + b + "px",
				height: b + "px"
			})).insert((new Element("div", {
				className: "lv-controller-corner-wrapper lv-controller-corner-wrapper-top-right"
			})).setStyle("margin-left: -" + b + "px").insert(new Element("div", {
				className: "lv-corner"
			})))).insert(this.controllerMiddle = (new Element("div", {
				className: "lv-controller-middle clearfix"
			})).insert(this.controllerCenter = (new Element("ul", {
				className: "lv-controller-center"
			})).setStyle("margin: 0 " + b + "px").insert((new Element("li", {
				className: "lv-controller-set-number"
			})).insert(this.setNumber = new Element("div"))).insert((new Element("li", {
				className: "lv-button-wrapper lv-controller-prev"
			})).insert(this.controllerPrev = (new Element("div", {
				className: "lv-button"
			})).setPngBackground(this.images + "controller_prev.png", {
				backgroundColor: a.backgroundColor
			}))).insert((new Element("li", {
				className: "lv-button-wrapper lv-controller-next"
			})).insert(this.controllerNext = (new Element("div", {
				className: "lv-button"
			})).setPngBackground(this.images + "controller_next.png", {
				backgroundColor: a.backgroundColor
			}))).insert((new Element("li", {
				className: "lv-button-wrapper lv-controller-slideshow"
			})).insert(this.controllerSlideshow = (new Element("div", {
				className: "lv-button"
			})).setPngBackground(this.images + "controller_slideshow_play.png", {
				backgroundColor: a.backgroundColor
			}))).insert((new Element("li", {
				className: "lv-button-wrapper lv-controller-close"
			})).insert(this.controllerClose = (new Element("div", {
				className: "lv-button"
			})).setPngBackground(this.images + "controller_close.png", {
				backgroundColor: a.backgroundColor
			}))))).insert(this.controllerBottom = (new Element("div", {
				className: "lv-controller-bottom"
			})).insert((new Element("div", {
				className: "lv-controller-corner-wrapper lv-controller-corner-wrapper-bottom-left"
			})).setStyle("margin-left: " + b + "px").insert(new Element("div", {
				className: "lv-corner"
			}))).insert((new Element("div", {
				className: "lv-controller-between-corners"
			})).setStyle({
				margin: "0 " + b + "px",
				height: b + "px"
			})).insert((new Element("div", {
				className: "lv-controller-corner-wrapper lv-controller-corner-wrapper-bottom-right"
			})).setStyle("margin-left: -" + b + "px").insert(new Element("div", {
				className: "lv-corner"
			}))))),
			$w("prev next").each(function (a) {
				var b = a.capitalize();
				this["controller" + b].prevnext = a
			},
			this),
			BROWSER_IS_WEBKIT_419 && (this.controller.hide = function () {
				this.setStyle("left:-9500px;top:-9500px;visibility:hidden;");
				return this
			},
			this.controller.show = function () {
				this.setStyle("visibility:visible");
				return this
			},
			this.controller.visible = function () {
				return this.getStyle("visibility") == "visible" && parseFloat(this.getStyle("top").replace("px", "")) > -9500
			}),
			this.controller.select(".lv-button-wrapper div").invoke("setStyle", pixelClone(this.controllerButtonDimensions));
			var c = this.controller.select(".lv-corner");
			$w("tl tr bl br").each(function (b, d) {
				a.radius > 0 ? this.createCorner(c[d], b, a) : c[d].insert(new Element("div", {
					className: "lv-fill"
				})),
				c[d].setStyle({
					width: a.border + "px",
					height: a.border + "px"
				}).addClassName("lv-corner" + b.capitalize())
			},
			this),
			this.controller.down(".lv-controller-middle").setStyle("width:100%;"),
			this.controller.setStyle(BROWSER_IS_IE_LT7 ? {
				position: "absolute",
				top: "auto",
				left: ""
			}: {
				position: "fixed",
				top: "auto",
				left: "50%"
			}),
			this.controller.select(".lv-controller-between-corners", ".lv-controller-middle", ".lv-button", ".lv-fill").invoke("setStyle", {
				backgroundColor: a.backgroundColor
			}),
			this.setNumber.update((new Template(a.setNumberTemplate)).evaluate({
				position: 999,
				total: 999
			})),
			this.setNumber.setStyle({
				width: this.setNumber.getWidth() + "px",
				height: this.controllerCenter.getHeight() + "px"
			}),
			this._fixateController(),
			this.setNumber.update(""),
			this.controller.hide().setStyle("visibility:visible"),
			this.addObservers(),
			this._lightviewLoadedEvent()
		},
		_fixateController: function () {
			var a, b, c = this.options.controller,
			d = c.border;
			BROWSER_IS_IE_LT7 ? (a = this.controllerCenter.getDimensions(), b = a.width + 2 * d, this.controllerCenter.setStyle({
				width: a.width + "px",
				margin: 0
			}), this.controllerMiddle.setStyle("width:auto;"), this.controllerCenter.setStyle({
				paddingLeft: d + "px"
			}), this.controllerMiddle.setStyle({
				width: b + "px"
			}), $w("top bottom").each(function (a) {
				this["controller" + a.capitalize()].setStyle({
					width: b + "px"
				})
			},
			this), this.controller.setStyle("margin-left:-" + (b / 2).round() + "px")) : (this.controllerMiddle.setStyle("width:auto"), a = this.controllerMiddle.getDimensions(), this.setNumber.up().setStyle({
				lineHeight: a.height + "px",
				width: this.setNumber.getDimensions().width + "px"
			}), this.controller.setStyle({
				width: a.width + "px",
				marginLeft: 0 - (a.width / 2).round() + "px"
			}), this.controllerMiddle.setStyle({
				width: a.width + "px"
			}), $w("top bottom").each(function (b) {
				this["controller" + b.capitalize()].setStyle({
					width: a.width + "px"
				})
			},
			this)),
			this._controllerOffset = c.margin + a.height + 2 * d,
			this._controllerHeight = this.controller.getHeight(),
			this.setNumber.setStyle({
				lineHeight: a.height + "px"
			})
		}
	}),
	Lightview.buildController = Lightview.buildController.wrap(function (a, b) {
		var c = new Image;
		c.onload = function () {
			c.onload = Prototype.emptyFunction,
			this.controllerButtonDimensions = {
				width: c.width,
				height: c.height
			},
			a(b)
		}.bind(this),
		c.src = this.images + "controller_prev.png";
		var d = (new Image).src = this.images + "controller_slideshow_stop.png"
	}),
	Lightview.build = Lightview.build.wrap(function (a, b) {
		a(b),
		this.buildController()
	}),
	Lightview.hide = Lightview.hide.wrap(function (a, b) {
		this.view && this.view.isSet() && (this.controller.hide(), this.setNumber.update("")),
		a(b)
	})
})(),
Lightview.load(),
document.observe("dom:loaded", Lightview.start.bind(Lightview));
Utility = {
  getUrlParts: function(uri) {
    var parts = uri.match(/^((http[s]?|ftp):\/\/)?(((.+)@)?([^:\/\?#\s]+)(:(\d+))?)?(\/?[^\?#]+)?(\?([^#]+))?(#(.*))?$/i);
    parts = {scheme: parts[2], credentials: parts[5], host: parts[6], port: parts[8], path: parts[9], query: parts[11], hash: parts[13]};
    var out = {};
    out.uri = uri;
    out.scheme = (parts.scheme === undefined) ? window.location.protocol.toString().match(/^([a-z]+)/i)[1] : parts.scheme;
    out.host = (parts.host === undefined) ? (document.domain) ? document.domain : 'localhost' : parts.host;
    out.port = (parts.port === undefined) ? 80 : parts.port;
    out.credentials = (parts.credentials === undefined) ? false : parts.credentials.split(':');
    out.path = (parts.path === undefined) ? (window.location.pathname) ? window.location.pathname : '' : (parts.path == '') ? '/' : parts.path;
    out.query = (parts.query === undefined) ? (window.location.search) ? window.location.search.replace('?', '') : '' : parts.query;
    out.hash = (parts.hash === undefined) ? (window.location.hash) ? window.location.hash.replace('#') : '' : parts.hash;
    out.args = {};
    out.query.replace(/([^&=]*)=([^&=]*)/g, function (m, attr, value) {
      if (out.args[attr] === undefined) {
        out.args[attr] = value;
      } else {
        if (typeof(out.args[attr]) != 'object') out.args[attr] = [out.args[attr]];
        out.args[attr].push(value);
      }
    });
    return out;
  },

  makeUrlForHash: function(newUrl, currentUrl) {
    var pos = currentUrl.indexOf('#');
    if (pos >= 0) currentUrl = currentUrl.substr(0, pos);

    var newParts = Utility.getUrlParts(newUrl);
    var currentParts = Utility.getUrlParts(currentUrl);
    return currentUrl + '#' + (newParts.path ? newParts.path : '') + (newParts.query ? '?' + newParts.query : '');
  },

  addHTMLClassName: function(className) {
    if (document && document.body && document.body.parentNode) {
      var html = document.body.parentNode;
      Element.addClassName(document.body.parentNode, className);
      return true;
    }
    return false;
  },

  setCookie: function(name, value, expiredays) {
    if (expiredays) {
      var expdate = new Date();
      expdate.setDate(expdate.getDate() + expiredays);
    }
    document.cookie = name + '=' + escape(value) + ((expiredays == null) ? '' : ';expires=' + expdate.toUTCString());
  },

  getCookie: function(name) {
    if (document.cookie.length > 0) {
      var start = document.cookie.indexOf(name + '=');
      if (start != -1) {
        start = start + name.length + 1;
        var end = document.cookie.indexOf(';', start);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(start, end));
      }
    }
    return '';
  },

  bytes: function(bytes) {
    var i = 0;
    while(1023 < bytes) { bytes /= 1024; ++i; }
    return i ? bytes.toFixed(2) + ['', ' kb', ' Mb', ' Gb', ' Tb'][i] : bytes + ' bytes';
  }
};
(function() {
  var methods = ['get', 'put', 'post', 'delete'],
      actions = ['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'];

  function parseUrl(url) {
    var urlParts = url.match(/^((http[s]?|ftp):\/\/)?(((.+)@)?([^:\/\?#\s]+)(:(\d+))?)?(\/?[^\?#\.]+)?(\.([^\?#]+))?(\?([^#]?))?(#(.*))?$/i) || [];
    var pathParts = (urlParts[9]) ? urlParts[9].match(/(\/.*)\/+(\w+)$/i) || [] : [];
    return {scheme: urlParts[2], credentials: urlParts[5], host: urlParts[6], port: urlParts[8], path: urlParts[9], action: pathParts[2] || '', format: urlParts[11], query: urlParts[13], hash: urlParts[15]};
  }

  function observeAjax(original, url) {
    var method = (this.options.parameters['_method'] || this.options.method || 'post').toLowerCase(),
        urlParts = parseUrl(url),
        path = urlParts.path,
        action = urlParts.action,
        handled, proceeded;

    var proceed = function(options) {
      proceeded = true;
      this.proceeded = true;
      this.options = Object.extend(this.options, options || {});
      return original(url);
    }.bind(this); // TODO: remove prototype dependency

    for (var mapping in context.resources) {
      var resource = context.resources[mapping],
          actions = resource.__actions__,
          pathvars = resource.__pathvars__,
          f, matches, result, vars = {};

      if (!(matches = path && path.match(resource.__path__))) continue;

      var mAction = matches[matches.length - 2], mIdOrAction = matches[matches.length - 3];
      switch (method) {
        case 'get':
          if (!(f = actions['get'][action])) {
            if (!mIdOrAction) action = '';
            switch (action) {
              case '': f = actions['index']; break;
              case 'new': f = actions['new']; break;
              case 'edit': f = actions['edit']; break;
              default: f = (!mAction) ? actions['show'] : false;
            }
          }
          break;
        case 'put': f = actions['put'][action] || ((!mAction) ? actions['update'] : false); break;
        case 'post': f = actions['post'][action] || ((!mIdOrAction) ? actions['create'] : false); break;
        case 'delete': f = actions['delete'][action] || ((!mAction) ? actions['destroy'] : false); break;
      }

      if (f) {
        for (var i = 0; i < pathvars.length; i += 1) vars[pathvars[i]] = matches[i + 1];
        result = f(proceed, vars, urlParts);
      }
      if (result !== false && !proceeded) proceed(result);
      handled = true;
    }
    if (!handled) return original(url);
  }

  function currentResource(path) {
    if (this.resources[path]) return this.resources[path];
    var i, resource = this.resources[path] = {
      __path__: new RegExp('^' + (path[0] == '/' ? path : '/' + path).replace(/:\w+/ig, '(\\w+)') + '/?(\\w+)?/?(\\w+)?/?($|\\?|\\.|#)', 'i'),
      __pathvars__: (path.match(/:(\w+)/ig) || []).join('|').replace(/:/g, '').split('|'),
      __actions__: {},
      add: function(actionOrActions, callback, method) {
        var myActions = this.__actions__;
        if (typeof(actionOrActions) == 'string' && typeof(callback) == 'function') {
          var action = actionOrActions.split(':');
          if (action.length > 1) myActions[action[0]][action[1]] = callback;
          else myActions[action[0]] = callback;
        } else if (typeof(actionOrActions) == 'object') {
          for (i = 0; i < methods.length; i += 1) { myActions[methods[i]] = actionOrActions[methods[i]] || myActions[methods[i]] || {}; }
          for (i = 0; i < actions.length; i += 1) { myActions[actions[i]] = actionOrActions[actions[i]] || myActions[actions[i]]; }
        } else {
          throw('To add a resource you must provide: action or method:action, callback function - or - an object of actions/methods');
        }
        return this;
      }
    };
    for (i = 0; i < actions.length; i += 1) {
      resource[actions[i]] = (function(action) {
        return function(callback) { return resource.add(action, callback) }
      })(actions[i]);
    }
    for (i = 0; i < methods.length; i += 1) {
      resource[methods[i]] = (function(method) {
        return function(action, callback) { return resource.add(method + ':' + action, callback); }
      })(methods[i]);
    }
    return resource;
  }

  // TODO: add support for jQuery, mootools, YUI, Dojo, and ??
  Ajax.Request.prototype.request = Ajax.Request.prototype.request.wrap(observeAjax);

  // TODO: let's have a way to accomplish adding nicely to a window.Rails variable
  var context = window.Rails = {
    resources: {},
    resource: function(path, actions) {
      return currentResource.call(this, path).add(actions || {});
    }
  };
})();

(function() {
  Ajax.Responders.register({
    onCreate: function(request) {
      var token = $$('meta[name=csrf-token]')[0];
      if (token) {
        if (!request.options.requestHeaders) request.options.requestHeaders = {};
        request.options.requestHeaders['X-CSRF-Token'] = token.readAttribute('content');
      }
    }
  });

  // Technique from Juriy Zaytsev
  // http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
  function isEventSupported(eventName) {
    var el = document.createElement('div');
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported) {
      el.setAttribute(eventName, 'return;');
      isSupported = typeof el[eventName] == 'function';
    }
    el = null;
    return isSupported;
  }

  function isForm(element) {
    return Object.isElement(element) && element.nodeName.toUpperCase() == 'FORM';
  }

  function isInput(element) {
    if (Object.isElement(element)) {
      var name = element.nodeName.toUpperCase();
      return name == 'INPUT' || name == 'SELECT' || name == 'TEXTAREA';
    }
    else return false;
  }

  var submitBubbles = isEventSupported('submit'),
      changeBubbles = isEventSupported('change');

  if (!submitBubbles || !changeBubbles) {
    // augment the Event.Handler class to observe custom events when needed
    Event.Handler.prototype.initialize = Event.Handler.prototype.initialize.wrap(
      function(init, element, eventName, selector, callback) {
        init(element, eventName, selector, callback);
        // is the handler being attached to an element that doesn't support this event?
        if ( (!submitBubbles && this.eventName == 'submit' && !isForm(this.element)) ||
             (!changeBubbles && this.eventName == 'change' && !isInput(this.element)) ) {
          // "submit" => "emulated:submit"
          this.eventName = 'emulated:' + this.eventName;
        }
      }
    );
  }

  if (!submitBubbles) {
    // discover forms on the page by observing focus events which always bubble
    document.on('focusin', 'form', function(focusEvent, form) {
      // special handler for the real "submit" event (one-time operation)
      if (!form.retrieve('emulated:submit')) {
        form.on('submit', function(submitEvent) {
          var emulated = form.fire('emulated:submit', submitEvent, true);
          // if custom event received preventDefault, cancel the real one too
          if (emulated.returnValue === false) submitEvent.preventDefault();
        });
        form.store('emulated:submit', true);
      }
    });
  }

  if (!changeBubbles) {
    // discover form inputs on the page
    document.on('focusin', 'input, select, textarea', function(focusEvent, input) {
      // special handler for real "change" events
      if (!input.retrieve('emulated:change')) {
        input.on('change', function(changeEvent) {
          input.fire('emulated:change', changeEvent, true);
        });
        input.store('emulated:change', true);
      }
    });
  }

  function handleRemote(element) {
    var method, url, params;

    var event = element.fire("ajax:before");
    if (event.stopped) return false;

    if (element.tagName.toLowerCase() === 'form') {
      method = element.readAttribute('method') || 'post';
      url    = element.readAttribute('action');
      // serialize the form with respect to the submit button that was pressed
      params = element.serialize({ submit: element.retrieve('rails:submit-button') });
      // clear the pressed submit button information
      element.store('rails:submit-button', null);
    } else {
      method = element.readAttribute('data-method') || 'get';
      url    = element.readAttribute('href');
      params = {};
    }

    new Ajax.Request(url, {
      method: method,
      parameters: params,
      evalScripts: true,

      onCreate:   function(response) { element.fire("ajax:create",   response); },
      onComplete: function(response) { element.fire("ajax:complete", response); },
      onSuccess:  function(response) { element.fire("ajax:success",  response); },
      onFailure:  function(response) { element.fire("ajax:failure",  response); }
    });

    element.fire("ajax:after");
  }

  function insertHiddenField(form, name, value) {
    form.insert(new Element('input', { type: 'hidden', name: name, value: value }));
  }

  function handleMethod(element) {
    var method = element.readAttribute('data-method'),
        url = element.readAttribute('href'),
        csrf_param = $$('meta[name=csrf-param]')[0],
        csrf_token = $$('meta[name=csrf-token]')[0];

    var form = new Element('form', { method: "POST", action: url, style: "display: none;" });
    $(element.parentNode).insert(form);

    if (method !== 'post') {
      insertHiddenField(form, '_method', method);
    }

    if (csrf_param) {
      insertHiddenField(form, csrf_param.readAttribute('content'), csrf_token.readAttribute('content'));
    }

    form.submit();
  }

  function disableFormElements(form) {
    form.select('input[type=submit][data-disable-with]').each(function(input) {
      input.store('rails:original-value', input.getValue());
      input.setValue(input.readAttribute('data-disable-with')).disable();
    });
  }

  function enableFormElements(form) {
    form.select('input[type=submit][data-disable-with]').each(function(input) {
      input.setValue(input.retrieve('rails:original-value')).enable();
    });
  }

  function allowAction(element) {
    var message = element.readAttribute('data-confirm');
    return !message || confirm(message);
  }

  document.on('click', 'a[data-confirm], a[data-remote], a[data-method]', function(event, link) {
    if (!allowAction(link)) {
      event.stop();
      return false;
    }

    if (link.readAttribute('data-remote')) {
      handleRemote(link);
      event.stop();
    } else if (link.readAttribute('data-method')) {
      handleMethod(link);
      event.stop();
    }
  });

  document.on("click", "form input[type=submit], form button[type=submit], form button:not([type])", function(event, button) {
    // register the pressed submit button
    event.findElement('form').store('rails:submit-button', button.name || false);
  });

  document.on("submit", function(event) {
    var form = event.findElement();

    if (!allowAction(form)) {
      event.stop();
      return false;
    }

    if (form.readAttribute('data-remote')) {
      handleRemote(form);
      event.stop();
    } else {
      disableFormElements(form);
    }
  });

  document.on('ajax:create', 'form', function(event, form) {
    if (form == event.findElement()) disableFormElements(form);
  });

  document.on('ajax:complete', 'form', function(event, form) {
    if (form == event.findElement()) enableFormElements(form);
  });
})();
Timezone = Class.create({
  offset: '0',
  name: '',
  usesDst: false,

  initialize: function(key) {
    Object.extend(this, Timezone.TIMEZONES[key]);
    this.resolveAmbiguity();
  },

  resolveAmbiguity: function() {
    var list = Timezone.AMBIGIOUS_ZONES[this.name];
    if (typeof(list) == 'undefined') return;

    for (var i in list) {
      var tz = list[i];
      if (Timezone._dateIsDst(Timezone.DST_START_DATES[tz])) {
        this.name = tz;
        return;
      }
    }
  }
});

// Class methods
Object.extend(Timezone, {
  HEMISPHERE_SOUTH: 'SOUTH',
  HEMISPHERE_NORTH: 'NORTH',
  HEMISPHERE_UNKNOWN: 'N/A',
  AMBIGIOUS_ZONES: {
    'America/Denver':       ['America/Denver','America/Mazatlan'],
    'America/Chicago':      ['America/Chicago','America/Mexico_City'],
    'America/Asuncion':     ['Atlantic/Stanley', 'America/Asuncion', 'America/Santiago','America/Campo_Grande'],
    'America/Montevideo':   ['America/Montevideo', 'America/Sao_Paolo'],
    'Asia/Beirut':          ['Asia/Gaza','Asia/Beirut', 'Europe/Minsk', 'Europe/Istanbul', 'Asia/Damascus', 'Asia/Jerusalem','Africa/Cairo'],
    'Asia/Yerevan':         ['Asia/Yerevan', 'Asia/Baku'],
    'Pacific/Auckland':     ['Pacific/Auckland', 'Pacific/Fiji'],
    'America/Los_Angeles':  ['America/Los_Angeles', 'America/Santa_Isabel'],
    'America/New_York':     ['America/Havana','America/New_York'],
    'America/Halifax':      ['America/Goose_Bay','America/Halifax'],
    'America/Godthab':      ['America/Miquelon', 'America/Godthab']
  },
  DST_START_DATES: {
    'America/Denver':       new Date(2011, 2, 13, 3, 0, 0, 0),
    'America/Mazatlan':     new Date(2011, 3, 3, 3, 0, 0, 0),
    'America/Chicago':      new Date(2011, 2, 13, 3, 0, 0, 0),
    'America/Mexico_City':  new Date(2011, 3, 3, 3, 0, 0, 0),
    'Atlantic/Stanley':     new Date(2011, 8, 4, 7, 0, 0, 0),
    'America/Asuncion':     new Date(2011, 9, 2, 3, 0, 0, 0),
    'America/Santiago':     new Date(2011, 9, 9, 3, 0, 0, 0),
    'America/Campo_Grande': new Date(2011, 9, 16, 5, 0, 0, 0),
    'America/Montevideo':   new Date(2011, 9, 2, 3, 0, 0, 0),
    'America/Sao_Paolo':    new Date(2011, 9, 16, 5, 0, 0, 0),
    'America/Los_Angeles':  new Date(2011, 2, 13, 8, 0, 0, 0),
    'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
    'America/Havana':       new Date(2011, 2, 13, 2, 0, 0, 0),
    'America/New_York':     new Date(2011, 2, 13, 7, 0, 0, 0),
    'Asia/Gaza':            new Date(2011, 2, 26, 23, 0, 0, 0),
    'Asia/Beirut':          new Date(2011, 2, 27, 1, 0, 0, 0),
    'Europe/Minsk':         new Date(2011, 2, 27, 3, 0, 0, 0),
    'Europe/Istanbul':      new Date(2011, 2, 27, 7, 0, 0, 0),
    'Asia/Damascus':        new Date(2011, 3, 1, 2, 0, 0, 0),
    'Asia/Jerusalem':       new Date(2011, 3, 1, 6, 0, 0, 0),
    'Africa/Cairo':         new Date(2011, 3, 29, 4, 0, 0, 0),
    'Asia/Yerevan':         new Date(2011, 2, 27, 4, 0, 0, 0),
    'Asia/Baku':            new Date(2011, 2, 27, 8, 0, 0, 0),
    'Pacific/Auckland':     new Date(2011, 8, 26, 7, 0, 0, 0),
    'Pacific/Fiji':         new Date(2010, 11, 29, 23, 0, 0, 0),
    'America/Halifax':      new Date(2011, 2, 13, 6, 0, 0, 0),
    'America/Goose_Bay':    new Date(2011, 2, 13, 2, 1, 0, 0),
    'America/Miquelon':     new Date(2011, 2, 13, 5, 0, 0, 0),
    'America/Godthab':      new Date(2011, 2, 27, 1, 0, 0, 0)
  },
  TIMEZONES: {
    '-720,0':   {offset: '-12:00', name: 'Etc/GMT+12', usesDst: false},
    '-660,0':   {offset: '-11:00', name: 'Pacific/Pago_Pago', usesDst: false},
    '-600,1':   {offset: '-11:00', name: 'America/Adak', usesDst: true},
    '-660,1,s': {offset: '-11:00', name: 'Pacific/Apia', usesDst: true},
    '-600,0':   {offset: '-10:00', name: 'Pacific/Honolulu', usesDst: false},
    '-570,0':   {offset: '-10:30', name: 'Pacific/Marquesas', usesDst: false},
    '-540,0':   {offset: '-09:00', name: 'Pacific/Gambier', usesDst: false},
    '-540,1':   {offset: '-09:00', name: 'America/Anchorage', usesDst: true},
    '-480,1':   {offset: '-08:00', name: 'America/Los_Angeles', usesDst: true},
    '-480,0':   {offset: '-08:00', name: 'Pacific/Pitcairn', usesDst: false},
    '-420,0':   {offset: '-07:00', name: 'America/Phoenix', usesDst: false},
    '-420,1':   {offset: '-07:00', name: 'America/Denver', usesDst: true},
    '-360,0':   {offset: '-06:00', name: 'America/Guatemala', usesDst: false},
    '-360,1':   {offset: '-06:00', name: 'America/Chicago', usesDst: true},
    '-360,1,s': {offset: '-06:00', name: 'Pacific/Easter', usesDst: true},
    '-300,0':   {offset: '-05:00', name: 'America/Bogota', usesDst: false},
    '-300,1':   {offset: '-05:00', name: 'America/New_York', usesDst: true},
    '-270,0':   {offset: '-04:30', name: 'America/Caracas', usesDst: false},
    '-240,1':   {offset: '-04:00', name: 'America/Halifax', usesDst: true},
    '-240,0':   {offset: '-04:00', name: 'America/Santo_Domingo', usesDst: false},
    '-240,1,s': {offset: '-04:00', name: 'America/Asuncion', usesDst: true},
    '-210,1':   {offset: '-03:30', name: 'America/St_Johns', usesDst: true},
    '-180,1':   {offset: '-03:00', name: 'America/Godthab', usesDst: true},
    '-180,0':   {offset: '-03:00', name: 'America/Argentina/Buenos_Aires,', usesDst: false},
    '-180,1,s': {offset: '-03:00', name: 'America/Montevideo', usesDst: true},
    '-120,0':   {offset: '-02:00', name: 'America/Noronha', usesDst: false},
    '-120,1':   {offset: '-02:00', name: 'Etc/GMT+2', usesDst: true},
    '-60,1':    {offset: '-01:00', name: 'Atlantic/Azores', usesDst: true},
    '-60,0':    {offset: '-01:00', name: 'Atlantic/Cape_Verde', usesDst: false},
    '0,0':      {offset: '00:00',  name: 'Africa/Casablanca', usesDst: false},
    '0,1':      {offset: '00:00',  name: 'Europe/London', usesDst: true},
    '60,1':     {offset: '+01:00', name: 'Europe/Berlin', usesDst: true},
    '60,0':     {offset: '+01:00', name: 'Africa/Lagos', usesDst: false},
    '60,1,s':   {offset: '+01:00', name: 'Africa/Windhoek', usesDst: true},
    '120,1':    {offset: '+02:00', name: 'Asia/Beirut', usesDst: true},
    '120,0':    {offset: '+02:00', name: 'Africa/Johannesburg', usesDst: false},
    '180,1':    {offset: '+03:00', name: 'Europe/Moscow', usesDst: true},
    '180,0':    {offset: '+03:00', name: 'Asia/Baghdad', usesDst: false},
    '210,1':    {offset: '+03:30', name: 'Asia/Tehran', usesDst: true},
    '240,0':    {offset: '+04:00', name: 'Asia/Dubai', usesDst: false},
    '240,1':    {offset: '+04:00', name: 'Asia/Yerevan', usesDst: true},
    '270,0':    {offset: '+04:30', name: 'Asia/Kabul', usesDst: false},
    '300,1':    {offset: '+05:00', name: 'Asia/Yekaterinburg', usesDst: true},
    '300,0':    {offset: '+05:00', name: 'Asia/Karachi', usesDst: false},
    '330,0':    {offset: '+05:30', name: 'Asia/Kolkata', usesDst: false},
    '345,0':    {offset: '+05:45', name: 'Asia/Kathmandu', usesDst: false},
    '360,0':    {offset: '+06:00', name: 'Asia/Dhaka', usesDst: false},
    '360,1':    {offset: '+06:00', name: 'Asia/Omsk', usesDst: true},
    '390,0':    {offset: '+06:30', name: 'Asia/Rangoon', usesDst: false},
    '420,1':    {offset: '+07:00', name: 'Asia/Krasnoyarsk', usesDst: true},
    '420,0':    {offset: '+07:00', name: 'Asia/Jakarta', usesDst: false},
    '480,0':    {offset: '+08:00', name: 'Asia/Shanghai', usesDst: false},
    '480,1':    {offset: '+08:00', name: 'Asia/Irkutsk', usesDst: true},
    '525,0':    {offset: '+08:45', name: 'Australia/Eucla', usesDst: true},
    '525,1,s':  {offset: '+08:45', name: 'Australia/Eucla', usesDst: true},
    '540,1':    {offset: '+09:00', name: 'Asia/Yakutsk', usesDst: true},
    '540,0':    {offset: '+09:00', name: 'Asia/Tokyo', usesDst: false},
    '570,0':    {offset: '+09:30', name: 'Australia/Darwin', usesDst: false},
    '570,1,s':  {offset: '+09:30', name: 'Australia/Adelaide', usesDst: true},
    '600,0':    {offset: '+10:00', name: 'Australia/Brisbane', usesDst: false},
    '600,1':    {offset: '+10:00', name: 'Asia/Vladivostok', usesDst: true},
    '600,1,s':  {offset: '+10:00', name: 'Australia/Sydney', usesDst: true},
    '630,1,s':  {offset: '+10:30', name: 'Australia/Lord_Howe', usesDst: true},
    '660,1':    {offset: '+11:00', name: 'Asia/Kamchatka', usesDst: true},
    '660,0':    {offset: '+11:00', name: 'Pacific/Noumea', usesDst: false},
    '690,0':    {offset: '+11:30', name: 'Pacific/Norfolk', usesDst: false},
    '720,1,s':  {offset: '+12:00', name: 'Pacific/Auckland', usesDst: true},
    '720,0':    {offset: '+12:00', name: 'Pacific/Tarawa', usesDst: false},
    '765,1,s':  {offset: '+12:45', name: 'Pacific/Chatham', usesDst: true},
    '780,0':    {offset: '+13:00', name: 'Pacific/Tongatapu', usesDst: false},
    '840,0':    {offset: '+14:00', name: 'Pacific/Kiritimati', usesDst: false}
  },

  detect: function() {
    var januaryOffset = Timezone._januaryOffset();
    var juneOffset = Timezone._juneOffset();

    var key = {'offset' : januaryOffset, 'dst': 0, 'hemisphere' : Timezone.HEMISPHERE_UNKNOWN};
    if (januaryOffset - juneOffset < 0) {
      key = {'offset' : januaryOffset, 'dst': 1, 'hemisphere' : Timezone.HEMISPHERE_NORTH};
    } else if (januaryOffset - juneOffset > 0) {
      key = {'offset' : juneOffset, 'dst' : 1, 'hemisphere' : Timezone.HEMISPHERE_SOUTH};
    }

    return {
      'timezone': new Timezone([key['offset'], key['dst']].join(',') + (key['hemisphere'] == Timezone.HEMISPHERE_SOUTH ? ',s' : '')),
      'key': key
    };
  },

  _januaryOffset: function() {
    return Timezone._dateOffset(new Date(2011, 0, 1, 0, 0, 0, 0));
  },

  _juneOffset: function() {
    return Timezone._dateOffset(new Date(2011, 5, 1, 0, 0, 0, 0));
  },

  _dateOffset: function(date) {
    return -date.getTimezoneOffset();
  },

  _dateIsDst: function(date) {
    return ((date.getMonth() > 5 ? Timezone._juneOffset() : Timezone._januaryOffset()) - Timezone._dateOffset(date)) != 0;
  }

});


Event.observe(document, 'dom:loaded', function() {
  var tz = Timezone.detect();
  Utility.setCookie('timezone', tz.timezone.name);
});


var TableEditor = (function() {

  //TODO: Refactor, pull together redundancies
  return {

    tableElement: null,

    setTableElement: function (options) {
      this.tableElement = options.tableElement || this.tableElement;
    },

    getTableBody: function () {
      return Element.down(this.tableElement, 'tbody');
    },

    getColumnCount: function () {
      return Element.down(this.getTableBody(), 'tr').select('td, th').length;
    },

    getRowCount: function () {
      return Element.select(this.getTableBody(), 'tr').length;
    },

    getColSpan: function(cell) {
      return parseInt(cell.readAttribute('colspan')) || 1;
    },

    updateColSpan: function(cell, colspan) {
        cell.removeAttribute('colspan');
        if (colspan > 1) 
          cell.writeAttribute('colspan', colspan);
    },

    getRowSpan: function(cell) {
      return parseInt(cell.readAttribute('rowspan')) || 1;
    },

    updateRowSpan: function(cell, rowspan) {
        cell.removeAttribute('rowspan');
        if (rowspan >= 2) 
          cell.writeAttribute('colspan', rowspan);
    },

    addRow: function(options) {
      this.setTableElement(options);

      var columnCount = this.getColumnCount(),
          position = options.position || 'bottom',
          insertElmContext = options.nodeIndex >= 0 ? Element.select(this.getTableBody(), 'tr')[options.nodeIndex] : this.getTableBody(), 
          insertArgs = {};

      insertArgs[position] = new Element('tr', {'colcount': columnCount}).update(Array(columnCount + 1).join('<td>&nbsp;</td>'));
      Element.insert(insertElmContext, insertArgs);
    },

    addColumn: function(options) {
      this.setTableElement(options);

      var rowCellContext, insertArgs = {}, position = options.position || 'after';

      Element.select(this.getTableBody(), 'tr').each(function(tr) {
        rowCellContext = Element.down(tr, 'th, td', options.nodeIndex || null);
        insertArgs[position] = new Element(rowCellContext.tagName);
        Element.insert(rowCellContext, insertArgs);
      });
    },

    removeRow: function(options) {
      this.setTableElement(options);
      var rowIndex = options.nodeIndex || (this.getRowCount() - 1);
      if (rowIndex <=0) return;
      this.getTableBody().down('tr', rowIndex).remove();
    },

    removeColumn: function(options) {
      this.setTableElement(options);
      var columnIndex = options.nodeIndex || (this.getColumnCount() - 1);
      if (columnIndex <=0) return;
      Element.select(this.getTableBody(), 'tr').each(function(tr) { Element.down(tr, 'td, th', columnIndex).remove(); });
    },

    increaseColSpan: function(options) {
      this.setTableElement(options);

      var currentColSpan = this.getColSpan(options.cell),
          siblingCell = Element.next(options.cell, options.cell.tagName),
          siblingCellColSpan = this.getColSpan(siblingCell);

      if (!siblingCell) return false;

      options.cell.writeAttribute('colspan', currentColSpan + siblingCellColSpan);
      options.cell.innerHTML += siblingCell.innerHTML;
      Element.remove(siblingCell);
    },
  

    //TODO: Make compatible with edit
    decreaseColSpan: function(options) {
      this.setTableElement(options);

      var fromCell = options.cell,
          fromCellIndex = Element.previousSiblings(fromCell).length,
          fromRow = Element.up(fromCell, 'tr'),
          fromRowIndex = Element.previousSiblings(fromRow).length,
          fromCellColSpan = this.getColSpan(fromCell),
          fromCellRowSpan = this.getRowSpan(fromCell),
          fromRowOffset = Element.select(fromRow, 'td[rowspan], th[rowspan]').length - 1 || 0;

      if (fromCellColSpan === 1) return false;

      Element.writeAttribute(fromCell, {colspan: fromCellColSpan - 1});

      if (fromCellColSpan - 1 >= 1) { 

        Element.insert(fromCell, {after: new Element(fromCell.tagName)});

        outer:
        for (var i = 1, l = fromCellRowSpan; i < l; i++) {

          var row = Element.select(this.getTableBody(), 'tr')[i + fromRowIndex],
              cells = Element.select(row, 'td, th'),
              newCell = null,
              cellCount = 0;

          inner:
          for (var j = 0, ll = cells.length; j < ll; j++) {

            cellCount+=this.getColSpan(cells[j]);

            if (cellCount + fromRowOffset >= fromCellIndex) {
                newCell = new Element(fromCell.tagName);
                Element.insert(cells[j], {before: newCell});
                break outer;
            }

          }

        }

      }

    },
    
    //TODO: Make compatible with edit
    increaseRowSpan: function(options) {

      this.setTableElement(options);

      /**
       * Initialize
       */
      var fromCell = options.cell,
          fromRow = Element.up(fromCell, 'tr'),
          fromRowCells = Element.select(fromRow, 'td, th'),
          toRow = Element.next(fromRow, 'tr'),
          toRowCells = Element.select(toRow, 'td, th'),
          /**
           * Loop specific globals
           */
          i = 0, j = 0, 
          fromColSpan, fromRowSpan, toColSpan, 
          //This accounts for cells in the 'from row', that are already row span'd, hence will be missing from 'to row'
          fromRowSpanoffset = 0, 
          fromToColMatch;

      //Imediately increase rowspan
      fromCell.writeAttribute('rowspan', this.getRowSpan(options.cell) + 1);

      //Now normalize
      fromRowLoop:
      for (i, l = fromRowCells.length; i < l; i++) {

        fromColSpan = this.getColSpan(fromRowCells[i]), 
        fromRowSpan = this.getRowSpan(fromRowCells[i]);

        /**
         * Now check to see if this is a new cell to normalize, that has been rowspan'd
         * Normalize toRowLoop count to keep cells in sync by subtracting 
         * any cells found in from row, that will not be present in to row
         */
        if (fromRowSpan > 1 && fromRowCells[i] === fromCell)
          fromToColMatch = true;
          //if (j > fromRowSpanoffset) j-=fromRowSpanoffset; XXX Not needed?
        else if (fromRowSpan > 1) 
          fromRowSpanoffset += fromColSpan;

        //Normalize j again when we hit the end of a row, to cell index value, not length, which will be off by 1
        if (j >= toRowCells.length) j = toRowCells.length - 1;

        toRowLoop:
        for (j, ll = toRowCells.length; j < ll; j++) {

          var toColSpan = this.getColSpan(toRowCells[j]),
              updatedColSpan = toColSpan - Math.abs((fromColSpan + i) - (toColSpan + j + fromRowSpanoffset) - fromColSpan),
              postColSpanCount = toColSpan - updatedColSpan - fromColSpan;

          if (toColSpan === fromColSpan) {
            if (fromToColMatch) {
              Element.remove(toRowCells[j]);
              fromToColMatch = false;
              break fromRowLoop;
            } else {
              j+=1;
              continue fromRowLoop;
            }
          }

          //We're merging into a large colspan col
          if ((toColSpan + j + fromRowSpanoffset) > fromColSpan + i) { 

            if (fromToColMatch) {

              if (updatedColSpan >= 1) {
                this.updateColSpan(toRowCells[j], updatedColSpan);
                Element.insert(toRowCells[j], {after: (new Element(toRowCells[j].tagName)).writeAttribute('colspan', postColSpanCount)});
              } else {
                //From smaller colspan to the start of a larger colspan
                this.updateColSpan(toRowCells[j], postColSpanCount);
              }

              fromToColMatch = false;
              break fromRowLoop;
            } 

            continue fromRowLoop;

          //From smaller colspan to the end of a larger colspan
          } else if ((toColSpan + j + fromRowSpanoffset) ===  fromColSpan + i) {

            if (fromToColMatch) {
              this.updateColSpan(toRowCells[j], updatedColSpan);
              fromToColMatch = false;
              break fromRowLoop;
            }

            j+=1;
            continue fromRowLoop;

          //Doing something we can't handle - larger colspan to smaller
          } else if (fromColSpan + i > toColSpan + j + fromRowSpanoffset) {
            //Revert the colspan we added
            if (fromToColMatch) { 
              if (fromRowSpan > 2) 
                this.updateRowSpan(fromRowCells[i], (fromRowSpan - 1));
              else 
                this.updateRowSpan(fromRowCells[i], 0);

              break fromRowLoop;
            }
          }
        }//End to loop

      }//End from loop

    },

    decreaseRowSpan: function(options) {
      this.setTableElement(options);

      var fromCell = options.cell,
          fromCellIndex = Element.previousSiblings(fromCell).length,
          fromRow = Element.up(fromCell, 'tr'),
          fromRowIndex = Element.previousSiblings(fromRow).length,
          fromCellColSpan = this.getColSpan(fromCell),
          fromCellRowSpan = this.getRowSpan(fromCell),
          fromRowOffset = Element.select(fromRow, 'td[rowspan], th[rowspan]').length - 1 || 0,
          toRow = Element.select(this.getTableBody(), 'tr')[fromRowIndex + fromCellRowSpan - 1],
          toRowCells = Element.select(toRow, 'td, th'),
          toRowCellCount = 0,
          toRowNewCell = null;

      if (fromCellRowSpan === 1) return false;

      Element.writeAttribute(fromCell, {rowspan: fromCellRowSpan - 1});

      outer: 
      for (var i = 0, l = toRowCells.length; i < l; i++) {

        toRowCellCount+=this.getColSpan(toRowCells[i]);

        if (toRowCellCount + fromRowOffset >= fromCellIndex) {
          toRowNewCell = new Element(toRowCells[i].tagName);

          if (fromCellColSpan > 1) 
            Element.writeAttribute(toRowNewCell, {colspan: fromCellColSpan});

          if (fromCellIndex > 0) 
            Element.insert(toRowCells[i], {after: toRowNewCell});
          else
            Element.insert(toRowCells[i], {before: toRowNewCell});

          break outer;
        }
      }
    }
    
  }

})(); 


/*
 * LiquidMetal, version: 0.1 (2009-02-05)
 *
 * A mimetic poly-alloy of Quicksilver's scoring algorithm, essentially
 * LiquidMetal.
 *
 * For usage and examples, visit:
 * http://github.com/rmm5t/liquidmetal
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2009, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
var LiquidMetal = function() {
  var SCORE_NO_MATCH = 0.0;
  var SCORE_MATCH = 1.0;
  var SCORE_TRAILING = 0.8;
  var SCORE_TRAILING_BUT_STARTED = 0.9;
  var SCORE_BUFFER = 0.85;

  return {
    score: function(string, abbreviation) {
      // Short circuits
      if (abbreviation.length == 0) return SCORE_TRAILING;
      if (abbreviation.length > string.length) return SCORE_NO_MATCH;

      var scores = this.buildScoreArray(string, abbreviation);

      var sum = 0.0;
      for (var i =0; i < scores.length; i++) {
        sum += scores[i];
      }
     
      return (sum / scores.length);
    },

    buildScoreArray: function(string, abbreviation) {
      var scores = new Array(string.length);
      var lower = string.toLowerCase();
      var chars = abbreviation.toLowerCase().split("");

      var lastIndex = -1;
      var started = false;
      for (var i =0; i < chars.length; i++) {
        var c = chars[i];
        var index = lower.indexOf(c, lastIndex+1);
        if (index < 0) return fillArray(scores, SCORE_NO_MATCH);
        if (index == 0) started = true;

        if (isNewWord(string, index)) {
          scores[index-1] = 1;
          fillArray(scores, SCORE_BUFFER, lastIndex+1, index-1);
        }
        else if (isUpperCase(string, index)) {
          fillArray(scores, SCORE_BUFFER, lastIndex+1, index);
        }
        else {
          fillArray(scores, SCORE_NO_MATCH, lastIndex+1, index);
        }

        scores[index] = SCORE_MATCH;
        lastIndex = index;
      }

      var trailingScore = started ? SCORE_TRAILING_BUT_STARTED : SCORE_TRAILING;
      fillArray(scores, trailingScore, lastIndex+1);
      return scores;
    }
  };

  function isUpperCase(string, index) {
    var c = string.charAt(index);
    return ("A" <= c && c <= "Z");
  }

   function isNewWord(string, index) {
    var c = string.charAt(index-1);
    return (c == " " || c == "\t");
  }

  function fillArray(array, value, from, to) {
    from = Math.max(from || 0, 0);
    to = Math.min(to || array.length, array.length);
    for (var i = from; i < to; i++) { array[i] = value; }
    return array;
  }
}();

var AssetInput = Class.create({
  element: null,
  select: null,
  assetContainer: null,
  selected: null,
  filterInput: null,

  initialize: function(element) {
    this.element = $(element);
    if (!this.element) return;

    if (this.element.assetInput) return;
    this.element.assetInput = true;

    this.build();
    this.setupObservers();
  },

  build: function() {
    // grab select and hide it
    this.select = this.element.down('select');
    this.select.hide();

    // create the anchors with images in them
    var anchors = '';
    this.select.childElements().each(function(el) {
      var path = el.getAttribute('data-thumb-path');
      var text = el.getAttribute('data-text');
      if (!path) return;

      anchors += '<div class="crop' + (el.selected ? ' highlighted' : '') + '">' +
                   '<a data-id="' + el.value + '" data-text="' + text + '" title="' + el.innerHTML + '" class="crop-container"><img src="' + path + '"/></a>' +
                   '<span class="controls">' +
                     '<div class="links">' +
                       '<a href="'+ el.getAttribute('data-path') + '" class="lightview" rel="image" title="' + el.innerHTML + ' ::  :: autosize: true, topclose: true">' + el.innerHTML + '</a>' +
                     '</div>' +
                   '</span>' +
                 '</div>';
    }.bind(this));

    var filterWrapper = new Element('div', {className: 'container filter'});
    this.filterInput = new Element('input', {type: 'text'});
    filterWrapper.update(this.filterInput);

    // add anchors to element
    var classNames = this.select.getAttribute('class');
    this.assetContainer = new Element('div', {id: 'asset_input_for_' + this.element.id, className: 'asset-input ' + classNames});
    this.assetContainer.insert(filterWrapper);
    this.assetContainer.insert(anchors);

    // place the new content after the select box so that it comes before the hr
    new Insertion.After(this.select, this.assetContainer);

    this.determineSelected();
    Lightview.updateViews();
  },

  cropContainers: function() {
    return this.element.select('a.crop-container');
  },

  setupObservers: function() {
    if(this.assetContainer.hasClassName('contracted')) {
      this.assetContainer.observe('click', function() {
        this.assetContainer.removeClassName('contracted');
        this.assetContainer.stopObserving('click');
      }.bind(this));
    }

    this.cropContainers().each(function(el) {
      el.observe('click', function() {
        this.selectAsset(el);
      }.bind(this));
    }.bind(this));

    this.filterInput.observe('keyup', function(e) {
      this.filter();
    }.bind(this));
  },

  filter: function() {
    var value = this.filterInput.value;
    this.cropContainers().each(function(el) {
      var text = el.getAttribute("data-text");
      var container = el.up("div.crop");
      if(!container.hasClassName("highlighted") && LiquidMetal.score(text, value) == 0) {
        container.hide();
      } else {
        container.show();
      }
    });
  }
});

var AssetSingleInput = Class.create(AssetInput, {

  determineSelected: function() {
    this.selected = this.assetContainer.down('.highlighted a');
  },

  selectAsset: function(el) {
    if (this.selected) {
      this.deselectAsset(this.selected);
      if (this.selected == el) {
        this.selected = null;
        return;
      }
    }

    this.selected = el;
    el.up("div.crop").addClassName('highlighted');
    this.syncToSelect();
  },

  deselectAsset: function(el) {
    el.up("div.crop").removeClassName('highlighted');
    this.syncToSelect();
  },

  syncToSelect: function() {
    if(this.selected == null) {
      this.select.value = '';
    } else {
      this.select.value = this.selected.getAttribute('data-id');
    }
  }
});

var AssetMultipleInput = Class.create(AssetInput, {
  selected: [],

  determineSelected: function() {
    var selected = this.select.getValue();
    selected = (typeof(selected) != 'string') ? selected : [selected];
    selected.each(function(value) {
      var asset = this.element.down("a[data-id='" + value + "']");
      this.selected.push(asset);
    }.bind(this));
  },

  selectAsset: function(el) {
    if (this.selected.include(el)) {
      this.deselectAsset(el);
    } else {
      el.up("div.crop").addClassName('highlighted');
      this.selected.push(el);
    }

    this.syncToSelect();
  },

  deselectAsset: function(el) {
    el.up("div.crop").removeClassName('highlighted');
    this.selected = this.selected.without(el);
    this.selected = this.selected.without(el);

    this.syncToSelect();
  },

  syncToSelect: function() {
    var values = this.selected.inject([], function(a, el) {
      a.push(el.getAttribute("data-id"));
      return a;
    });
    this.select.setValue(values);
  }
});
