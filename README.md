# Loot.js
Loot is a bunch of useful functions in the (gasp!) global scope, prefixed with $. Dont like that? you can inject them
into some namespace, but that would be lame. Like chaining things? Too bad don't have tons of that. Dont like using
new Blah()? Me either :-)

This is an experimental bag of tricks that is starting to look like a microframework.

## Use it
Just load up the js file/s and call the global methods. Init process will protect existing globals by making backups
under loot.oldValues.

## Not ready for production
This is experimental and minimally tested code, it also changes frequently. Docs may not be 100% up to date, check the tests and benchmarks for more usage examples.

## Methods


### Type Checking
see underscore.js

  * **$isNull**
  * **$isNaN**
  * **$isElement**
  * **$isObject**
  * **$isBoolean**
  * **$isUndefined**
  * **$isFunction**
  * **$isString**
  * **$isNumber**
  * **$isDate**
  * **$isRegExp**
  * **$isArguments**
  * **$isArray**
  * **$typof(any)** returns a string similar to that of the typeof keyword but behaves as you would expect.


### Objects
  * **$isEmpty**
  * **$has**
  * **$pick**
  * **$keys**
  * **$values** Retrieve the values of an object's properties.
  * **$new(prototype)** optionally provide a prototype object for a new object instance. If an "init" function or an
  array of init functions exist it/they will be called.
  * **$copy(source, filter)** returns a deep copy of source. Optional filter(key, source, target) is called for every
  property traversed, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$merge(target, source, filter)** returns a deep copy of source applied to target. Optional filter(key, source,
  target) is called for every property, if it returns true the property is copied over, if it returns false the
  property is ignored.
  * **$$bind** see underscore.js
  * **$extend(obj)** obj will gain shallow copies of *all* properties of all other provided objects. This allows for
  building objects that share properties through composition vs prototype. This can save on memory and provide
  information sharing.
  * **$mixin(obj)** obj will gain deep copies of 'owned' properties of all other provided objects. The
  'hasOwnProperty' test is applied to all properties during the deep copy.
  * **$make(prototype, extender, mixin)** All args are optional, extender and mixin may each be single objects or
  arrays of objects. $make calls $new on the prototype then extends it with extender and mixes in the mixin. "init"
  functions can exist as properties on any or all of the provided objects and will get called at the end with the new
  object as the "this". If any of the arguments is a speaker then the new object will also be a speaker. Also see tests
  and source for advanced message sharing capabilities.

### Collections (objects, arrays)

  * **$each** see underscore.js
  * **$for** alias of each
  * **$map** see underscore.js
  * **$reduce** see underscore.js
  * **$find** see underscore.js
  * **$filter** see underscore.js
  * **$reject** see underscore.js
  * **$every** alias of all
  * **$all** see underscore.js
  * **$any** see underscore.js (a modifid implemntation but basically the same thing)
  * **$includes** see underscore.js
  * **$contains** alias of includes
  * **$invoke** see underscore.js
  * **$max** see underscore.js
  * **$min** see underscore.js
  * **$shuffle** see underscore.js
  * **$sortBy** see underscore.js
  * **$groupBy** see underscore.js
  * **$sortedIndex** see underscore.js
  * **$size** see underscore.js
  * **$length** alias of size
  * **$compact** see underscore.js
  * **$flat** flatten arrays recursively. Accepts any number of items. Returns an array of all values, any nested
  arrays are concated down to the one array.
  * **$slice(obj, start, end)** apply slice to a string, array or arguments object with optional start and end indexes
  * **$splice(obj, start, howMany, items)** apply splice to a string, array or arguments object, accepts multiple
  arguments or an array for "items" arg
  * **$clear(obj)** deletes all properties also removes all items if obj is an array, if you want to be anal about
  deleting things here you go

