var assert = require('assert')
  , sinon = require('sinon')
  , componentLoader = require('../')

describe('component-loader', function () {

  it('should load components in the correct order', function (done) {

    var componentOneSpy = sinon.stub()
    componentOneSpy.callsArg(1)
    function componentOne() {
      return { componentOne: [ 'componentThree', componentOneSpy ] }
    }

    var componentTwoSpy = sinon.stub()
    componentTwoSpy.callsArg(1)
    function componentTwo() {
      return { componentTwo: [ 'componentOne', componentTwoSpy ] }
    }

    var componentThreeSpy = sinon.stub()
    componentThreeSpy.callsArg(1)
    function componentThree() {
      return { componentThree: componentThreeSpy }
    }

    var components = [ componentOne, componentTwo, componentThree ]

    componentLoader(components
    , function (loadFn) {
        return loadFn.bind(null, 'Hello')
      }
    , function (error) {
        assert.equal(error, null, 'error should not exist')
        assert.equal(componentOneSpy.callCount, 1)
        assert.equal(componentOneSpy.calledWith('Hello'), true)
        assert.equal(componentTwoSpy.callCount, 1)
        assert.equal(componentTwoSpy.calledWith('Hello'), true)
        assert.equal(componentThreeSpy.callCount, 1)
        assert.equal(componentThreeSpy.calledWith('Hello'), true)
        sinon.assert.callOrder(componentThreeSpy, componentOneSpy, componentTwoSpy)
        done()
      }
    )
  })

  it('should throw error if component is already loaded', function () {

    function noop() {}

    function componentOne() {
      return { componentOne: [ 'componentThree', noop ] }
    }
    function componentTwo() {
      return { componentOne: [ 'componentOne', noop ] }
    }

    var components = [ componentOne, componentTwo ]

    assert.throws(function () {
      componentLoader(components
      , function (loadFn) {
          return loadFn.bind(null, 'Hello')
        }
      , noop
      )
    }, /Component with name "componentOne" already loaded/)
  })

})
