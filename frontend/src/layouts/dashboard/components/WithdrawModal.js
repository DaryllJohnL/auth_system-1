import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

// eslint-disable-next-line react/prop-types
const WithdrawModal = ({ open, handleClose, handleSubmit }) => {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState({});

  const handleWithdrawChange = (e) => {
    const method = e.target.value;
    setWithdrawMethod(method);
    setWithdrawDetails({});
  };

  const handleWithdrawDetailsChange = (e) => {
    const { name, value } = e.target;
    setWithdrawDetails({ ...withdrawDetails, [name]: value });
  };

  const onSubmit = () => {
    if (amount && !isNaN(amount) && Number(amount) > 0) {
      if (!withdrawMethod) {
        alert("Please select a withdrawal method.");
        return;
      }
      handleSubmit(amount, withdrawMethod, withdrawDetails);
    } else {
      alert("Please enter a valid amount.");
    }
  };

  const renderWithdrawInfo = () => {
    switch (withdrawMethod) {
      case "paypal":
        return (
          <TextField
            fullWidth
            label="PayPal Email"
            name="paypalEmail"
            type="email"
            placeholder="Enter your PayPal email"
            value={withdrawDetails.paypalEmail || ""}
            onChange={handleWithdrawDetailsChange}
            margin="normal"
          />
        );
      case "bank":
        return (
          <>
            <TextField
              fullWidth
              label="Account Name"
              name="accountName"
              placeholder="Enter account name"
              value={withdrawDetails.accountName || ""}
              onChange={handleWithdrawDetailsChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              placeholder="Enter account number"
              value={withdrawDetails.accountNumber || ""}
              onChange={handleWithdrawDetailsChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              placeholder="Enter bank name"
              value={withdrawDetails.bankName || ""}
              onChange={handleWithdrawDetailsChange}
              margin="normal"
            />
          </>
        );
      case "gcash":
        return (
          <TextField
            fullWidth
            label="GCash Mobile Number"
            name="gcashNumber"
            placeholder="Enter your GCash number"
            value={withdrawDetails.gcashNumber || ""}
            onChange={handleWithdrawDetailsChange}
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Withdraw</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Enter Amount"
          type="number"
          placeholder="Enter the amount you want to withdraw"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Select Withdrawal Method"
          value={withdrawMethod}
          onChange={handleWithdrawChange}
          margin="normal"
        >
          <MenuItem value="">Select...</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="bank">Bank Transfer</MenuItem>
          <MenuItem value="gcash">GCash</MenuItem>
        </TextField>
        {renderWithdrawInfo()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
        <Button onClick={onSubmit} color="primary">
          Confirm Withdrawal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawModal;