### Async
  Most of this code is derived from the excellent async.js https://github.com/caolan/async, changes include different
  signatures with more information being passed around and support for objects in addition to arrays, (crazy right?)
  the multi-signature $parallel and $series functions are versitile enough that they are all you need to use.

  * **$async.each(collection, iterator, callback)** iteration happens as soon as possible (in parallel), completing in
  unknown order, fires the callback once all the done functions have been called. The first argument provided to the
  iterator function is a done function which accepts an error (anything that is non-falsey) which will cause the
  callback to be fired with the error. Arguments: collection = array or object, iterator = function(done, val, key,
  collection), callback = function(err, collection)
  * **$async.eachLimit(collection, limit, iterator, callback)** same as above except the added limit argument (number)
  defines the maximum number of parallel tasks that will happen at the same time
  * **$async.eachSeries(collection, iterator, callback)** same as $async.each but iteration happens one after the other
  (in series), completing in given order.  Arguments: same as $async.each
  * **$async.map(collection, iterator, callback)** simmilar to $async.each, iteration happens in parallel, completing
  in unknown order, instead of a done function the iterator is provided a push function where the second argument gets
  pushed into a results array. Results are available to both iterator and callback functions. Arguments: collection =
  array or object, iterator = function(push, val, key, results, collection), callback = function(err, results,
  collection)
  * **$async.mapSeries(collection, iterator, callback)** same as $async.map but iteration happens in series, completing
  in given order;
  * **$async.tasks(tasks, callback)** works like a map function calling each function in the tasks array/object, the
  first argument to each function must be called when the function is complete and can be used to pass along an error
  or push a value into results. Arguments: tasks = array of functions with the signature function(push, key, results),
  callback = function(err, results, tasks)
  * **$async.tasksSeries(tasks, callback)** same as $async.parallelTasks but tasks are executed in series, one after
  the other. Alternately if results is not used push can be called "next" omitting the second argument when calling it.
  * **$parallel** a multi-signature async swiss army knife, iteration happens in parallel, completing in unknown order.
    * **$parallel(func1, func2, ...)** this is a a fairly useless case for parallel, much more useflu in $series, each
    argument is a function(push, index, results), each function is called in order, each finishes in unknown order.
    * **$parallel(tasks, callback)** an alias for $async.tasks

    ``` javascript

        finishOrder = 0;

        var asyncFunction1 = function(push, key, results) {
          // lets do something that is async (requires a callback)
          setTimeout(function() {
            var err = null; // amazing no errors!
            push(err, "index: " + key + " Finish Order: " + finishOrder);
            finishOrder++;
          }, 100 * Math.random());
        };

        $parallel([asyncFunction1, asyncFunction1, asyncFunction1], function(err, results) {
          if(err) {
            alert("oh nohs!");
          } else {
            alert("functions finish out of order but values are inserted into corrcect locations:\n" + results.toString().replace(/,/g, "\n"));
          }
        });
    ```

    * **$parallel(collection, iterator, callback)** an alias for $async.each

    ``` javascript

        var pages = {
          google: "http://www.googl.com",
          cnn: "http://www.cnn.com",
          apple: "http://www.apple.com",
          techCrunch: "http://www.techcrunch.com",
          theVerge: "http://www.theverge.com"
        };

        var urlHasETest = function(push, url, name, results) {
          var args = arguments;
          setTimeout(function() {
            push(null, !!url.match("e"));
          }, 100*Math.random());
        };

        // collection can be objects or arrays

        $parallel(pages, urlHasETest, function(err, results) {
          if(err) {
            alert("oh nohs!");
          } else {
            var winners = $keys($reject(results, function(val) {return !val}));
            console.log(results, winners);
            alert("finished!\n" + winners.toString().replace(/,/g, "\n"));
          }
        });
    ```

    * **$parallel(collection, limit, iterator, callback)** an alias of $async.eachLimit


  * **$series** a multi-signature async swiss army knife, iteration happens in series, completing in given order.
    * **$series(func1, func2, ...)** each argument is a function(push, index, results), each function is called in
    sequence one after the other as push functions are called, alternately if "results" is not used "push" can be
    called "next" omitting the second argument when calling it.

      ``` javascript

      // call each function one after the other
      $series(
        // this fires first
        function(next) {
          // someAsyncFunction accepts a callback that it fires when complete
          someAsyncFunction(function() {
            next();
          });
        },
        // this fires once the above function calls next
        function(next) {
          // someOtherAsyncFunction accepts a callback that it fires when complete
          someOtherAsyncFunction(function() {
            next();
          });
        },
        // this fires once the above function calls next
        function() {
          // no need to call next, this is fired last
          someOtherFunction();
        },
      );
      ```

    * **$series(tasks, callback)** an alias for $async.tasksSeries
    * **$series(collection, iterator, callback)** an alias for $async.eachSeries


