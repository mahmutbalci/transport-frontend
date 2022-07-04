!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(n.ODataFilterBuilder={})}(this,function(n){"use strict";function t(n){return"function"==typeof n&&(n=n(new l)),n&&n.toString()}function r(n,t){var i,e;return void 0===t&&(t=!1),"string"!=typeof n&&(n=1===n.rules.length?r(n.rules[0]):(i=n.rules,e=n.condition,i.map(function(n){return r(n,!0)}).join(" "+e+" "))),t?"("+n+")":n}function i(n){return"function"==typeof n?n(s):n}function e(n){return"string"==typeof n?"'"+n+"'":"object"==typeof(t=n)&&"[object Date]"===Object.prototype.toString.call(t)?n.toISOString():n;var t}function o(n,t,r,o,u){return void 0===o&&(o=!0),void 0===u&&(u=!1),t=i(t),void 0===r?r=[]:Array.isArray(r)||(r=[r]),0===r.length?n+"("+t+")":(o&&(r=r.map(e)),n+"("+(u?r.concat([t]):[t].concat(r)).join(", ")+")")}function u(n,t){return o("contains",n,t)}function c(n,t){return o("startswith",n,t)}function f(n,t){return o("endswith",n,t)}var s=Object.freeze({canonicalFunction:o,contains:u,startsWith:c,endsWith:f,toLower:function(n){return o("tolower",n)},toUpper:function(n){return o("toupper",n)},trim:function(n){return o("trim",n)},substring:function(n){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return o("substring",n,r)},concat:function(n,t,r){return o("concat",n,[t],r)},length:function(n){return o("length",n)},indexOf:function(n,t){return o("indexof",n,[t])}});function d(n){var r=t(n);if(r)return"not ("+r+")"}function a(n,t,r,o){return void 0===o&&(o=!0),n=i(n),o&&(r=e(r)),n+" "+t+" "+r}function h(n,t,r){return u=n,c="eq",void 0===(s=r)&&(s=!0),e=(f=t)?(u=i(u),Array.isArray(f)?f.map(function(n){return a(u,c,n,s)}):[a(u,c,f,s)]):[],o="or",e.join(" "+o+" ");var e,o,u,c,f,s}var l=function(){function n(t){if(void 0===t&&(t="and"),!(this instanceof n))return new n(t);this._condition=t,this._source={condition:t,rules:[]}}var i=n.prototype;return i._add=function(n,r){var i,e,o;return void 0===r&&(r=this._condition),this._source=(i=this._source,e=t(n),o=r,e&&(o&&i.condition!==o&&(i={condition:o,rules:i.rules.length>1?[i]:i.rules}),i.rules.push(e)),i),this},i.and=function(n){return this._add(n,"and")},i.or=function(n){return this._add(n,"or")},i.not=function(n){return this._add(d(n))},i.eq=function(n,t,r){return this._add(a(n,"eq",t,r))},i.ne=function(n,t,r){return this._add(a(n,"ne",t,r))},i.gt=function(n,t,r){return this._add(a(n,"gt",t,r))},i.ge=function(n,t,r){return this._add(a(n,"ge",t,r))},i.lt=function(n,t,r){return this._add(a(n,"lt",t,r))},i.le=function(n,t,r){return this._add(a(n,"le",t,r))},i.in=function(n,t,r){return this._add(h(n,t,r))},i.notIn=function(n,t,r){return this._add(d(h(n,t,r)))},i.contains=function(n,t){return this._add(u(n,t))},i.startsWith=function(n,t){return this._add(c(n,t))},i.endsWith=function(n,t){return this._add(f(n,t))},i.fn=function(n,t,r,i,e){return this._add(o(n,t,r,i,e))},i.isEmpty=function(){return 0===this._source.rules.length},i.toString=function(){return r(this._source)},n}();l.and=function(){return new l("and")},l.or=function(){return new l("or")},l.functions=s,n.canonicalFunctions=s,n.ODataFilterBuilder=l,n.default=l,Object.defineProperty(n,"__esModule",{value:!0})});