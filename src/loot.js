
(function() {

	// language shims -------------------------------------------

	// Extend the String prototype to include a splice method.
	// This will use an Array-based splitting / joining approach
	if (!("splice" in String.prototype)) {
		String.prototype.splice = function(index, howManyToDelete, stringToInsert) {

			var characterArray = this.split("");

			Array.prototype.splice.apply(characterArray, arguments);

			return characterArray.join("");
		};
	}

	if(!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g,'');
		};
	}

	if (!Object.keys) {
		Object.keys = function(o) {
			var keys=[], p;

			if (o !== Object(o)) {
				throw new TypeError('Object.keys called on non-object');
			}

			for(p in o) {
				if(Object.prototype.hasOwnProperty.call(o,p)) {
					keys.push(p);
				}
			}

			return keys;
		};
	}


	// basic types -------------------------------------------------------
	// stolen wholesale from underscore

	// Is a given value a number?
	var $isNumber = function(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	};

	// Is a given array or object empty?
	var $isEmpty = function(obj) {
		if ($isArray(obj) || $isString(obj)) return obj.length === 0;
		for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
		return true;
	};

	// Is a given value a DOM element?
	var $isElement = function(obj) {
		return (obj && obj.nodeType == 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	var $isArray = Array.isArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};

	// Is a given value a function?
	var $isFunction = function(obj) {
		return (obj && obj.constructor && obj.call && obj.apply);
	};

	// Is a given value a string?
	var $isString = function(obj) {
		return (obj === '' || (obj && obj.charCodeAt && obj.substr));
	};

	// Is a given value a number?
	var $isNumber = function(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	};

	// Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
	// that does not equal itself.
	var $isNaN = function(obj) {
		return obj !== obj;
	};

	// Is a given value a boolean?
	var $isBoolean = function(obj) {
		return obj === true || obj === false;
	};

	// Is the given value a regular expression?
	var $isRegExp = function(obj) {
		return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
	};

	// array -------------------------------------------------------
	var arrayProto = Array.prototype;


	// the underscore each function
	var $each = (function() {

		// switched breaker to string "break" for better self documentation when used
		var breaker = "break",
			nativeForEach = Array.prototype.forEach,
			hasOwnProperty = Object.prototype.hasOwnProperty;

		var each = function(obj, iterator, context) {
			if (obj == null) return;

			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);

			} else if ($isNumber(obj.length)) {
				for (var i = 0, l = obj.length; i < l; i++) {
					if (iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				for (var key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			}
		};

		each.breaker = breaker;
		each.nativeForEach = nativeForEach;
		each.hasOwnProperty = hasOwnProperty;

		return each;

	}());
	

	var nativeMap = arrayProto.map;

	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native "map" if available.
	var $map = function(obj, iterator, context) {

		var results = [];

		if (obj == null) {
			return results;
		}

		if (nativeMap && obj.map === nativeMap) {
			return obj.map(iterator, context);
		}

		$each(obj, function(value, index, list) {
			results[results.length] = iterator.call(context, value, index, list);
		});

		if (obj.length === +obj.length) {
			results.length = obj.length;
		}
		return results;
	};


	var nativeSome = Array.prototype.some;

	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native "some" if available
	var $any = function(obj, iterator, context) {
		var result = false;

		if (nativeSome && obj.some === nativeSome) {
			return obj.some(iterator, context);
		}

		each(obj, function(value, index, list) {
			// note: intentional assignment in the if
			if (result = iterator.call(context, value, index, list)) {
				return "break";
			}
		});

		return !!result;
	};

	// Return all the elements for which a truth test passes.
	var $find = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		$each(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) results.push(value);
		});
		return results;
	};

	// Return all the elements for which a truth test fails.
	var $reject = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		$each(obj, function(value, index, list) {
			if (!iterator.call(context, value, index, list)) results[results.length] = value;
		});
		return results;
	};

	var $length = function(item) {
		var len = item.length;
		if (!$isNumber(len)) {
			len = 0;
			$each(item, function(){len++});
		}
		return len;
	};

	var $sliceIt = function(obj, start, end) {
		return Array.prototype.slice.call(obj, start || 0, end);
	};

	// flatten arrays recursively
	function $flat() {
		var flatArray = arrayProto.concat.apply(arrayProto, arguments);
		return $any(flatArray, $isArray) ? $flat.apply(this, flatArray) : flatArray;
	}

	// object -------------------------------------------------------
	
	// use the same constructor every time to save on memory usage per
	// http://oranlooney.com/functional-javascript/
	function F() {}

	var $new = function(prototype, ignoreInit) {

		F.prototype = prototype || {};

		var newInstance = new F();

		if(!ignoreInit && newInstance.init) {

			// support single init functions or arrays of them
			var inits = $find($flat(newInstance.init), $isFunction);

			// fix any uglyness that may have come through in the inits array
			newInstance.init = (inits.length > 1) ? inits : inits[0];

			// call the init methods using the new object for "this"
			$each(inits, function(fn) {
				fn.call(newInstance);
			});
		}

		return newInstance;
	};

	/**
	 * serves as a utility method for deepCopy and deepMerge
	 * @param source (object) the object to copy properties from
	 * @param target (object) optional object to merge source's properties into
	 * @param filter (function) optional function(key, source, target) { return boolean; }
	 *  the filter function returns true if a property should be copied and false if it should be ignored
	 *  filter can also be provided as the last of two arguments when omitting a target
	 *  filter example: to deep copy only owned properties from objA to objB
	 *  	$deepCopy(objA, objB, function(key, source) {
	 *  		return source.hasOwnProperty(key);
	 *  	});
	 */
	function copy(source, target, filter) {
		var key, sourceProp, targetProp,
			targetType = typeof target;

		if (typeof source != 'object') {
			throw new Error("copy source must be an object");
		}

		// support (source, filter) signature
		if (arguments.length === 2 && targetType === "function") {
			filter = target;
			target = {};
		} else {
			filter = ($isFunction(filter)) ? filter : false;
			target = (targetType === "object") ? target : {};
		}

		for (key in source) {

			// skip this property if filter returns false
			if (filter && !filter(key, source, target)) {
				continue;
			}

			sourceProp = source[key];

			// Prevent infinite loop
			if (sourceProp === target) {
				continue;
			}

			if (typeof sourceProp === 'object') {
				targetProp = $isArray(sourceProp) ? [] : {};
				target[key] = copy(sourceProp, targetProp, filter);

			// don't copy undefined values
			} else if (sourceProp !== undefined) {
				target[key] = sourceProp;
			}
		}

		return target;
	}

	var $deepCopy = function(source, filter) {
		if (filter && !$isFunction(filter)) {
			throw new Error("$deepCopy: Optional second argument (filter) must be a function. Instead saw " + typeof filter);
		}
		return copy(source, filter);
	};

	var $deepMerge = function(target, source, filter) {
		if (!target || !source) {
			throw new Error("$deepMerge: First two arguments (target, source) are required and must be enumerable. Instead saw (" + typeof target +", "+ typeof source +")");
		}

		if (filter && !$isFunction(filter)) {
			throw new Error("$deepMerge: Optional third argument (filter) must be a function. Instead saw " + typeof filter);
		}
		return copy(source, target, filter);
	};

	/**
	 * $extend augments the first object with shallow copies of
	 * all other objects including their inherited properties
	 * @param target (object) an object to augment
	 * Remaining parameters may be object/s or array/s of objects
	 * all of the following are valid
	 * $extend(object, object)
	 * $extend(object, object, object, object)
	 * $extend(object, [object])
	 * $extend(object, [object, object, object])
	 * $extend(object, object, [object, object], object)
	 */
	var $extend = function(target) {
		if (target) {
			// accept objects or arrays of objects
			var sources = [].concat($sliceIt(arguments, 1));

			$each(sources, function(source) {
				for (var prop in source) {
					target[prop] = source[prop];
				}
			});
		}

		return target;
	};

	/**
	 * $mixin augments the first object with deep copies of
	 * all other objects excluding their inherited properties
	 * @param target (object) an object to augment
	 * Remaining parameters may be object/s or array/s of objects
	 * all of the following are valid
	 * $mixin(object, object)
	 * $mixin(object, object, object, object)
	 * $mixin(object, [object])
	 * $mixin(object, [object, object, object])
	 * $mixin(object, object, [object, object], object)
	 */
	var $mixin = function(target) {
		if(target) {
			var sources = [].concat($sliceIt(arguments, 1));

			// accept objects or arrays of objects
			$each(sources, function(source) {
				var prop;
				for (prop in source) {
					// do a deep copy that excludes any inherited properties at any level
					$deepMerge(target, source, function(key, source) {
						return source.hasOwnProperty(key);
					});
				}
			});
		}

		return target;
	};

	/**
	 * make new objects like a pro
	 * @param prototype
	 * @param extender/s
	 * @param mixin/s
	 * @author ATL
	 */
	var $make = function(prototype, extender, mixin) {

		mixin = mixin || {};

		var myProto = $new(prototype, true),
			// we allow extender and mixin to be arrays of objects so lets flatten them out for easy traversal
			parts = [].concat(myProto, extender, mixin),
			inits = [],
			forceOverwrite = true, // for self documentation
			makeSpeaker;

		$each(parts, function(part) {
			var init = part ? part.init : null;

			// compile an array of init functions
			if (init) {
				inits.push(init);
			}

			// flatten so that init can be a function or an array of functions
			// we
			inits = $find($flat(inits), $isFunction);

			// makeSpeaker is any of our parts a speaker?
			if ($isSpeaker(part)) {
				makeSpeaker = true;
			}
		});

		// $extend does a shallow copy including inherited properties
		if (extender) {
			$extend(myProto, extender);
		}

		// $mixin does a deep copy excluding inherited properties
		if (mixin) {
			$mixin(myProto, mixin);
		}

		// if any objects were speakers then make the new object speak as well and
		// forceOverwrite so we don't copy or inherit _listeners and _audience
		if (makeSpeaker) {
			$speak(myProto, forceOverwrite);
		}

		// message sharing
		var shares = myProto.shareMessages;
		if (shares && !myProto.dontShareMessages) {
			if (shares === true) {
				myProto.listensTo(prototype);
				myProto.listensTo(extender);
			} else if (shares == "prototype") {
				myProto.listensTo(prototype);
			} else if (shares == "extender") {
				myProto.listensTo(extender);
			}
			myProto.shareMessages = true;
		} else if (myProto.dontShareMessages && myProto.shareMessages) {
			// lets be consistent
			myProto.shareMessages = false;
		}

		// call the init methods using the new object for "this"
		$each(inits, function(fn) {
			fn.call(myProto);
		});

		// init is either a single function or an array of functions
		myProto.init = (inits.length > 1) ? inits : inits[0];

		return myProto;
	};


	// date/time -------------------------------------------------------

	var $now = function() {
		return new Date().getTime();
	};

	/* $timeAgo
	/*
	 * Javascript Humane Dates
	 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
	 * Re-write by Zach Leatherman (zachleat.com)
	 *
	 * Adopted from the John Resig's pretty.js
	 * at http://ejohn.org/blog/javascript-pretty-date
	 * and henrah's proposed modification
	 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
	 *
	 * Licensed under the MIT license.
	 */

	// modified by andrew luetgers to accept timestamps

	var $timeAgo = function(date, compareTo) {

		function normalizeDateInput(date) {
			switch (typeof date) {

				case "string":
					date = new Date(('' + date).replace(/-/g,"/").replace(/[TZ]/g," "));
					break;

				case "number":
					date = new Date(date);
					break;
			}

			return date;
		}

		var lang = {
				ago: 'Ago',
				now: 'Just Now',
				minute: 'Minute',
				minutes: 'Minutes',
				hour: 'Hour',
				hours: 'Hours',
				day: 'Day',
				days: 'Days',
				week: 'Week',
				weeks: 'Weeks',
				month: 'Month',
				months: 'Months',
				year: 'Year',
				years: 'Years'
			},
			formats = [
				[60, lang.now],
				[3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
				[86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
				[604800, lang.day, lang.days, 86400], // 7 days, 1 day
				[2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
				[31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
				[Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
			],
			isString = typeof date == 'string',
			date = normalizeDateInput(date),
			compareTo = normalizeDateInput(compareTo || new Date),
			seconds = (compareTo - date +
						(compareTo.getTimezoneOffset() -
							// if we received a GMT time from a string, doesn't include time zone bias
							// if we got a date object, the time zone is built in, we need to remove it.
							(isString ? 0 : date.getTimezoneOffset())
						) * 60000
					) / 1000,
			token;

		if(seconds < 0) {
			seconds = Math.abs(seconds);
			token = '';
		} else {
			token = ' ' + lang.ago;
		}

		/*
		 * 0 seconds && < 60 seconds        Now
		 * 60 seconds                       1 Minute
		 * > 60 seconds && < 60 minutes     X Minutes
		 * 60 minutes                       1 Hour
		 * > 60 minutes && < 24 hours       X Hours
		 * 24 hours                         1 Day
		 * > 24 hours && < 7 days           X Days
		 * 7 days                           1 Week
		 * > 7 days && < ~ 1 Month          X Weeks
		 * ~ 1 Month                        1 Month
		 * > ~ 1 Month && < 1 Year          X Months
		 * 1 Year                           1 Year
		 * > 1 Year                         X Years
		 *
		 * Single units are +10%. 1 Year shows first at 1 Year + 10%
		 */

		function normalize(val, single) {
			var margin = 0.1;
			if(val >= single && val <= single * (1+margin)) {
				return single;
			}
			return val;
		}

		for(var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
			if(seconds < format[0]) {
				if(i === 0) {
					// Now
					return format[1];
				}

				var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
				return val +
						' ' +
						(val != 1 ? format[2] : format[1]) +
						(i > 0 ? token : '');
			}
		}
	};


	// messaging -------------------------------------------------------

	// API note
	// the optional selectiveHearing property added to a speaker is a
	// function with the same signature as any responder. the selectiveHearing
	// function serves as a truth-test, if it returns truthy the message
	// will be listened to otherwise it's ignored

	var $speak = (function() {

		var aSpeaker = {

			/** tell
			 * @param topic (string) the topic of the message, listeners can filter messages base on their topic
			 * @param message (anything) optional - a value passed to the listeners
			 * @param speaker (speaker) optional - listeners will be told the origin of the messages they receive
			 * here oyu can override that value, you should not need to use this
			 */
			tell: function(topic, message, speaker) {



				if ($isString(topic) && (!$isFunction(this.selectiveHearing) || this.selectiveHearing(message, topic, speaker || this))) {
					var that = this;

					// fire the listeners
					$each(this._listeners, function(listener) {
						var lTopic = listener.topic,
							lTopicRe = listener.topicRe;

						if (lTopic === topic || topic.match(lTopicRe) ) {
							listener.responses++;

							// stopListening if we hit our maxResponses
							if ($isNumber(listener.maxResponses) && listener.responses >= listener.maxResponses) {
								that.stopListening(listener);
							}

							// fire the responder within the currently bound scope
							listener.responder.call(that, message, topic, speaker || that);
						}
					});

					// tell the audience
					$each(this._audience, function(member) {
						member.tell(topic, message, speaker || that);
					});
				}
				return this;
			},

			/** listen
			 * @param topic (string|regex) will call the given responder if received topic === topic parm
			 * or in the case of a regex topic param if the receivedTopic.match(topicParam)
			 * @param responder (function) having the signature function(message, topic, originalSpeaker)
			 * @param maxResponses (number) optional - number of times the responder will be called before being removed
			 */
			listen: function(topic, responder, maxResponses) {

				var topicIsRegExp, topicIsString,
					responderIsFunction = $isFunction(responder),
					that = this;

				// dont test for regex topic if we don't need to
				(topicIsString = $isString(topic)) || (topicIsRegExp = $isRegExp(topic));

				// call self for each function if given a map of callbacks instead of a single function
				// the way this works is the callback names are appended to the topic string
				// then a regex is created from the new topic string for a starts-with match
				if (responder && !responderIsFunction && topicIsString) {
					$each(responder, function(val, key) {
						if ($isFunction(val)) {
							var re = new RegExp("^" + topic + key);
							that.listen(re, val, maxResponses);
						}
					});
					return false;
				}

				if ((topicIsString || topicIsRegExp) && responderIsFunction) {

					// dont add something twice
					var alreadySet;

					$each(this._listeners, function(listener) {
						if(listener.topic === topic  && listener.responder === responder) {alreadySet = true;}
					});

					if (!alreadySet) {
						this._listeners.push({
							topicRe: topicIsRegExp ? topic : new RegExp("^" + topic + "(\\[*|:*|$)"),
							topic: topic,
							responder: responder,
							responses: 0,
							maxResponses: maxResponses
						});
					}

					return this;

				} else {
					throw new Error("listen: invalid arguments");
				}
			},

			/** stopListening
			 * @param ignoreable (string|function) optional - remove listeners
			 * if a string is passed all listeners to that topic will be removed
			 * if a function is passed all listeners using that responder will be removed
			 * if nothing is provided all listeners will be removed
			 */
			stopListening: function(ignoreable) {
				if($isString(ignoreable)) {
					this._listeners = $reject(this._listeners, function(listener) {
						return (listener.topic === ignoreable);
					});
				} else if(ignoreable) {
					this._listeners = $reject(this._listeners, function(listener) {
						return (listener.responder === ignoreable);
					});
				} else {
					this._listeners = [];
				}
				return this;
			},

			/** talksTo
			 * @param speaker (object|function|array) - !!will make the provided object a speaker if it is not already
			 * @description will forward all messages to the provided speaker by adding it to our _audience
			 */
			talksTo: function(speaker) {
				if (this !== speaker && this._audience.indexOf(speaker) === -1) {
					this._audience.push($speak(speaker));
				}
				return this;
			},

			/** listensTo
			 * @param speaker (speaker)
			 * @description all messages sent to speaker will be forwarded to us
			 *
			 */
			listensTo: function(speaker) {
				if ($isSpeaker(speaker) && speaker._audience.indexOf(this) === -1 && speaker !== this) {
					speaker._audience.push(this);
				}
				return this;
			}

			// the following properties are added when the speaker is created
			// this prevents the risk of them being shared across speakers
			// _listeners: [],
			// _audience: []
		};

		aSpeaker.on = aSpeaker.listen;
		aSpeaker.emit = aSpeaker.tell;

		// lets not on't copy the larger functions all over
		aSpeakerFacade = {};
		$each(aSpeaker, function(val, key) {
			aSpeakerFacade[key] = function() {
				return val.apply(this, $sliceIt(arguments));
			}
		});

		// return just the newSpeaker function;
		return function(obj, overwrite) {
			if (obj && !overwrite && obj.hasOwnProperty("_listeners") && obj.hasOwnProperty("_audience")) {
				// already a publisher, do noting
				return obj;
			}

			if (!obj) {
				// looks like we are starting a new speaker from scratch so
				// we can create a more memory-friendly prototypal clone of aSpeaker
				obj = $make(aSpeakerFacade, {_listeners: [], _audience: []});

			} else {
				// can't use a prototypal clone so we augment obj via shallow copy instead
				obj = $extend(obj, aSpeakerFacade, {_listeners: [], _audience: []});
			}

			return obj;
		};

	})();

	var $isSpeaker = function(obj) {
		return !!(obj && $isFunction(obj.tell) && $isArray(obj._listeners));
	};


	// models -------------------------------------------------------

	var schemaBank = {};

	var modelApiGet = function(mVals, key) {
		var len = arguments.length;
		if (len == 2 && $isString(key)) {
			return mVals[key];

		} else if (len > 2 || $isArray(key)) {
			var set = {}, keys = $flat($sliceIt(arguments, 1));
			$each(keys, function(k) {
				if (k in mVals) {
					set[k] = mVals[k];
				}
			});
			return set;

		} else {
			return mVals;
		}
	};

	var modelApiSet = function(mVals, key, val) {
		var change = {};

		if ($isString(key)) {
			mVals[key] = val;
			change[key] = val;

		} else if (arguments.length == 2) {
			// normal update
			change = key;
			$each(change, function(v, k) {
				mVals[k] = v;
			});
		}

		this.tell("change", change);
		return this;
	};

	// define a type of object or data model
	$schema = function(type, options) {
		var existingModel = schemaBank[type];

		// schema getter
		if (type && arguments.length === 1 && existingModel) {
			return existingModel;

		// schema constructor
		} else if (type && !existingModel) {
			options = $deepCopy(options || {});
			options.defaults = options.defaults || {};

			var schema = $speak({
				type: type,
//				validation: 	options.validation || {},
//				retain: 		options.retain || false,
				destroy:		function() {
					var oldModel = schemaBank[type];
					delete schemaBank[type];
					return {
						destroyed: 	type,
						was:		oldModels
					}
				},
				// instance api
				getModel: function(vals) {
					var modelVals = $deepCopy(options.defaults);
					var modelProto = $speak($new(options));
					var model = $mixin(modelProto, {
						type: type,
						// facade here allows us to have a unique closure for model
						// without having new instances taking up memory for the larger get/set functions
						get: function(key) {
							return modelApiGet.apply(this, $flat(modelVals, $sliceIt(arguments)));
						},
						set: function(key, val) {
							return modelApiSet.apply(this, $flat(modelVals, $sliceIt(arguments)));
						}
					});

					// all model events are forwarded to their parent schema
					model.talksTo(this);

					// take our initial values and apply them dependant upon silently or with set
					vals = ($isBoolean(vals) || $isString(vals)) ? undefined : vals;

					if (vals) {
						$mixin(modelVals, vals);
					}

					return model;
				}
			});

			schemaBank[type] = schema;

		// error
		} else {
			return new Error("Error: valid model name required.");
		}
	};

	$model = function(type, vals) {
		var schema = schemaBank[type];

		if (!type || !$isString(type) || !schema) {
			throw new Error("$model: valid type string required");
		} else if (vals && ($isArray(vals) || $isString(vals) || $isBoolean(vals) || $isFunction(vals) || $isRegExp(vals)|| $isNumber(vals))) {
			throw new Error("$model: valid values object required");
		} else {
			return schema.getModel(vals);
		}
	};



	// trim string -------------------------------------------------------
	// type agnostic string trim, just returns the original val if its not a string
	var $trim = function(str) {
		if ($isString(str)) {
			return str.trim();
		} else {
			return str;
		}
	};


	// dom -------------------------------------------------------
	var $id = function(id) {
		return document.getElementById(id);
	};

	// template -------------------------------------------------------
	// a slightly modded version of underscore template
	// see init
	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	var $tmpl = (function() {

		// create the regexes only once
		var evaluate = 		/<\$([\s\S]+?)\$>/g,
			interpolate = 	/\<\$=\{([\s\S]+?)\$>/g,
			bslash =		/\\/g,
			squote = 		/'/g,
			esquote =		/\\'/g,
			toSpace =		/[\r\n\t]/g,
			retrn =			/\r/g,
			newln =			/\n/g,
			tab =			/\t/g,
			space = 		/\s/g;

		// the template function
		var template = function(str, data) {
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
					'with(obj||{}){__p.push(\''
					+ str.replace(bslash, '\\\\')
					.replace(squote, "\\'")
					.replace(interpolate, function(match, code) {
						return "'," + code.replace(esquote, "'") + ",'";
					})
					.replace(evaluate || null, function(match, code) {
						return "');" + code.replace(esquote, "'").replace(toSpace, ' ') + "__p.push('";
					})
					.replace(retrn, '\\r')
					.replace(newln, '\\n')
					.replace(tab, '\\t')
					+ "');}return __p.join('');";

			// the compiled template
			var func = new Function('obj', tmpl);

			// return a processed template if provided data
			// else return a complied reusable template render function
			return data ? func(data) : func;
		};


		// will compile a template for innerHTML of elem with id=t
		// if given a string like "myTemplate, myOtherTemplate, someTemplate"
		// will return a hash of compiled templates using the ids for keys
		template.compile = function(t) {

			if ($isString("string")) {

				var ts = t.replace(space, "").split(","),
					len = ts.length,
					compiled = {},
					id;

				for (var i=0; i<len; i++) {
					id = ts[i];
					compiled[id] = template($id(id).innerHTML);
				}

				return (len == 1) ? compiled[id] : compiled;

			} else {
				throw new Error("Expected a string, saw "+ typeof t);
			}
		};

		return template;

	}());



	// hyper-simplistic dom node api for html string building
	var $node = (function() {

		var directProperties = {className:'class', htmlFor:'for'};
		var selfClosing = {area:1, base:1, basefont:1, br:1, col:1, frame:1, hr:1, img:1, input:1, link:1, meta:1, param:1};

		// children toString should not include commas
		var childrenToString = function() {
			var str = "";
			$each(this, function(val) {
				str += $isString(val) ? $escapeHTML(val) : val;
			});
			return str;
		};

		var node = {
			init: function() {
				this.type = "div";
				this.attr = {};
				this.children = [];
				this.children.toString = childrenToString;

				// for compatability with $el dom builder in outputStrings mode
				this.appendChild = this.append;
				this.removeAttribute = this.setAttribute = this.set;
			},
			append: function(nodes) {
				// no we don't do validation here, so sue me
				// this will handle a single node or an array of nodes or a mixed array of nodes and arrays of nodes
				var argsArray = $flat(this.children.length, 0, nodes);
				this.children.splice.apply(this.children, argsArray);
				return this;
			},
			set: function(key, value) {
				if (key) {
					if (!$isString(key)) {
						// assume key is a hash of key value pairs to be added in to existing attr hash
						var spec = key, that = this;
						$each(spec, function(val, theKey) {
							that.set(theKey, val);
						});
					} else {
						// simple key value assignment
						if (value !== null && value !== undefined && value !== "") {
							// add/edit attribute
							// support alternate attribute names
							key = directProperties[key] || key;
							this.attr[key] = value;
						} else {
							// remove the attribute
							delete this.attr[key];
						}
					}
				}
				return this;
			},
			toString: function() {
				var str = "<" + this.type;
				$each(this.attr, function(val, key) {
					str += ' ' + key + '="' + val + '"';
				});

				if (selfClosing[this.type]) {
					return str + "/>";
				} else {
					return str + ">" + this.children + "</" + this.type + ">";
				}
			}
		};

		return function(type) {
			// use new to reduce memory footprint for many nodes
			var n = $new(node);
			n.type = type || "div";
			return n;
		};

	}());

	// for compatibility with $el dom builder in outputStrings mode
	var $doc = {
		createTextNode: function(str) {
			return str;
		},
		createElement: $node
	};


	// dom builder see: http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
	// modified to support dom node ouput or string output, for server land
	var $el = (function () {
		var doc = document;

		var directProperties = {
			'class': 'className',
			className: 'className',
			defaultValue: 'defaultValue',
			'for': 'htmlFor',
			html: 'innerHTML',
			text: 'textContent',
			value: 'value'
		};

		var booleanProperties = {
			checked: 1,
			defaultChecked: 1,
			disabled: 1,
			multiple: 1,
			selected: 1
		};

		var setProperty = function (el, key, value) {
			var prop = directProperties[key];
			if (prop) {
				el[prop] = (value == null ? '' : '' + value);
			} else if (booleanProperties[key]) {
				el[key] = !!value;
			} else if ( value == null ) {
				el.removeAttribute( key );
			} else {
				el.setAttribute(key, '' + value);
			}
		};

		var appendChildren = function (el, children) {
			var fragment = document.createDocumentFragment();
			if($isArray(children)) {
				$each(children, function(node) {
					if (node) {
						if ($isArray(node)) {
							appendChildren(el, node);
						} else {
							if ($isString(node)) {
								node = doc.createTextNode(node);
							}
							fragment.appendChild(node);
						}
					}
				});
				el.appendChild(fragment);
			} else {
				throw new Error("Error: appendChildren ws expecting an array but saw "+ typeof el);
			}
		};

		var splitter = /(#|\.)/;

		var create = function(tag, props, children) {

			var parts, name, tag, len, el, i, j, l, prop,
				outputstrings = !!(doc == $doc);

			// support (tag, children) signature
			if ($isArray(props)) {
				children = props;
				props = null;
			}

			parts = tag.split(splitter);
			tag = parts[0];
			len = parts.length;

			if (len > 2) {
				if (!props) {
					props = {};
				}

				for (i=1, j=2, l=len; j<l; i+=2, j+=2) {
					name = parts[j];
					if (parts[i] === '#') {
						props.id = name;
					} else {
						props.className = props.className ? props.className + ' ' + name : name;
					}
				}
			}

			el = doc.createElement(tag);
			
			if (!outputstrings && props) {
				for (prop in props) {
					setProperty(el, prop, props[prop]);
				}
			} else if (outputstrings) {
				el.set(props);
			}

			if (!outputstrings && children) {
				appendChildren(el, children);
			} else if (outputstrings && children) {
				el.append(children);
			}
			return el;
		};

		create.outputStrings = function(outputStrings) {
			if (!outputStrings) {
				doc = document;
			} else {
				doc = $doc;
			}
		};

		return create;

	}());


	// escapeHTML -------------------------------------------------------
	// from backbone.js
	var $escapeHTML = (function() {

		// create the regexes only once
		var amp = 		/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,
			lt = 		/</g,
			gt = 		/>/g,
			quot = 		/"/g,
			squot = 	/'/g,
			fslash = 	/\//g;

		// the escape function
		return function(string) {
			return string.replace(amp, '&amp;').replace(lt, '&lt;').replace(gt, '&gt;').replace(quot, '&quot;').replace(squot, '&#x27;').replace(fslash,'&#x2F;');
		};
	}());



	// ------------------------------- exports -------------------------------
	var _scope;

	var lootedUp = false;

	var loot = function(scope) {
		loot.fn(scope);
	};

	loot.fn = function(scope) {
		// make our public methods enumerable
		var returnScopedMethods = false;

		if (!scope) {
			returnScopedMethods = true;
			_scope = {};
		} else {
			_scope = scope;
		}

		var oldValues = {};

		$each(this.exports, function(value, key) {
			// protect old values
			var oldValue = _scope[key];
			if (oldValue) {
				oldValues[key] = oldValue;
			}
			_scope[key] = value;
		});

		this.oldValues = oldValues;

		lootedUp = true;

		if (returnScopedMethods) {
			return _scope;
		}
	};

	loot.exports = {

		// types
		$isNumber: $isNumber,
		$isEmpty: $isEmpty,
		$isElement: $isElement,
		$isArray: $isArray,
		$isFunction: $isFunction,
		$isString: $isString,
		$isNaN: $isNaN,
		$isBoolean: $isBoolean,
		$isRegExp: $isRegExp,

		// collections
		$each: $each,
		$map: $map,
		$any: $any,
		$find: $find,
		$reject: $reject,
		$length: $length,
		$sliceIt: $sliceIt,
		$flat: $flat,

		// objects
		$new: $new,
		$deepCopy: $deepCopy,
		$deepMerge: $deepMerge,
		$extend: $extend,
		$mixin: $mixin,
		$make: $make,

		// time
		$now: $now,
		$timeAgo: $timeAgo,

		// messaging
		$speak: $speak,
		$isSpeaker: $isSpeaker,

		// models
		$define: $schema,
		$schema: $schema,
		$model: $model,

		// string
		$trim: $trim,

		// html
		$id: $id,
		$tmpl: $tmpl,
		$node: $node,
		$el: $el,
		$escapeHTML: $escapeHTML
	};

	loot.addExport = function(name, obj) {
		if(this.exports[name]) {
			throw new Error("dude... really? " + name + "is already taken, weak.");
		}

		this.exports[name] = obj;

		if (_scope && _scope[name]) {
			this.oldValues[name] = _scope[name];
		}

		if (lootedUp) {
			_scope[name] = obj;
		}
	};

	loot.extend = function(name, obj) {

		if (typeof name == "string") {
			this.addExport(name, obj);

		// handle multiple plugins if first arg is object
		} else if (arguments.length == 1 && typeof arguments[0] == "object") {
			obj = arguments[0];
			for (name in  obj) {
				this.addExport(name, obj);
			}
		}
	};

	// Establish the root object, `window` in the browser, or `global` on the server.
	if (this.loot) {
		loot.oldLoot = this.loot;
	}
	this.loot = loot;
	loot(this);
}());