import * as React from "react";
import { MenuItem } from "@material-ui/core";
import { Link } from "react-router-dom";

interface Props {
  text: string;
  to: string;
  disabled: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export class MenuButton extends React.Component<Props, {}> {
  render() {
    const { text, to } = this.props;
    const isActive = window.location.pathname === to;
    return (
      <MenuItem
        component={Link as any}
        color={isActive ? "secondary" : "primary"}
        {...this.props}
      >
        {text}
      </MenuItem>
    );
  }
}
