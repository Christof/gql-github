import { flatten, unique } from "../src/array_helper";

describe("flatten", function() {
  it("flattens nested arrays", function() {
    expect(flatten([[1], [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("unique", function() {
  it("removes duplicates in array", function() {
    expect(unique([1, 1, 2, 4, 3, 3])).toEqual([1, 2, 4, 3]);
  });
});
