import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { Place } from "../../services/types";
import { PlaceTabs } from "./PlaceTabs";

export function PlaceDialog(props: {
  open: boolean;
  setOpen: (v: boolean) => void;
  place: Place | null;
}) {
  const { open, setOpen } = props;

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      {/* <Button onClick={handleClickOpen("paper")}>scroll=paper</Button>
       <Button onClick={handleClickOpen("body")}>scroll=body</Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        scroll="body"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogContent dividers={false}>
          <PlaceTabs place={props.place} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
          {/* <Button onClick={handleClose} variant="contained">
            Add Comment
          </Button> */}
        </DialogActions>
      </Dialog>
    </div>
  );
}
