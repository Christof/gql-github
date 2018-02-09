import * as React from "react";
import { Grid } from "material-ui";

export function DefaultGrid(props: { children: React.ReactNode }) {
  return (
    <Grid container spacing={24} justify="center">
      <Grid item xs={12}>
        {props.children}
      </Grid>
    </Grid>
  );
}
