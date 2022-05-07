import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import AuthForm from "./AuthForm";

export function AuthDialog(props: {
  open: boolean;
  setOpen: (v: boolean) => void;
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
        scroll="body"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogContent dividers={false}>
          <AuthForm onComplete={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
