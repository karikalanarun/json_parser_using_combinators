const { parseChar, parseRegex, parseString } = require("./simple_parsers")
const { either, both } = require("./parser_combinator")
const R = require("ramda")

const map = R.curry((transform, result) => {
    return result.map(([res, remainder]) => [transform(res), remainder])
})

const parseLCurly = parseChar("{");

const parseRCurly = parseChar("}")

const parseComma = parseChar(",")

const parseColon = parseChar(":")

const parseDigits = R.compose(
    map(parseInt),
    parseRegex("[0-9]+", "Expecting digit")
);

const parseBoolean = R.compose(
    map(literal => literal === "true" ? true : false),
    parseRegex("(true)|(false)", "Expecting boolean true/false")
)

const parseNull = R.compose(
    map(R.always(null)),
    parseString("null")
)

const parseStringLiteral = parseRegex("\"((?:\\.|.)*?)\"", "Expecting string literal")

const parseValue = either(parseStringLiteral, either(parseNull, either(parseBoolean, parseDigits)))

const parseKeyValuePair = R.compose(
    map(([key, [, value]]) => ({ key, value })),
    both(parseStringLiteral, both(parseColon, parseValue))
)

const parseEmpty = parseString("");

const parseTailKeyValuePair = R.compose(
    map(([, keyValuePairs]) => [...keyValuePairs.filter(pair => pair !== "")]),
    both(parseComma, (string) => manyParseKeyValuePair(string))
)

const optionalTailKeyValuePair = R.compose(
    map((pair) => pair !== "" ? [...pair] : []),
    either(parseTailKeyValuePair, parseEmpty)
)

const manyParseKeyValuePair = R.compose(
    map(([startPair, otherPairs]) => {
        console.log({ startPair, otherPairs })
        return [startPair, ...otherPairs]
    }),
    both(
        parseKeyValuePair,
        optionalTailKeyValuePair
    )
)

const oneOrManyParseKeyValuePair = R.compose(
    map(R.reduce((obj, { key, value }) => ({ ...obj, [key]: value }), {})),
    either(
        manyParseKeyValuePair,
        R.compose(
            map(() => ({})),
            parseEmpty
        )
    ))

const parseJson = R.compose(
    map(([, [obj]]) => obj),
    both(parseLCurly, both(oneOrManyParseKeyValuePair, parseRCurly))
)

let result = parseJson('{"arun":5,"karikalan":true,"summa":null}')

// let result = parseKeyValuePair("\"null\":5")

result.either(
    (err) => {
        console.log("err :: ", err)
    },
    (value) => {
        console.log({ value: value[0] })
        console.log("value ::: ", JSON.stringify(value[0], 1))
    }
)

module.exports = {
    parseJson
}