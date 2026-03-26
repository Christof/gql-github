import * as React from "react";
import { MenuItem } from "@mui/material";
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
    const isActive = window.location.pathname === this.props.to;

    return (
      <MenuItem
        component={Link as any}
        className={this.props.className}
        sx={isActive ? { backgroundColor: "action.selected" } : undefined}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        to={this.props.to}
      >
        {this.props.text}
      </MenuItem>
    );
  }
}
