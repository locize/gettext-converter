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

  it('will always output something if using keyasareference for plurals', (fn) => () => {
    const res = fn('en-US', fixures.example.jsi18nextV4, {
      compatibilityJSON: 'v4',
      keyasareference: true,
      potCreationDate: new Date('2020-04-17T10:46:16.313Z'),
      poRevisionDate: new Date('2020-04-17T10:46:16.313Z')
    })
    expect(res).to.eql(fixtures.exmaple.poi18nextV4_asreference)
  })
})
