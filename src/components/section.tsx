import * as React from "react";
import { Paper, Typography } from "@mui/material";
import { PaperProps } from "@mui/material/Paper";

const style = {
  marginTop: 8,
  marginBottom: 16,
  padding: 12
};

export const Section = (props: PaperProps & { heading?: string }) => (
  <Paper {...props} style={style}>
    {props.heading ? (
      <Typography variant="h5" paragraph>
        {props.heading}
      </Typography>
    ) : null}
    {props.children}
  </Paper>
);
