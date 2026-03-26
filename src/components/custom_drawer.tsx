import * as React from "react";
import { Drawer, Typography, IconButton, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronLeft } from "@mui/icons-material";
import { MenuButton } from "./menu_button";
import { groupBy, mapObjIndexed } from "ramda";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  ...theme.mixins.toolbar
}));

const DrawerCloseIcon = styled("div")({
  display: "flex",
  width: "100%",
  justifyContent: "flex-end"
});

const SubheadingTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1)
}));

const drawerWidth = 240;

interface Props {
  open: boolean;
  disabled: boolean;
  handleDrawerClose: () => void;
  pages: { path: string; text: string; group: string }[];
}

interface Page {
  path: string;
  text: string;
  group: string;
}

export class CustomDrawer extends React.Component<Props, {}> {
  renderGroup = (pages: Page[], group: string) => {
    return (
      <div key={group}>
        <Divider />
        <SubheadingTypography variant="subtitle1" color="primary">
          {group}
        </SubheadingTypography>
        {pages.map(page => (
          <MenuButton
            key={page.path}
            to={page.path}
            text={page.text}
            disabled={this.props.disabled}
            onClick={this.props.handleDrawerClose}
          />
        ))}
      </div>
    );
  };

  renderHeader() {
    return (
      <DrawerHeader>
        <Typography variant="h6">Menu</Typography>
        <DrawerCloseIcon>
          <IconButton onClick={this.props.handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </DrawerCloseIcon>
      </DrawerHeader>
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
        sx={{ "& .MuiDrawer-paper": { position: "relative", width: drawerWidth } }}
      >
        {this.renderHeader()}
        {Object.values(mapObjIndexed(this.renderGroup, groupedPages))}
      </Drawer>
    );
  }
}
