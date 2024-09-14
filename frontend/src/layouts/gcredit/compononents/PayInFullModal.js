/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import axios from "axios";
import MessageModal from "./MessageModal";

const PayInFullModal = ({ show, handleClose, transaction, accountBalance, dueDate }) => {
  const [totalToPay, setTotalToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    title: "",
    message: "",
  });
  useEffect(() => {
    if (show && transaction) {
      const fetchTotalToPay = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            "http://localhost:8000/auth/calculate_payment/",
            {
              originalAmount: transaction.amountBorrowed,
              totalAmount: transaction.totalAmount,
              option: "full-payment",
              due_date: dueDate,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTotalToPay(response.data.final_amount);
        } catch (err) {
          setError("Failed to calculate total payment.");
        } finally {
          setLoading(false);
        }
      };

      fetchTotalToPay();
    }
  }, [show, transaction, dueDate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const deductionResponse = await axios.post(
        "http://localhost:8000/api/deduct-balance/",
        {
          amount: totalToPay,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (deductionResponse.status === 200) {
        await axios.delete(
          `http://localhost:8000/api/delete-transaction/${transaction.transactionId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const transactionResponse = await fetch("http://localhost:8000/api/transaction/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: transaction.id, // Include the user ID
            transaction_type: "credit_payment",
            amount: totalToPay,
            description: `Payment for ${transaction.description}`,
          }),
        });

        if (!transactionResponse.ok) {
          const transactionError = await transactionResponse.json();
          console.error("Error creating transaction:", transactionError);
          setMessageModal({
            show: true,
            title: "Transaction Error",
            message: `Error recording transaction: ${transactionError.error}`,
          });
        }

        setMessageModal({
          show: true,
          title: "Payment Successful",
          message: "Payment confirmed!",
        });
        setPaymentSuccess(true);
        handleClose();
        Windows.location.reload;
      }
    } catch (err) {
      setMessageModal({
        show: true,
        title: "Payment Error",
        message: "Failed to confirm payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <MDTypography variant="h6">Pay in Full</MDTypography>
        </DialogTitle>
        <DialogContent>
          {transaction && (
            <MDBox>
              <MDTypography variant="body1">
                <strong>Payment For</strong> {transaction.description}
              </MDTypography>
              <MDTypography variant="body1">
                <strong>Original Amount:</strong> ₱{transaction.totalAmount}
              </MDTypography>
              <MDTypography variant="body1">
                <strong>Account Balance:</strong> ₱{accountBalance}
              </MDTypography>
              {loading ? (
                <MDBox display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </MDBox>
              ) : error ? (
                <MDTypography variant="body2" color="error">
                  {error}
                </MDTypography>
              ) : (
                <MDTypography variant="body1">
                  <strong>Total Amount to Pay:</strong> ₱{totalToPay}
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClose} variant="outlined" color="secondary">
            Close
          </MDButton>
          <MDButton
            onClick={handleConfirmPayment}
            variant="contained"
            color="info"
            disabled={loading || error}
          >
            Confirm Payment
          </MDButton>
        </DialogActions>
      </Dialog>

      <MessageModal
        show={messageModal.show}
        title={messageModal.title}
        message={messageModal.message}
        handleClose={() => setMessageModal({ ...messageModal, show: false })}
      />
    </>
  );
};

export default PayInFullModal;
