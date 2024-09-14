/* eslint-disable react/prop-types */
import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const MessageModal = ({ show, title, message, handleClose }) => {
  return (
    <Modal
      open={show}
      onClose={handleClose}
      aria-labelledby="message-modal-title"
      aria-describedby="message-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="message-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="message-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MessageModal;
