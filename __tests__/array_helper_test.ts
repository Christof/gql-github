import { flatten, unique, runningAverage, sum } from "../src/array_helper";

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

describe("sum", function() {
  it("sums up all elements", function() {
    expect(sum([1, 2, 3, 4, 5])).toEqual(15);
  });
});

describe("runningAverage", function() {
  it("calculates the running average with 1 neighbour before and after", function() {
    const input = [1, 2, 3, 4, 8];

    expect(runningAverage(input, 1)).toEqual([1.5, 2, 3, 5, 6]);
  });

  it("calculates the running average with 2 neighbour before and after", function() {
    const input = [1, 2, 3, 4, 8];

    expect(runningAverage(input, 2)).toEqual([2, 2.5, 3.6, 4.25, 5]);
  });
});
