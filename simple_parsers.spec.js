const { parseChar } = require("./simple_parsers")

describe("parseChar", () => {
    it("should accept a character and return a function", () => {
        // arrange
        const char = "a";
        // act
        const parserFn = parseChar(char)
        // assert
        expect(parserFn.constructor).toBe(Function)
    })
})