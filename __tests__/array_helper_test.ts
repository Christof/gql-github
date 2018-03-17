import { flatten } from "../src/array_helper";

describe("flatten", function() {
  it("flattens nested arrays", function() {
    expect(flatten([[1], [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });
});
