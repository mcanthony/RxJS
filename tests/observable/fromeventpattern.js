(function () {
  /* jshint undef: true, unused: true */
  /* globals QUnit, test, Rx, equal */

  QUnit.module('FromEventPattern');

  var Observable = Rx.Observable,
      slice = Array.prototype.slice;

  /** Fake DOM Element */
  function FakeDOMStandardElement(nodeName) {
    this.listeners = {};
    this.nodeName = nodeName;
    this.addEventListenerCalled = false;
    this.removeEventListenerCalled = false;
  }

  FakeDOMStandardElement.prototype.addEventListener = function (eventName, handler) {
    this.listeners[eventName] = handler;
    this.addEventListenerCalled = true;
  };

  FakeDOMStandardElement.prototype.removeEventListener = function (eventName, handler) {
    delete this.listeners[eventName];
    this.removeEventListenerCalled = true;
  };

  FakeDOMStandardElement.prototype.trigger = function (eventName) {
    var args = slice.call(arguments, 1);
    if (eventName in this.listeners) {
      this.listeners[eventName].apply(null, args);
    }
  };

  test('Event 1', function () {
    var element = new FakeDOMStandardElement('foo');

    var d = Observable.fromEventPattern(
      function (h) { element.addEventListener('someEvent', h, false); },
      function (h) { element.removeEventListener('someEvent', h, false); }
    )
    .subscribe(function (x) {
      equal(x, 42);
    });

    element.trigger('someEvent', 42);
    equal(element.addEventListenerCalled, true);
    equal(element.removeEventListenerCalled, false);

    d.dispose();

    equal(element.removeEventListenerCalled, true);
  });

  test('Event 2', function () {
    var element = new FakeDOMStandardElement('foo');

    var d = Observable.fromEventPattern(
        function (h) { element.addEventListener('someEvent', h, false); },
        function (h) { element.removeEventListener('someEvent', h, false); },
        function (baz, quux) {
          return { foo: baz, bar: quux };
        }
      )
      .subscribe(function (x) {
        equal(x.foo, 'baz');
        equal(x.bar, 'quux');
      });

    element.trigger('someEvent', 'baz', 'quux');
    equal(element.addEventListenerCalled, true);
    equal(element.removeEventListenerCalled, false);

    d.dispose();

    equal(element.removeEventListenerCalled, true);
  });

}());