### Pub/Sub
  This dude is optimized to perform insanely well, compared to other frameworks with a noop it can be upto 50x faster!
  That said, add in some work and most cross-frameowrk event system performance differences quickly diminsh to the
  point of being almost meaningless. Oh well.
  There is no priority, I've never found a use for it yet, just don't go mutiating the message all over the place when
  its getting sent around to multiple handlers. See item 2 for more details http://freshbrewedcode.com/jimcowart/tag/pubsub/

  * **$speak(obj)** returns a new speaker (pub/sub). Optionally provide an object to turn into a speaker
    * __tell(topic, message, speaker)__ tell (publish) a message to listeners (and self), topic must be an exact string
    * __listen(topic, responder, maxResponses)__ listnen (subscribe) to a specific message, topic = string (can be a
    catchall "*") messages with matching topics that get told to this speaker will fire the responder function. If max
    responses is provided responder will remove itselfe after that number of executions. Responder signature:
    function(message, topic, originalSpeaker), execution scope/"this" will be the event reciever
    * __listenUntil(topic, responder, untilCondition)__ same as listen except the untilCondition function is called
    first, if it returns truthy responder is not called and will be removed. The untilCondition funtion has the same
    signature as responder functions function(message, topic, originalSpeaker), execution scope/"this" will be the
    event reciever
    * __once(topic, responder)__ semantic sugar alias of listen which uses 1 for the maxResponses argument
    * __ignore__ remove listeners from the speaker (unsubscribe) multiple signatures
      * __ignore()__ remove all subscribers
      * __ignore(topic)__ remove all listeners registered to the provided topic string.
      * __ignore(responder)__ remove all listeners using this exact responder funciton.
      * __ignore(topic, responder)__ remove all listeners registered for the provided topic using the exact same
      responder function
    * __talksTo(speaker)__ forwards messages from this speaker to the provided speaker
    * __listensTo(speaker)__ forwards messages from the provided speaker to this speaker
    * __listeningFor(topic, ignoreCatchall)__ returns an array of all responders that will fire for a given topic.
    If the optional ignoreCatchall is truthy the returned array will not include responders subscribed to the catchall
    "*". When non empty the returned arrays are the actual internal responder arrays, mess with them at your own risk!

  ``` javascript

    // create new speaker
    var agent = $speak();
    agent.name = "Mulder";

    // subscribe to an event and alert the message
    agent.listen("spookyEvent", function(msg) {
      alert(msg);
    });

    // now tell the event
    agent.tell("spookyEvent", "I want to believe.");

    // alerts "I want to believe."
  ```

  ``` javascript

    var partner = {
      name: "Scully"
    }

    // add pub sub functionality to an existing object
    $speak(partner);

    // alternatively you can combine object creation and the speak call

    var partner = $speak({
      name: "Scully"
    });


    // now lets forward all messages from agent to partner
    // there are two ways to do this, the folloing two calls are equivalent
    agent.talksTo(partner);
    // or
    partner.listensTo(agent);


    // lets use a catch-all to fire our handler on all events
    partner.listen("*", function(msg, type, originalSpeaker) {
      // the reciever of the function is bound to "this"
      alert(originalSpeaker.name + ' said: "' + msg + '" to ' + this.name + ' in a ' + type);
    });

    agent.tell("random comment", "The truth is out there!");

    // alerts 'Mulder said: "The truth is out there!" to Scully in a random comment'
  ```

  * **$isSpeaker(obj)** returns true if the provided object is a pub/sub speaker


