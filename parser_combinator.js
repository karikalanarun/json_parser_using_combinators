const R = require("ramda")
const { Right } = require("crocks/Either")
const { chain, bichain } = require("crocks/pointfree");

// either -> (Parser a, Parser b) -> Parser (a|b)
const either = R.curry((p1, p2) => string =>
    R.compose(
        bichain(() => p2(string), Right),
        p1
    )(string));

// both :: Parser a -> Parser b -> Parser [a, b]
const both = R.curry((p1, p2) =>
    R.compose(
        chain(([res1, remainder]) =>
            R.compose(
                chain(([res2, remainder]) => Right([[res1, res2], remainder])),
                p2
            )(remainder)
        ),
        p1
    )
);


module.exports = {
    either,
    both
}