
const { Right, Left } = require("crocks/Either")

const R = require("ramda")


// parseChar :: char -> string -> Either () string
const parseChar = R.curry(
    (char, string) =>
        string[0] === char ?
            Right([char, string.slice(1)])
            : Left(`Expecting ${char}`)
)


module.exports = {
    parseChar
}