
const { Right, Left } = require("crocks/Either")

const R = require("ramda")


// parseChar :: char -> string -> Either () string
const parseChar = R.curry(
    (char, string) =>
        string[0] === char ?
            Right([char, string.slice(1)])
            : Left(`Expecting ${char}`)
)

const parseRegex = R.curry((regexString, errMessage, string) => {
    let matches = string.match(new RegExp(`^${regexString}`));
    return matches ? Right([matches[0], string.slice(
        matches.index + matches[0].length
    )]) : Left(errMessage)
})

const parseString = R.curry((sub, string) =>
    string.startsWith(sub) ? Right([sub, string.slice(sub.length)]) : Left(`Expecting ${sub}`)
)


module.exports = {
    parseChar,
    parseRegex,
    parseString
}