import * as React from "react";
import { Drawer, Typography, IconButton, Divider } from "@material-ui/core";
import { ChevronLeft } from "@material-ui/icons";
import { MenuButton } from "./menu_button";

interface Props {
  open: boolean;
  disabled: boolean;
  handleDrawerClose: () => void;
  classes: Record<string, string>;
  pages: { path: string; text: string }[];
}

export class CustomDrawer extends React.Component<Props, {}> {
  render() {
    const props = {
      disabled: this.props.disabled,
      onClick: this.props.handleDrawerClose,
      activeClassName: this.props.classes.menuItemActive
    };

    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={this.props.open}
        onClose={this.props.handleDrawerClose}
        classes={{
          paper: this.props.classes.drawerPaper
        }}
      >
        <div className={this.props.classes.drawerHeader}>
          <Typography>Menu</Typography>
          <div className={this.props.classes.drawerCloseIcon}>
            <IconButton onClick={this.props.handleDrawerClose}>
              <ChevronLeft />
            </IconButton>
          </div>
        </div>
        <Divider />
        <Typography
          variant="subheading"
          color="primary"
          className={this.props.classes.subheading}
        >
          Statistics
        </Typography>
        {this.props.pages
          .filter(page => page.path.includes("stats"))
          .map(page => (
            <MenuButton
              key={page.path}
              to={page.path}
              text={page.text}
              {...props}
            />
          ))}
        <Divider />
        <Typography
          variant="subheading"
          color="primary"
          className={this.props.classes.subheading}
        >
          Release Notes
        </Typography>
        {this.props.pages
          .filter(page => page.path.includes("release-notes"))
          .map(page => (
            <MenuButton
              key={page.path}
              to={page.path}
              text={page.text}
              {...props}
            />
          ))}
      </Drawer>
    );
  }
}
