import * as React from "react";
import { CommitsOverTimePlot } from "../../src/components/commits_over_time_plot";
import { shallow } from "enzyme";

describe("CommitsOverTimePlot", function() {
  it("renders plots with time as x axis", function() {
    const title = "my plot";
    const data = [
      {
        x: [new Date(1970, 0, 1), new Date(1970, 0, 2), new Date(1970, 0, 3)],
        y: [1, 2, 3]
      }
    ];
    const wrapper = shallow(<CommitsOverTimePlot title={title} data={data} />);

    const layout = (wrapper.instance() as any).layout;
    expect(layout.title).toEqual(title);
    expect(layout.xaxis.title).toEqual("time");

    expect(wrapper.find("PlotlyChart")).toHaveLength(1);
    expect(wrapper.find("PlotlyChart").prop("data")).toEqual(data);
  });
});
