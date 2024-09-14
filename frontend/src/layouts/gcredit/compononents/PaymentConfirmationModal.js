/* eslint-disable react/prop-types */
import React from "react";
import { Modal, Box, Button } from "@mui/material";
import MDTypography from "components/MDTypography";

function PaymentConfirmationModal({ open, handleClose, handleConfirm, paymentAmount, month }) {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <MDTypography variant="h6" mb={2}>
          Confirm Payment
        </MDTypography>
        <MDTypography mb={2}>
          Are you sure you want to pay ₱{paymentAmount.toFixed(2)}?
        </MDTypography>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default PaymentConfirmationModal;
