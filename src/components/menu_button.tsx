import * as React from "react";
import { MenuItem } from "@material-ui/core";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface Props {
  text: string;
  to: string;
  disabled: boolean;
  className?: string;
  activeClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export class MenuButton extends React.Component<Props, {}> {
  render() {
    const linkProps = { to: this.props.to };
    const isActive = window.location.pathname === this.props.to;

    return (
      <MenuItem
        component={Link as any}
        className={classNames(
          this.props.className,
          isActive && this.props.activeClassName
        )}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        {...linkProps}
      >
        {this.props.text}
      </MenuItem>
    );
  }
}