### Models
  * **$define(type, options)** creates a schema definition (which is a speaker) with given options that will be
  associated with the given type string.

  ``` javascript

  // define a schema
  $define("person", {
    defaults: {
      first: "John",
      last: "Doe",
      fullName: function() {
        return this.first + " " +  this.last;
      }
    } 
  });
  ```

  * **$schema(type)** an alias for define which makes more sense for getter-syntax usage. Returns model constructor with the following methods.
    * __getInstances__ returns an array of all model instances based on this schema, see "$models" alias below
    * __newInstance__ returns a new model instances based on this schema, see "$model" alias below
    * __drop__ calls drop on all model instances for this schema and then removes the schema from the list of defined
    schemas

  ``` javascript

  // to delete a schema
  $schema("person").drop();
  ```

  * **$model(type, obj)** Creates a model instance of a previously defined schema with set and get methods that emits
  a "change" event. Returns a model instance with the following methods.
    * __set(key, value)__ adds key:value pair to model and emits a change event containting the changes
    * __set(object)__ adds the given keys:value pairs to the model and emits a "change" event containting the changes
    * __set(key)__ sets key to undefined
    * __get()__ returns the entire model
    * __get(key)__ returns the value of the given key on the model
    * __get(array)__ given an array of key strings returns an obect of matching key value pairs from the model
    * __drop()__ deletes all properties on this model instance, schema no longer references model instance, emits a
    "drop" event

  ``` javascript

    // referencing the person schema we defined above, we create a new intance setting some properties up front.
    var jim = $model("person", {
      first: "Jim",
      last: "Hipster"
    });

    // lets listen for a change in jim's age and alert that
    var alertAgeChange = function(changes, topic, originalSpeaker) {
      if ("age" in changes) {
        // lets grab all the values from the model
        var values = originalSpeaker.get();
        alert(values.first + "'s age set to " + changes.age);
      }
    };
  
    jim.listen("change", alertAgeChange);
  
    // all model instances talk to their schema so we can also listen for changes that happen to any person model by
    adding a change listener like so...
    $schema("person").listen("change", alertAgeChange);

    // the following will alert twice "Jim's age set to 25", firing first from the model then from the schema
    jim.set({
      first: "Jim",
      last: "Hipster",
      age: 25,
      height: "5'8\""
    });
  ```

  * **$models(type)** an alias of $schema(type).getModelInstances();
  * **$isSchema(obj)** returns true if obj is a product of $define or $schema constructors
  * **$isModel(obj)** returns true if obj is a product of $model constructor

