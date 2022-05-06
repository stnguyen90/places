import React from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
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
        </DialogActions>
      </Dialog>
    </div>
  );
}
