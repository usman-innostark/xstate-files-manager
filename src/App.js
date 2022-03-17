import React from "react";
import { useMachine } from "@xstate/react";
import {
  AppBar,
  Button,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { createStyles } from "@mui/styles";
import { makeStyles } from "@mui/styles";
import { Close, Delete, FolderShared, Menu, Search } from "@mui/icons-material";
import blue from "@mui/material/colors/blue";
import deepPurple from "@mui/material/colors/deepPurple";
import appStateMachine from "./app.machine";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    list: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
    },
    menuButton: {
      marginLeft: -18,
      marginRight: 10,
    },
    spacer: {
      flex: "1 1 100%",
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    titleContainer: {
      flex: "0 0 auto",
    },
    title: {
      color: theme.palette.common.white,
    },
    fabProgress: {
      color: theme.palette.common.white,
      position: "absolute",
      top: 6,
      zIndex: 1,
    },
  })
);

const App = (s) => {
  const classes = useStyles();
  const [current, send] = useMachine(appStateMachine, { devTools: true });

  const itemList = current.context.items.map((item) => ({
    ...item,
    selected:
      current.context.selectedItems.findIndex(
        (selectedItem) => selectedItem.id === item.id
      ) >= 0,
  }));

  const allItemsSelected =
    current.context.selectedItems.length === current.context.items.length;

  const resetSelection = () => send({ type: "RESET_SELECTION" });
  const deleteSelection = () => send({ type: "DELETE_SELECTION" });
  const dismissPrompt = () => send({ type: "DISMISS_PROMPT" });

  const toggleSelectItem = (item) =>
    item.selected
      ? send({ type: "DESELECT_ITEM", item })
      : send({ type: "SELECT_ITEM", item });
  const toggleSelectAll = () =>
    allItemsSelected
      ? send({ type: "RESET_SELECTION" })
      : send({ type: "SELECT_ALL_ITEMS" });
  console.log(current.matches("browsing"));

  return (
    <div className={classes.root}>
      <AppBar
        position="static"
        className={
          current.matches("browsing") ? classes.bar : classes.selecting
        }
      >
        <Toolbar>
          {current.matches("selecting") ? (
            <IconButton
              onClick={resetSelection}
              className={classes.menuButton}
              color="inherit"
              aria-label="Reset Selection"
            >
              <Close />
            </IconButton>
          ) : (
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <Menu />
            </IconButton>
          )}
          <div className={classes.titleContainer}>
            {current.matches("browsing") ? (
              <Typography
                variant="h6"
                id="tableTitle"
                className={classes.title}
              >
                My files
              </Typography>
            ) : (
              <Typography color="inherit" variant="subtitle1">
                {current.context.selectedItems.length} selected
              </Typography>
            )}
          </div>
          <div className={classes.spacer} />
          <div className={classes.actions}>
            {current.matches("browsing") ? (
              <IconButton
                style={{ color: "white" }}
                color="inherit"
                aria-label="Search"
              >
                <Search />
              </IconButton>
            ) : (
              <IconButton
                style={{ color: "white" }}
                disabled={current.matches("deleting")}
                color="inherit"
                aria-label="Delete"
                onClick={deleteSelection}
              >
                <Delete />
                {current.matches("deleting") && (
                  <CircularProgress
                    size={40}
                    style={{ color: "white" }}
                    className={classes.fabProgress}
                  />
                )}
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Table aria-labelledby="tableTitle">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox checked={allItemsSelected} onChange={toggleSelectAll} />
            </TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Last Modified</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemList.map((item) => (
            <TableRow
              hover
              onClick={() => toggleSelectItem(item)}
              role="checkbox"
              tabIndex={-1}
              key={item.id}
              selected={item.selected}
            >
              <TableCell padding="checkbox">
                {current.matches("browsing") ? (
                  <IconButton>
                    <FolderShared />
                  </IconButton>
                ) : (
                  <Checkbox checked={item.selected} />
                )}
              </TableCell>
              <TableCell component="th" scope="row">
                {item.title}
              </TableCell>
              <TableCell>{item.owner}</TableCell>
              <TableCell>{item.updatedAt.toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={current.matches("prompting")}
        keepMounted
        onClose={dismissPrompt}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          Error deleting selection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            An error occured and we were not able to delete your selection.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismissPrompt} color="primary">
            Ok
          </Button>
          <Button onClick={deleteSelection} color="primary">
            Retry
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
