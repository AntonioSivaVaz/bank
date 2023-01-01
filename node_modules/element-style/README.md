# element-style [![Build Status](https://travis-ci.org/kyungw00k/element-style.svg?branch=master)](https://travis-ci.org/kyungw00k/element-style)
Gets/Sets an element style property

## Installation
```
npm install element-style
```

## Usage
```
var elementStyle = require('element-style')

// Set style
elementStyle(document.body, 'paddingLeft', '15px')

// Get style
elementStyle(document.body, 'paddingLeft')
// => '15px'
```

## License
MIT