### DOM
  * **$id** shortcut to document.getElementById
  * **$escapeHTML(html)** see backbone
  * **$el(selector, attributes, children (Array|String|Element))** a handy node builder / html string builder for
  those times you dont want to write a template or use the dom directly. Will return a dom structure unless you
  call $doc.useRealDom(false), then it will output a micro-dom api object instead. Calling toString on this object
  will return the html. See "dom instruction patterns" below for parameter definitions.
  Makes uses of http://blog.fastmail.fm/2012/02/20/buil	ding-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
  * **$el(selector, children (Array|String|Element))** same as above without attributes
  * **$el(selector)** creates an empty dom node

  ``` javascript

      var dom = $el("div.myDiv", "this is my div!");

      // by default $el outputs dom nodes
      console.log(dom, dom.toString());
      //prints: <div id="message">...</div>, [object HTMLDivElement]
  ```

  * **$doc.useRealDom(boolean)** sets the output type, defaults to false, if set to true the returned object will be
   a micro-dom api object which is used for the purposes of appending children and adding attributes. It will have a
   toString method that will return the html. This is useful in node.js when you don't want to use the more bulky js
   dom package.

  ``` javascript

		$doc.useRealDom(false);
		var items = [ 1, 2, 3, 4];
		var div2 = $el('div#message', [
			$el('a.biglink', {href: 'http://www.google.com'}, 'A link to Google'),
			$el('ul', $map(items, function(item) {
					return $el('li.item', item + '. Item');
				})
			)
		]);

		// with useRealDom == false, toString will output the html
		console.log(div2, div2.toString());
		//prints: Object, <div id="message"><a href="http://www.google.com" class="biglink">A link to Google</a><ul><li class="item">1. Item</li><li class="item">2. Item</li><li class="item">3. Item</li><li class="item">4. Item</li></ul></div>
  ```

  * **$dom(domSyntaxArray)** build dom structures or html using a simplified json syntax of nested arrays with
  selectors defining dom nodes, followed by an optional attributes object then an aray of children or a string of
  inner html. Makes use of $el so will output dom nodes or html strings depending on $doc.useRealDom(bool),
  Syntax guide follows:

    **dom instruction syntax:**

      * array    == generic container for dom instructions and children
      * string   == dom selector or inner text (see patterns below)
      * object   == attributes
      * function == partial

    **dom instruction patterns:**

    * __[selector (String)]__
    selectors begin with a valid html tag name optionally followed by #someId and zero or more .someClass
    see $isSelector below for details
    a selector can be followed by any instruction another selector, an object, an array, inner text string
    * __[selector (String), innerHTML (String)]__
    any string that does not look like a selector is treated as inner text,
    if your strings will look like a selector you can add non selector characters like so...
    invalid as inner text: "strong", "menu", "footer"
    valid as inner test: "<span>strong</span>", "menu "
    inner text can only be followed by a selector string
    * __[selector (String), children (Array)]__
    an array can only be followed by a selector string
    * __[selector (String), attributes (Object)]__
    attributes eg. {title: "my title", value: 2}
    an object can be followed by an array or a string (selector or innerHTML)
    * __[selector (String), attributes (Object), children (Array)]__
    * lots more, you can embed partials as siblings or children (wrapped in an array) see tests for examples.

  ``` javascript

     var newsItem = {
         title: "Life discovered on Mars!",
         content: "Lorem ipsum dolor sit amet."
     };

     var dom = $dom([
         "div.newsItem", [
             "h3", newsItem.title,
             "p", newsItem.content
         ]
     ]);

     // with useRealDom == false, toString will output the html
     console.log(dom.toString());
     // prints <div class="newsItem"><h3>Life discovered on Mars!</h3><p>Lorem ipsum dolor sit amet.</p></div>
  ```

  * **$part(string, function)** creates a named partial to be used with collection methods, function should accept a
  data object for first argument and return the output of $el or $dom or $part("somePartial", string|object|array)
  * **$part(string, function, true)** replaces an existing partial function
  * **$part(string)** get a previously defined partial function
  * **$part(string, string|object|array)** invoke a predefined partial passing the second argument as the data parameter

  ``` javascript

		// first lets define a partial
		$part("todoItem", function(data) {
			return $dom([
				"div", {className: "todo " + data.done ? "done" : ""},[
					"div.display", [
						"input.check", {type: "checkbox", checked: data.done},
						"label.todo-content", data.content,
						"span.todo-destroy"
					],
					"div.edit", [
						"input.todo-input", {type: "text", value: data.content}
					]
				]
			]);
		});

		var todoItems = [{
			content: "walk dog",
			done: false
		}, {
			content: "get milk",
			done: true
		},{
			content: "find better things to do than make yet another todo application",
			done: false
		}];

		var todoListDom = $dom([
			"ul.todos", $map(todoItems, $part("todoItem"))
		]);

		// with useRealDom == false, toString will output the html
		console.log(todoListDom.toString());
		// prints: <ul class="todos"><div class="done"><div class="display"><input type="checkbox" checked="false" class="check"/><label class="todo-content">walk dog</label><span class="todo-destroy"></span></div><div class="edit"><input type="text" value="walk dog" class="todo-input"/></div></div><div class="done"><div class="display"><input type="checkbox" checked="checked" class="check"/><label class="todo-content">get milk</label><span class="todo-destroy"></span></div><div class="edit"><input type="text" value="get milk" class="todo-input"/></div></div><div class="done"><div class="display"><input type="checkbox" checked="false" class="check"/><label class="todo-content">find better things to do than make yet another todo application</label><span class="todo-destroy"></span></div><div class="edit"><input type="text" value="find better things to do than make yet another todo application" class="todo-input"/></div></div></ul>
  ```

  * **$parts()** return the parts container
  * **$parts(string)** return a previously defined partial function
  * **$parts.drop(string)** delete a previously defined partial function
  * **$parts.dropAll()** delete all previously defined partial functions

  ``` javascript

      // first lets define a partial
      $partial("newsItem", function(data) {
          return $dom([
              "div.newsItem", [
                  "h3", data.title,
                  "p", data.content
              ]
          ]);
      });

      //now lets build our news list dom using map and our new partial as the iterator
      var dom = $map(newsItems, $partials("newsItems"));
  ```

  * **$isSelector(string)** returns true if the provided string is a valid selector in the above dom syntax. leading
  tag must be of the following set.

    * validTags = "a abbr acronym address applet area article aside audio b base basefont bdi bdo big
					blockquote body br button canvas caption center cite code col colgroup command datalist
					dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer
					form frame frameset h1 head header hgroup hr html i iframe img input ins keygen kbd
					label legend li link map mark menu meta meter nav noframes noscript object ol optgroup
					option output p param pre progress q rp rt ruby s samp script section select small source
					span strike strong style sub summary sup table tbody td textarea tfoot th thead time title
					tr track tt u ul var video wbr";

    * tags list derived from http://www.w3schools.com/html5/html5_reference.asp

  * **$isSelector.addTag(string)** The tag you wnt to use not in the list above? Add it to the list with this function.


