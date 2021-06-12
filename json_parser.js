const { parseChar, parseRegex, parseString } = require("./simple_parsers")
const { either, both } = require("./parser_combinator")

const parseLCurly = parseChar("{");

const parseRCurly = parseChar("}")

const parseComma = parseChar(",")

const parseColon = parseChar(":")

const parseDigits = parseRegex("[0-9]+", "Expecting digit");

const parseBoolean = parseRegex("(true)|(false)", "Expecting boolean true/false")

const parseNull = parseString("null")

const parseStringLiteral = parseRegex("\"((?:\\.|.)*?)\"", "Expecting string literal")

const parseValue = either(parseStringLiteral, either(parseNull, either(parseBoolean, parseDigits)))

const parseKeyValuePair = both(parseStringLiteral, both(parseColon, parseValue))

const parseEmpty = parseString("");

const parseTailKeyValuePair = both(parseComma, (string) => manyParseKeyValuePair(string))

const manyParseKeyValuePair = both(
    parseKeyValuePair,
    either(parseTailKeyValuePair, parseEmpty)
)

const oneOrManyParseKeyValuePair = either(manyParseKeyValuePair, parseEmpty)

const parseJson = both(parseLCurly, both(oneOrManyParseKeyValuePair, parseRCurly))

let result = parseJson('{}')


console.log({ result })

result.either(
    (err) => {
        console.log("err :: ", err)
    },
    (value) => {
        console.log("value ::: ", JSON.stringify(value, 1))
    }
)