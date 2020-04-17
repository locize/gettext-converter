import parse from './poParser.js'

export default function po2js (fileContents, charset) {
  return parse(fileContents, charset)
}
