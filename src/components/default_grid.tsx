import * as React from "react";
import { Grid } from "@mui/material";

export function DefaultGrid(props: {
  small?: boolean;
  children: React.ReactNode;
}) {
  const sizeProps = props.small ? { xs: 12, md: 10, lg: 8 } : { xs: 12 };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={sizeProps as any}>
        {props.children}
      </Grid>
    </Grid>
  );
}
