import * as React from "react";
import { Paper, Typography } from "@material-ui/core";
import { PaperProps } from "@material-ui/core/Paper";

const style = {
  marginTop: 8,
  marginBottom: 16,
  padding: 12
};

export const Section = (props: PaperProps & { heading?: string }) => (
  <Paper {...props} style={style}>
    {props.heading ? (
      <Typography variant="headline" paragraph>
        {props.heading}
      </Typography>
    ) : null}
    {props.children}
  </Paper>
);
