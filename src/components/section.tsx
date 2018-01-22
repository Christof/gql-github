import * as React from "react";
import { Paper } from "material-ui";
import { PaperProps } from "material-ui/Paper";

const style = {
  marginTop: 8,
  marginBottom: 16,
  padding: 12
};

export const Section = (props: PaperProps) => (
  <Paper {...props} style={style} />
);
