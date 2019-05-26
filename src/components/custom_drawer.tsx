import * as React from "react";
import { Drawer, Typography, IconButton, Divider } from "@material-ui/core";
import { ChevronLeft } from "@material-ui/icons";
import { MenuButton } from "./menu_button";
import { groupBy, mapObjIndexed } from "ramda";

interface Props {
  open: boolean;
  disabled: boolean;
  handleDrawerClose: () => void;
  classes: Record<string, string>;
  pages: { path: string; text: string; group: string }[];
}

interface Page {
  path: string;
  text: string;
  group: string;
}

export class CustomDrawer extends React.Component<Props, {}> {
  renderGroup = (pages: Page[], group: string) => {
    const props = {
      disabled: this.props.disabled,
      onClick: this.props.handleDrawerClose,
      activeClassName: this.props.classes.menuItemActive
    };

    return (
      <div key={group}>
        <Divider />
        <Typography
          variant="subtitle1"
          color="primary"
          className={this.props.classes.subheading}
        >
          {group}
        </Typography>
        {pages.map(page => (
          <MenuButton
            key={page.path}
            to={page.path}
            text={page.text}
            {...props}
          />
        ))}
      </div>
    );
  };

  renderHeader() {
    return (
      <div className={this.props.classes.drawerHeader}>
        <Typography variant="h6">Menu</Typography>
        <div className={this.props.classes.drawerCloseIcon}>
          <IconButton onClick={this.props.handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
      </div>
    );
  }

  render() {
    const groupedPages = groupBy(page => page.group, this.props.pages);

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
        {this.renderHeader()}

        {Object.values(mapObjIndexed(this.renderGroup, groupedPages))}
      </Drawer>
    );
  }
}
