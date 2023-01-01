'use strict'

var test = require('tape')
var elementStyle = require('./')

test('element style', function (t) {
  elementStyle(document.body, 'position', 'relative')
  t.deepEqual(elementStyle(document.body, 'position'), document.body.style.position)

  elementStyle(document.body, 'width', '10000px')
  t.deepEqual(elementStyle(document.body, 'width'), document.body.style.width)

  elementStyle(document.body, 'height', '10000px')
  t.deepEqual(elementStyle(document.body, 'height'), document.body.style.height)

  elementStyle(document.body, 'paddingLeft', '10000px')
  t.deepEqual(elementStyle(document.body, 'paddingLeft'), document.body.style.paddingLeft)

  t.end()
})
