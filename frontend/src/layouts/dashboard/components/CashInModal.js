import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

// eslint-disable-next-line react/prop-types
const CashInModal = ({ open, handleClose, handleSubmit }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({});

  const handlePaymentChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setPaymentDetails({});
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const onSubmit = () => {
    if (amount && !isNaN(amount) && Number(amount) > 0) {
      if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
      }
      handleSubmit(amount, paymentMethod, paymentDetails);
    } else {
      alert("Please enter a valid amount.");
    }
  };

  const renderBillingInfo = () => {
    switch (paymentMethod) {
      case "paypal":
        return (
          <TextField
            fullWidth
            label="PayPal Email"
            name="paypalEmail"
            type="email"
            placeholder="Enter your PayPal email"
            value={paymentDetails.paypalEmail || ""}
            onChange={handlePaymentDetailsChange}
            margin="normal"
          />
        );
      case "visa":
      case "mastercard":
        return (
          <>
            <TextField
              fullWidth
              label="Name on Card"
              name="cardName"
              placeholder="Enter name as on card"
              value={paymentDetails.cardName || ""}
              onChange={handlePaymentDetailsChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              placeholder="Enter card number"
              value={paymentDetails.cardNumber || ""}
              onChange={handlePaymentDetailsChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Expiry Date (MM/YY)"
              name="cardExpiry"
              placeholder="MM/YY"
              value={paymentDetails.cardExpiry || ""}
              onChange={handlePaymentDetailsChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="CVV"
              name="cardCVV"
              placeholder="Enter CVV"
              value={paymentDetails.cardCVV || ""}
              onChange={handlePaymentDetailsChange}
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
            value={paymentDetails.gcashNumber || ""}
            onChange={handlePaymentDetailsChange}
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Cash In</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Enter Amount"
          type="number"
          placeholder="Enter the amount you want to cash in"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Select Payment Method"
          value={paymentMethod}
          onChange={handlePaymentChange}
          margin="normal"
        >
          <MenuItem value="">Select...</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="visa">Visa</MenuItem>
          <MenuItem value="mastercard">Mastercard</MenuItem>
          <MenuItem value="gcash">GCash</MenuItem>
        </TextField>
        {renderBillingInfo()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
        <Button onClick={onSubmit} color="primary">
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CashInModal;
