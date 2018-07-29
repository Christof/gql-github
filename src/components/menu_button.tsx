import * as React from "react";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

interface Props {
  text: string;
  to: string;
  disabled: boolean;
  className: string;
}

export class MenuButton extends React.Component<Props, {}> {
  render() {
    const { text, to, ...rest } = this.props;
    const isActive = window.location.pathname === to;
    return (
      <Button
        component={props => <Link to={to} {...props} innerRef={undefined} />}
        variant="raised"
        color={isActive ? "secondary" : "primary"}
        {...rest}
      >
        {text}
      </Button>
    );
  }
}
