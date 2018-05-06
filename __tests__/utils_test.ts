import { discardTimeFromDate } from "../src/utils";

describe("utils", function() {
  describe("discardTimeFromDate", function() {
    it("sets time values to 0", function() {
      const dateTime = new Date(2018, 3, 2, 10, 59, 48, 432);

      const date = discardTimeFromDate(dateTime);

      expect(date.getHours()).toEqual(0);
      expect(date.getMinutes()).toEqual(0);
      expect(date.getSeconds()).toEqual(0);
      expect(date.getMilliseconds()).toEqual(0);
    });
  });
});
