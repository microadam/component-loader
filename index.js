var async = require('async')

module.exports = function componentLoader(components, eachFn, callback) {
  var loadedComponents = {}

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
  })

  async.auto(loadedComponents, callback)
}
