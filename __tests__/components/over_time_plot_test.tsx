import * as React from "react";
import { OverTimePlot } from "../../src/components/over_time_plot";
import { shallow } from "enzyme";
import PlotlyChart from "react-plotlyjs-ts";

describe("OverTimePlot", function() {
  it("renders plots with time as x axis", function() {
    const title = "my plot";
    const data = [
      {
        x: [new Date(1970, 0, 1), new Date(1970, 0, 2), new Date(1970, 0, 3)],
        y: [1, 2, 3]
      }
    ];
    const wrapper = shallow(<OverTimePlot title={title} data={data} />);

    const layout = (wrapper.instance() as any).layout;
    expect(layout.title).toEqual(title);
    expect(layout.xaxis.title).toEqual("time");
    expect(layout.yaxis.title).toEqual("commit count");

    expect(wrapper.find(PlotlyChart)).toHaveLength(1);
    expect(wrapper.find(PlotlyChart).prop("data")).toEqual(data);
  });

  it("renders plots with custom as y axis title", function() {
    const title = "my plot";
    const data = [
      {
        x: [new Date(1970, 0, 1), new Date(1970, 0, 2), new Date(1970, 0, 3)],
        y: [1, 2, 3]
      }
    ];
    const wrapper = shallow(
      <OverTimePlot title={title} data={data} yaxisTitle="custom title" />
    );

    const layout = (wrapper.instance() as any).layout;
    expect(layout.title).toEqual(title);
    expect(layout.xaxis.title).toEqual("time");
    expect(layout.yaxis.title).toEqual("custom title");

    expect(wrapper.find(PlotlyChart)).toHaveLength(1);
    expect(wrapper.find(PlotlyChart).prop("data")).toEqual(data);
  });
});
