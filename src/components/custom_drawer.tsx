import * as React from "react";
import { Drawer, Typography, IconButton, Divider } from "@material-ui/core";
import { ChevronLeft } from "@material-ui/icons";
import { MenuButton } from "./menu_button";

interface Props {
  open: boolean;
  disabled: boolean;
  handleDrawerClose: () => void;
  classes: Record<string, string>;
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
        <MenuButton to="/stats" text="Repository" {...props} />
        <MenuButton to="/personal-stats" text="Personal" {...props} />
        <MenuButton to="/org-stats" text="Organization" {...props} />
        <Divider />
        <Typography
          variant="subheading"
          color="primary"
          className={this.props.classes.subheading}
        >
          Release Notes
        </Typography>
        <MenuButton to="/retrieve-release-notes" text="Retrieve" {...props} />
        <MenuButton to="/create-release-notes" text="Create" {...props} />
      </Drawer>
    );
  }
}
