# Loot.js
Underscore is cool but for some odd reason it annoys me to do _. for everything and I will never use much of
that library so I took some stuff from there and other sources and set up this to store all the little
snippets I like to use. Beware,
parts of the sauce extension are still under construction but the io module should work fine. Bugs, patches,
suggestions etc. welcome.

## Use it
First call the loot method with the object you want to attach the methods to, if you don't pass anything they
will be attached to this.

## Methods

### DOM
  * **$id** shortcut to document.getElementById
  * **$ce** shortcut to document.createElement
  * **$tpl** see underscore.js template

### Type Checking
see underscore.js

  * **$isNumber**
  * **$isEmpty**
  * **$isElement**
  * **$isArray**
  * **$isFunction**
  * **$isString**
  * **$isNaN**
  * **$isBoolean**
  * **$isRegExp**

### Collections
  * **$each** see underscore.js
  * **$any** see underscore.js (a modifid implemntation but basically the same thing)
  * **$reject** see underscore.js
  * **$length** see underscore.js
  * **$sliceIt(obj, start, end)** apply slice to a string, array or arguments object with optional start and end indexes
  * **$flat** flatten arrays recursively. Accepts any number of items. Returns an array of all values, any nested arrays are concated down to the one array.


### Objects
This is how I like to construct objects and do inheritance.

  * **$new(prototype)** optionally provide a prototype object for a new object instance. If an initialize function attribute exists it will be called then set to null.
  * **$deepCopy(source, filter)** returns a deep copy of source. Filter is called for every property with (key, source, target) if it returns true the property is copied over if it returns false the property is ignored.
  * **$deepMerge(target, source, filter)** returns a deep copy of source applied to target. Filter is called for every property with (key, source, target) if it returns true the property is copied over if it returns false the property is ignored.
  * **$extend(obj)** obj will gain shallow copies of *all* properties of all other provided objects. This allows for building objects that share properties through composition vs prototype. This can save on memory and provide information sharing.
  * **$mixin(obj)** obj will gain deep copies of 'owned' properties of all other provided objects. The 'hasOwnProperty' test is applied to all properties during the deep copy.
  * **$make(prototype, extender, mixin)** All args are optional. Extender and Mixin may each be single objects or arrays of objects. $make essentially calls $new with each of the arguments then extends prototype with extender and mixes in the mixin. Also adds support for "afterMake" functions. These functions can exist as properties on either or each of the arguments and will be called with the new object as the "this" or scope. If any of the arguments is a speaker the new object will also be a speaker. In that case care is taken to prevent copying over listeners and audiences from any of the arguments. Also see tests and source for advanced message sharing capabilities.

### Functions
  * **$buffer(fn, rateMs, scope, ignoreLastCall)** buffer the provided function so that it can not be called any faster than the specified rate of execution. This is esp. handy for drag handlers. No matter how quickly the calls are placed the last call is guaranteed to fire however it may be deferred such that the rate is not exceeded.

### Date
  * **$now** shortcut for new Date().getTime()
  * **$timeAgo(date, compareTo)** Human friendly time delta. Supports strings and numbers that can be passed to new Date() including some that can't (see source), optional compareTo value defaults to now

### Pub/Sub
  * **$speak(obj)** Creates a new speaker (pub/sub). Optionally provide an object to turn into a speaker.
    * __tell(topic, message, speaker)__ tell (publish) a message to listeners (and self). Topic can be an exact string, a begins with matching string or a regex used for matching.
    * __listen(topic, responder, maxResponses)__ listnen (subscribe) to a specific message type (expressed as a stirng) told to this speaker and fire the responder function for it. If max responses is provided responder will remove itselfe after that number of executions.
    * __stopListening(ignoreable)__ stop listening with (unsubscribe) the ignorable listener. If ignorable is expressed as a type string all listeners of that type will be removed. If a funciton is passed all listeners using that funciton will be removed.
    * __talksTo(speaker)__ messages told to this speaker will then be relayed to the provided speaker as well
    * __listensTo(speaker)__ messages told to the provided speaker will be relayed to this speaker as well
  * **$isSpeaker(obj)** returns true if the provided object is a pub/sub speaker



## Language Shims
a very short list
### String
  * **splice(index, howManyToDelete, stringToInsert)** adds splice functionality for strings
