import * as React from "react";
import { Paper, Typography } from "material-ui";
import { PaperProps } from "material-ui/Paper";

const style = {
  marginTop: 8,
  marginBottom: 16,
  padding: 12
};

export const Section = (props: PaperProps) => (
  <Paper {...props} style={style} />
);

export const SectionWithHeading = (props: PaperProps & { heading: string }) => (
  <Paper {...props} style={style}>
    <Typography variant="headline" paragraph>
      {props.heading}
    </Typography>
    {props.children}
  </Paper>
);
