const fs = require('fs')
const path = require('path')

module.exports = {
  example: {
    js: require('./example.json'),
    jsi18next: require('./example-i18next.json'),
    jsi18nextLanguageNoPlurals: require('./example-i18next-language-no-plurals.json'),
    jsi18nextV4: require('./example-i18next-v4.json'),
    po: fs.readFileSync(path.join(__dirname, 'example.po')).toString().replace(/\n$/, ''),
    i18nextjs: require('./example-i18next-po.json'),
    poi18next: fs.readFileSync(path.join(__dirname, 'example-i18next.po')).toString().replace(/\n$/, ''),
    poi18nextLanguageNoPlurals: fs.readFileSync(path.join(__dirname, 'example-i18next-language-no-plurals.po')).toString().replace(/\n$/, ''),
    poi18nextV4: fs.readFileSync(path.join(__dirname, 'example-i18next-v4.po')).toString().replace(/\n$/, '')
  },
  example_persistMsgIdPlural: {
    jsi18next: require('./example_persistMsgIdPlural.json'),
    poi18next: fs.readFileSync(path.join(__dirname, 'example_persistMsgIdPlural.po')).toString().replace(/\n$/, '')
  }
}
