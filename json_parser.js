const { parseChar, parseRegex, parseString } = require("./simple_parsers")
const { either, both } = require("./parser_combinator")
const R = require("ramda")

const map = R.curry((transform, result) => {
    return result.map(([res, remainder]) => [transform(res), remainder])
})

const parseLCurly = parseChar("{");

const parseRCurly = parseChar("}")

const parseOpenSqr = parseChar("[")

const parseCloseSqr = parseChar("]")

const parseComma = parseChar(",")

const parseColon = parseChar(":")

const parseDigits = R.compose(
    map(parseInt),
    parseRegex("[0-9]+", "Expecting digit")
);

const parseBoolean = R.compose(
    map(literal => literal === "true" ? true : false),
    parseRegex("((true)|(false))", "Expecting boolean true/false")
)

const parseNull = R.compose(
    map(R.always(null)),
    parseString("null")
)


const parseStringLiteral = parseRegex("\"((?:\\.|.)*?)\"", "Expecting string literal")

const parseValue = either(
    string => parseArray(string),
    either(
        parseStringLiteral,
        either(
            parseNull,
            either(
                parseBoolean,
                either(
                    parseDigits,
                    (string) => parseObject(string)
                )
            )
        )
    )
)

const parseArrayTailElement = R.compose(
    map(([, value]) => value),
    both(parseComma, parseValue)
)

const parseKeyValuePair = R.compose(
    map(([key, [, value]]) => ({ key, value })),
    both(parseStringLiteral, both(parseColon, parseValue))
)

const parseEmpty = def => R.compose(
    map(() => def),
    parseString("")
);

const parseManyTailElement = R.compose(
    map(([startEl, otherEls]) => [startEl, ...otherEls]),
    both(
        parseArrayTailElement,
        either(string => parseManyTailElement(string), parseEmpty([]))
    )
)

const parseZeroOrManyTrailEl = either(parseManyTailElement, parseEmpty([]))

const parseArrayEls = R.compose(
    map(([start, els]) => [start, ...els]),
    both(parseValue, parseZeroOrManyTrailEl)
)

const parseArray = R.compose(
    map(([, [els]]) => els),
    both(
        parseOpenSqr,
        R.compose(
            both(parseArrayEls, parseCloseSqr)
        )
    )
)

const parseTailKeyValuePair = R.compose(
    map(([, keyValuePairs]) => [...keyValuePairs.filter(pair => pair !== "")]),
    both(parseComma, (string) => manyParseKeyValuePair(string))
)

const optionalTailKeyValuePair = either(parseTailKeyValuePair, parseEmpty([]))

const manyParseKeyValuePair = R.compose(
    map(([startPair, otherPairs]) => {
        return [startPair, ...otherPairs]
    }),
    both(
        parseKeyValuePair,
        optionalTailKeyValuePair
    )
)

const zeroOrManyParseKeyValuePair = R.compose(
    map(R.reduce((obj, { key, value }) => ({ ...obj, [key]: value }), {})),
    either(
        manyParseKeyValuePair,
        parseEmpty([])
    ))

const parseObject = R.compose(
    map(([, [obj]]) => obj),
    both(parseLCurly, both(zeroOrManyParseKeyValuePair, parseRCurly))
)

const parseJson = either(parseObject, parseArray)

// let result = parseJson('{"arun":{"karikalan":{"awe":true}},"jo":"test"}')

let result = parseJson('{"arun":[1,2,{"awe":false}]}')

result.either(
    (err) => {
        console.log("err :: ", err)
    },
    (value) => {
        console.log({ value: value[0], remainder: value[1] })
        console.log(JSON.stringify(value[0], null, 1))
    }
)

module.exports = {
    parseJson: parseObject
}