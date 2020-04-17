const fs = require('fs')
const path = require('path')

module.exports = {
  example: {
    js: require('./example.json'),
    jsi18next: require('./example-i18next.json'),
    po: fs.readFileSync(path.join(__dirname, 'example.po')).toString().replace(/\n$/, ''),
    poi18next: fs.readFileSync(path.join(__dirname, 'example-i18next.po')).toString().replace(/\n$/, '')
  },
  example_persistMsgIdPlural: {
    jsi18next: require('./example_persistMsgIdPlural.json'),
    poi18next: fs.readFileSync(path.join(__dirname, 'example_persistMsgIdPlural.po')).toString().replace(/\n$/, '')
  }
}
