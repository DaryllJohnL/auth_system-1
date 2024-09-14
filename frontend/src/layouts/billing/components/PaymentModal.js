/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import axios from "axios";
import { generateInvoicePDF } from "../utils/pdfUtils"; // Adjust the path as necessary
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PaymentModal = ({ show, handleClose, selectedCategory, userBalance }) => {
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [email, setEmail] = useState("");

  if (!selectedCategory) return null; // Return null if no category is selected

  const handlePaymentSubmit = () => {
    handleClose(); // Close Payment Modal first
    setTimeout(() => {
      setShowFinancingModal(true); // Open Financing Modal after Payment Modal closes
    }, 300); // Add slight delay to ensure Payment Modal closes smoothly
  };

  const handleFinancingClose = () => {
    setShowFinancingModal(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const token = localStorage.getItem("token"); // Retrieve the token
    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      return;
    }

    if (selectedPaymentMethod === "Account Balance") {
      // Check if user has sufficient balance
      if (amountValue > userBalance.amount) {
        alert("Insufficient balance.");
        return;
      }

      try {
        // Deduct balance in backend
        await axios.post(
          "http://localhost:8000/api/deduct-balance/",
          {
            amount: amountValue,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Payment using account balance confirmed!");
        window.location.reload();
      } catch (error) {
        console.error("Error during payment:", error.response ? error.response.data : error);
        alert("Failed to process payment.");
      }
    } else {
      const months = selectedPaymentMethod.includes("6 Months") ? 6 : 12;
      const transactionDate = new Date().toISOString();
      try {
        await axios.post(
          "http://localhost:8000/api/record-credit-transaction/",
          {
            amount_borrowed: amountValue,
            months_term: months,
            transaction_date: transactionDate,
            description: `${selectedCategory.name}`,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Payment confirmed and details saved!");
      } catch (error) {
        console.error(
          "Error saving payment details:",
          error.response ? error.response.data : error
        );
        alert("Failed to save payment details.");
      }
    }

    setShowFinancingModal(false);
  };

  const handleGenerateInvoice = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const months = selectedPaymentMethod.includes("6 Months") ? 6 : 12;
    generateInvoicePDF(amountValue, months); // Generate the invoice
  };

  return (
    <>
      {/* Main Payment Modal */}
      <Modal
        open={show}
        onClose={handleClose}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <MDBox sx={{ ...style, width: 400 }}>
          <MDTypography variant="h6" id="payment-modal-title">
            Payment for {selectedCategory.name}
          </MDTypography>
          <Box component="form" noValidate autoComplete="off" mt={2}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Account Number"
              fullWidth
              margin="normal"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <TextField
              label="Email (Optional)"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: "#333",
                borderColor: "#333",
                "&:hover": { borderColor: "#333", backgroundColor: "#f0f0f0" },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePaymentSubmit}
              sx={{
                color: "#333",
                backgroundColor: "#007bff",
                "&:hover": { backgroundColor: "#0056b3" },
              }}
            >
              Submit Payment
            </Button>
          </Box>
        </MDBox>
      </Modal>

      {/* Financing Options Modal */}
      <Modal
        open={showFinancingModal}
        onClose={handleFinancingClose}
        aria-labelledby="financing-modal-title"
        aria-describedby="financing-modal-description"
      >
        <MDBox sx={{ ...style, width: 400 }}>
          <MDTypography variant="h6" id="financing-modal-title">
            Select Payment Method
          </MDTypography>
          <FormControl component="fieldset" margin="normal">
            <RadioGroup
              aria-label="payment-method"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="Account Balance"
                control={<Radio />}
                label={`Pay using Account Balance (₱${userBalance})`}
              />
              <FormControlLabel
                value="6 Months Financing"
                control={<Radio />}
                label="6 Months Financing"
                className="mt-3"
              />
              <FormControlLabel
                value="12 Months Financing"
                control={<Radio />}
                label="12 Months Financing"
                className="mt-3"
              />
            </RadioGroup>
            {selectedPaymentMethod.includes("Financing") && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateInvoice}
                sx={{
                  color: "#333",
                  backgroundColor: "#007bff",
                  mt: 2,
                  "&:hover": { backgroundColor: "#0056b3" },
                }}
              >
                Generate Invoice
              </Button>
            )}
          </FormControl>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleFinancingClose}
              sx={{
                color: "#333",
                borderColor: "#333",
                "&:hover": { borderColor: "#333", backgroundColor: "#f0f0f0" },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmPayment}
              sx={{
                color: "#333",
                backgroundColor: "#007bff",
                "&:hover": { backgroundColor: "#0056b3" },
              }}
            >
              Confirm Payment
            </Button>
          </Box>
        </MDBox>
      </Modal>
    </>
  );
};

// Style for the modals
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default PaymentModal;
