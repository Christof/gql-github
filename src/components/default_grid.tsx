import * as React from "react";
import { Grid } from "@material-ui/core";

export function DefaultGrid(props: {
  small?: boolean;
  children: React.ReactNode;
}) {
  const sizeProps = props.small ? { xs: 12, md: 10, lg: 8 } : { xs: 12 };

  return (
    <Grid container spacing={24} justify="center">
      <Grid item {...sizeProps as any}>
        {props.children}
      </Grid>
    </Grid>
  );
}
