var kebabCase = require('kebab-case')

/**
 * Gets/Sets an element style property.
 *
 * @param  Object        element A DOM element.
 * @param  String|Object name    The name of a property or an object of values to set.
 * @param  String        value   The value of the property to set, or none to get the current
 *                               property value.
 * @return String                The current/new property value.
 */
function elementStyle (element, name, value) {
  if (typeof name === 'object') {
    var style = name
    for (name in style) {
      elementStyle(element, kebabCase(name), style[name])
    }
    return style
  }

  var doc = element.ownerDocument
  var win = doc.defaultView || doc.parentWindow

  if (!win.getComputedStyle) {
    win.getComputedStyle = function (el, pseudo) {
      this.el = el
      this.getPropertyValue = function (prop) {
        var re = /(\-([a-z]){1})/g

        if (prop === 'float') {
          prop = 'styleFloat'
        }

        if (re.test(prop)) {
          prop = prop.replace(re, function () {
            return arguments[2].toUpperCase()
          })
        }

        return el.currentStyle[prop] ? el.currentStyle[prop] : null
      }
      return this
    }
  }

  if (arguments.length === 3) {
    element.style[kebabCase.reverse(name === 'float' ? 'cssFloat' : name)] = value || ''
    return value
  }

  return win.getComputedStyle(element, null).getPropertyValue(kebabCase(name === 'cssFloat' ? 'float' : name))
}

module.exports = elementStyle
