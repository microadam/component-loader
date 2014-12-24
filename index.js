var async = require('async')
  , clone = require('lodash.clone')
  , uniq = require('lodash.uniq')
  , difference = require('lodash.difference')

module.exports = function componentLoader(components, eachFn, callback) {
  var loadedComponents = {}
    , dependencies = []

  components.forEach(function (component) {
    var componentDefinition = component()
      , componentName = Object.keys(componentDefinition)[0]
      , componentParts = componentDefinition[componentName]
      , initFunc = null

    if (typeof componentParts === 'function') {
      componentParts = [ componentParts ]
    }
    var funcIndex = componentParts.length - 1
    initFunc = componentParts[funcIndex]
    componentParts[funcIndex] = eachFn(initFunc)

    componentDefinition[componentName] = componentParts
    if (loadedComponents[componentName]) {
      throw new Error('Component with name "' + componentName + '" already loaded')
    }

    loadedComponents[componentName] = componentDefinition[componentName]

    var deps = clone(componentParts)
    deps.pop()
    dependencies = dependencies.concat(deps)
  })

  dependencies = uniq(dependencies)
  var missingDependencies = difference(dependencies, Object.keys(loadedComponents))

  if (missingDependencies.length) {
    throw new Error('Missing dependencies: ' + missingDependencies.join(', '))
  }

  async.auto(loadedComponents, callback)
}
