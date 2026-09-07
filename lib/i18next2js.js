// inspired by https://github.com/i18next/i18next-gettext-converter/blob/master/src/lib/json2gettext.js

import arrify from 'arrify'
import flatten from './flatten.js'
import { getPlurals, getSetLocaleAsLanguageHeader } from './options.js'

const getGettextPluralPosition = (ext, suffix) => {
  if (ext) {
    for (let i = 0; i < ext.numbers.length; i += 1) {
      if (i === suffix) return i
    }
  }
  return -1
}

const getPluralArray = (locale, translation, plurals) => {
  const ext = plurals[locale.toLowerCase()] || plurals[locale.split(/_|-/)[0].toLowerCase()] || plurals.dev
  const pArray = []

  for (let i = 0, len = translation.plurals.length; i < len; i += 1) {
    const plural = translation.plurals[i]
    pArray.splice(getGettextPluralPosition(ext, plural.pluralNumber - 1), 0, plural.value)
  }

  pArray.splice(getGettextPluralPosition(ext, translation.pluralNumber - 1), 0, translation.value)
  return pArray
}

// options.fuzzy: the i18next keys (flat, as the caller holds them) whose
// entries get the "#, fuzzy" flag: an array, a Set, or a (key) => boolean.
// A plural or context entry is flagged when any of its forms is listed.
const PLURAL_SUFFIXES = ['zero', 'one', 'two', 'few', 'many', 'other', 'plural', '0', '1', '2', '3', '4', '5']
const fuzzyMatcher = (options) => {
  const fuzzy = options.fuzzy
  if (!fuzzy) return () => false
  const has = typeof fuzzy === 'function'
    ? (k) => !!fuzzy(k)
    : fuzzy instanceof Set
      ? (k) => fuzzy.has(k)
      : (k) => Array.isArray(fuzzy) && fuzzy.indexOf(k) > -1
  const ctxSeparator = options.ctxSeparator || '_'
  const keyseparator = options.keyseparator || '##'
  return (kv) => {
    // nested input is flattened with the msgid separator (a##b); callers usually
    // hold the dotted form (a.b), so both spellings are tried
    const keys = kv.key.indexOf(keyseparator) > -1 ? [kv.key, kv.key.split(keyseparator).join('.')] : [kv.key]
    const bases = kv.context ? keys.concat(keys.map((k) => `${k}${ctxSeparator}${kv.context}`)) : keys
    return bases.some((b) => has(b) || (kv.plurals || kv.pluralNumber ? PLURAL_SUFFIXES.some((s) => has(`${b}_${s}`)) : false))
  }
}