### Views
  warning: views are poorly defined and tested, avoid for now.
  * **$view(node, model, templateOrRenderFn)** create a view that renders when a model is updated
  * **$view(options)**

### Date
  * **$now** shortcut for new Date().getTime()
  * **$timeAgo(date, compareTo)** Human friendly time delta. Supports strings and numbers that can be passed to
  new Date() including some that can't (see source), optional compareTo value defaults to now

### String
  * **$trim** type agnostic string trim, just returns the original val if its not a string
  * **String.splice(index, howManyToDelete, stringToInsert)** adds splice functionality for strings

### Language Shims
  * **Object.keys()** adds ES5 Object.keys functionality to retrograde js engines
  * **Array.indexOf()** adds indexOf array method to retrograde js engines

### Object Pools
  Why use this? It is an experimental performance enhancement, ideally an object pool will limit the total ammount of
  work performed, memory used and garbage produced. Tests and benchmarks yet to be written, memory use and GC analysis
  yet to be performed.

  * **$recyclable(name, constructor, reducer, maxItems)** create an object pool, Arguments: name = string identifier
  for the pool, constructor = function that returns a new instance of the object (NOT called with new),
  reducer = function(obj) returns the object instance back to a reusable state. This is optional as there is a defalut
  which will call a reduce method on the object and if that does not exist will clear the object viea $clear,
  maxItems = number, defaults to 100, limits the maximum number of items that can be managed by the pool.
  * **$reuse(name)** creates a new object instance by calling the pool's construcor method or if one is available pulls
  an item from the pool and calls a "renew" method on the object if one exists.
  * **$recycle(obj)** calls the pool's reducer method passing in the provided object, all references to this object
  should be broken at this point. Arguments: obj = an object that was returned by the $reuse function.
  * **$recycleBin(name)** returns an object pool by name or all pools if no name is provided.

### $cache
  * **types** the in-memory storage location for typed/cached data
  * **getKey(url, req)** returns a cache key. for 1 args the cacheKey is just the url, eg. "/contents" for 2 args a key
  is generated with the url and the req , if the url was /user and post or get values were {name:"jim",age:25} then the
  key would be /user\[name:jim,age:25]
  * **get(typeId, url, req)** if given just a typeId returns that type object. Otherwise returns an existing item from
  the cache or creates a new bin corresponding to the provided typeId, url and optional request params.
  * **evict(typeId, evictionTest)** remove items from the cache. evictionTest(bin, cacheKey) is an optional function to
  filter the items to evict. an eviction notice will be told to the cache so others can listen in and respond as
  needed. Returns stats on how how many items were evicted out of how many and what remains.
  * **set(typeId, url, req, val, metaData)** sets/updates a response value in the cache corresponding to the provided
  typeId, url and request params. MetaData is optional. Returns the cache bin that was set.
  * **newType(typeId, customType)** provide a typeId string and optional typeObject to create a new type group in the
  cache.
  * **newRemoteType(typeId, spec)** an advanced cache type that abstracts away async io thorugh a sync mehod.

### $io
  * **io(url, req, dataType, reqType)** abstracting away async io, currently depends on jquery
