const expect = require('expect.js')
const fixtures = require('./fixtures')
function test (what, t) {
  describe(what, () => {
    it('index', t(require('../')[what]))
    it('direct', t(require('../cjs/' + what)))
  })
}

test('po2js', (fn) => () => {
  const res = fn(fixtures.example.po)
  expect(res).to.eql(fixtures.example.js)
})

test('js2po', (fn) => () => {
  const res = fn(fixtures.example.js)
  expect(res).to.eql(fixtures.example.po)
})

test('js2i18next', (fn) => () => {
  const res = fn(fixtures.example.js)
  expect(res).to.eql(fixtures.example.jsi18next)
})
test('po2i18next', (fn) => () => {
  const res = fn(fixtures.example.po)
  expect(res).to.eql(fixtures.example.jsi18next)
  const res2 = fn(fixtures.example.poi18next)
  expect(res2).to.eql(fixtures.example.jsi18next)
})

describe('prototype pollution', () => {
  test('po2js', (fn) => () => {
    const unsafeCtx = ['__proto__', 'constructor', 'prototype']
    unsafeCtx.forEach((ctx) => {
      delete Object.prototype.gcPolluted
      delete Object.gcPolluted
      const res = fn(`msgctxt "${ctx}"\nmsgid "gcPolluted"\nmsgstr "polluted"\n`)
      expect({}.gcPolluted).to.be(undefined)
      expect(Object.prototype.gcPolluted).to.be(undefined)
      expect(Object.gcPolluted).to.be(undefined)
      expect(res.translations[ctx].gcPolluted.msgstr).to.eql(['polluted'])
      delete Object.prototype.gcPolluted
      delete Object.gcPolluted
    })
  })

  test('js2i18next', (fn) => () => {
    const unsafeIds = ['__proto__##gcPolluted', '__proto__', 'constructor##prototype##gcPolluted', 'a##constructor##gcPolluted']
    unsafeIds.forEach((id) => {
      delete Object.prototype.gcPolluted
      const res = fn({
        charset: 'utf-8',
        headers: { Language: 'en' },
        translations: { '': { [id]: { msgid: id, msgstr: ['polluted'] } } }
      })
      expect({}.gcPolluted).to.be(undefined)
      expect(Object.prototype.gcPolluted).to.be(undefined)
      expect(res.gcPolluted).to.be(undefined)
      delete Object.prototype.gcPolluted
    })
  })
})

test('i18next2js', (fn) => () => {
  const res = fn('en-US', fixtures.example.jsi18next, {
    potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
    poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
  })
  expect(res).to.eql(fixtures.example.i18nextjs)
})

test('i18next2po', (fn) => () => {
  const res = fn('en-US', fixtures.example.jsi18next, {
    potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
    poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
  })
  expect(res).to.eql(fixtures.example.poi18next)
})

describe('i18nextOptions', () => {
  test('i18next2po', (fn) => () => {
    const res = fn('en-US', fixtures.example_persistMsgIdPlural.jsi18next, {
      project: 'locize',
      noDate: true,
      ctxSeparator: '_ is default but we set it to something that is never found!!!'
    })
    expect(res).to.eql(fixtures.example_persistMsgIdPlural.poi18next)
  })

  test('po2i18next', (fn) => () => {
    const res = fn(fixtures.example_persistMsgIdPlural.poi18next, { persistMsgIdPlural: true })
    expect(res).to.eql(fixtures.example_persistMsgIdPlural.jsi18next)
  })
})

describe('i18nextOptions (fallbackToMsgId)', () => {
  test('po2i18next', (fn) => () => {
    const res = fn(fixtures.example_fallbackMsgId.poi18next, {
      compatibilityJSON: 'v4',
      fallbackToMsgId: true
    })
    expect(res).to.eql(fixtures.example_fallbackMsgId.jsi18next)
  })
})

describe('i18next v4', () => {
  test('po2i18next', (fn) => () => {
    const res2 = fn(fixtures.example.poi18nextV4, {
      compatibilityJSON: 'v4'
    })
    expect(res2).to.eql(fixtures.example.jsi18nextV4)
  })

  test('i18next2po', (fn) => () => {
    const res = fn('en-US', fixtures.example.jsi18nextV4, {
      compatibilityJSON: 'v4',
      potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
      poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
    })
    expect(res).to.eql(fixtures.example.poi18nextV4)
  })

  describe('keyasareference', () => {
    test('i18next2po', (fn) => () => {
      const res = fn('en-US', fixtures.example.jsi18nextV4, {
        compatibilityJSON: 'v4',
        keyasareference: true,
        potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
        poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
      })
      expect(res).to.eql(fixtures.example.poi18nextV4_ref)
    })
  })
})

describe('Plural handling with empty msgid_plural', () => {
  test('po2i18next', (fn) => () => {
    const res = fn(fixtures.example_emptyMsgidPlural.po)
    expect(res).to.eql(fixtures.example_emptyMsgidPlural.jsi18next)
  })
})

describe('nested array of objects', () => {
  test('i18next2po', (fn) => () => {
    const res = fn('en-US', fixtures.example_nestedArray.jsi18next, {
      potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
      poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
    })
    expect(res).to.eql(fixtures.example_nestedArray.poi18next)
  })

  describe('i18next v4', () => {
    test('i18next2po', (fn) => () => {
      const res = fn('en-US', fixtures.example_nestedArray.jsi18next, {
        compatibilityJSON: 'v4',
        potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
        poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
      })
      expect(res).to.eql(fixtures.example_nestedArray.poi18next)
    })
  })
})

describe('fuzzy', () => {
  const conv = require('../')
  it('flags the given keys on the way out and reports them on the way in', () => {
    const po = conv.i18next2po('en', { greeting: 'hi', bye: 'bye', nested: { deep: 'deep' }, item_one: 'one item', item_other: 'items' }, { fuzzy: ['bye', 'nested.deep', 'item_one'], noDate: true, compatibilityJSON: 'v4' })
    expect(po).to.contain('#, fuzzy\nmsgid "bye"')
    expect(po).to.contain('#, fuzzy\nmsgid "nested##deep"') // nested keys use the ## msgid separator
    expect(po).to.contain('#, fuzzy\nmsgid "item"')
    expect(po).to.not.contain('#, fuzzy\nmsgid "greeting"')
    const { resources, fuzzy } = conv.po2i18next(po, { fuzzy: true, compatibilityJSON: 'v4' })
    expect(resources).to.eql({ greeting: 'hi', bye: 'bye', nested: { deep: 'deep' }, item_one: 'one item', item_other: 'items' })
    expect(fuzzy.sort()).to.eql(['bye', 'item_one', 'item_other', 'nested.deep'])
  })
  it('accepts a Set and a function, and returns plain resources without the option', () => {
    const poSet = conv.i18next2po('en', { a: 'A', b: 'B' }, { fuzzy: new Set(['a']), noDate: true })
    expect(poSet).to.contain('#, fuzzy\nmsgid "a"')
    const poFn = conv.i18next2po('en', { a: 'A', b: 'B' }, { fuzzy: (k) => k === 'b', noDate: true })
    expect(poFn).to.contain('#, fuzzy\nmsgid "b"')
    expect(conv.po2i18next(poFn)).to.eql({ a: 'A', b: 'B' })
  })
})