const parseGettext = (locale, data, options = {}) => {
  const out = {
    charset: 'utf-8',
    headers: {
      'project-id-version': options.project || 'gettext-converter',
      'mime-version': '1.0',
      'content-type': 'text/plain; charset=utf-8',
      'content-transfer-encoding': '8bit'
    },
    translations: {}
  }
  const plurals = getPlurals(options)
  const setLocaleAsLanguageHeader = getSetLocaleAsLanguageHeader(options)
  const ext = plurals[locale.toLowerCase()] || plurals[locale.split(/_|-/)[0].toLowerCase()] || plurals.dev
  const trans = {}
  const isFuzzyEntry = fuzzyMatcher(options)
  out.headers['plural-forms'] = `nplurals=${ext.numbers.length}; plural=${ext.plurals}`

  if (!options.noDate) {
    out.headers['pot-creation-date'] = new Date().toISOString()
    out.headers['po-revision-date'] = new Date().toISOString()
    if (options.potCreationDate && typeof options.potCreationDate.toISOString === 'function') out.headers['pot-creation-date'] = options.potCreationDate.toISOString()
    if (options.poRevisionDate && typeof options.poRevisionDate.toISOString === 'function') out.headers['po-revision-date'] = options.poRevisionDate.toISOString()
  }

  if (options.language) out.headers.language = options.language
  else if (setLocaleAsLanguageHeader) out.headers.language = locale

  const delkeys = []
  Object.keys(data).forEach((m) => {
    const kv = data[m]

    if (kv.plurals) {
      const pArray = []

      for (let i = 0, len = kv.plurals.length; i < len; i += 1) {
        const plural = kv.plurals[i]
        pArray.splice(getGettextPluralPosition(ext, plural.pluralNumber - 1), 0, plural.value)
      }

      if (ext.numbers.length !== 1) {
        pArray.splice(getGettextPluralPosition(ext, kv.pluralNumber - 1), 0, kv.value)
      }

      if (typeof trans[kv.context] !== 'object') trans[kv.context] = {}

      if (options.keyasareference) {
        if (typeof trans[kv.context][kv.value] === 'object') {
          // same context and msgid. this could theorically be merged.
          trans[kv.context][kv.value].comments.reference.push(kv.key)
        } else {
          trans[kv.context][kv.value] = {
            msgctxt: kv.context,
            msgid: pArray[0],
            msgid_plural: pArray.slice(1, pArray.length),
            msgstr: arrify(kv.translated_value),
            comments: {
              reference: [kv.key]
            }
          }
        }

        if (kv.key !== kv.value) {
          delkeys.push([kv.context, kv.key])
        }
      } else {
        let msgid = kv.key // eslint-disable-next-line camelcase

        // eslint-disable-next-line camelcase
        let msgid_plural = kv.key

        if (kv.key.indexOf('|#|') > -1) {
          const p = kv.key.split('|#|')
          msgid = p[0]

          // eslint-disable-next-line camelcase
          msgid_plural = p[1]
        }

        trans[kv.context][kv.key] = {
          msgctxt: kv.context,
          msgid,
          // eslint-disable-next-line camelcase
          msgid_plural,
          msgstr: pArray
        }
      }
    } else {
      if (typeof trans[kv.context] !== 'object') trans[kv.context] = {}

      if (options.keyasareference) {
        if (typeof trans[kv.context][kv.value] === 'object') {
          // same context and msgid. this could theorically be merged.
          trans[kv.context][kv.value].comments.reference.push(kv.key)
        } else {
          trans[kv.context][kv.value] = {
            msgctxt: kv.context,
            msgid: kv.value,
            msgstr: arrify(kv.translated_value),
            comments: {
              reference: [kv.key]
            }
          }
        }

        if (kv.key !== kv.value) {
          delkeys.push([kv.context, kv.key])
        }
      } else {
        trans[kv.context][kv.key] = {
          msgctxt: kv.context,
          msgid: kv.key,
          msgstr: arrify(kv.value)
        }
      }
    }
    if (isFuzzyEntry(kv)) {
      const entry = trans[kv.context][options.keyasareference ? kv.value : kv.key]
      if (entry) entry.comments = Object.assign({}, entry.comments, { flag: 'fuzzy' })
    }
  })
  delkeys.forEach(a => {
    const c = a[0]
    const k = a[1]
    delete trans[c][k]
  }) // re-format reference comments to be able to compile with gettext-parser...

  Object.keys(trans).forEach(ctxt => {
    Object.keys(trans[ctxt]).forEach(id => {
      if (trans[ctxt][id].comments && trans[ctxt][id].comments.reference) {
        trans[ctxt][id].comments.reference = trans[ctxt][id].comments.reference.join('\n')
      }
    })
  })
  out.translations = trans
  return out
}

export default function i18next2js (locale, body, options = {}) {
  const flat = flatten(typeof body === 'string' ? JSON.parse(body) : body, options, locale)
  if (options.base) {
    const bflat = flatten(JSON.parse(options.base), options)
    Object.keys(bflat).forEach(key => {
      if (flat[key]) {
        if (flat[key].plurals) {
          bflat[key].translated_value = getPluralArray(locale, flat[key], getPlurals(options))
        } else {
          bflat[key].translated_value = flat[key].value
        }
      }
    })
    return parseGettext(locale, bflat, options)
  }

  return parseGettext(locale, flat, options)
}
