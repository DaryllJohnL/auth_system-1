import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

const PayInFullModal = ({ show, handleClose, transaction, accountBalance }) => {
  const [totalToPay, setTotalToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && transaction) {
      const fetchTotalToPay = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            "http://localhost:8000/auth/calculate_payment/",
            {
              amount: transaction.totalAmount, // Pass the transaction amount
              option: "full-payment",           // Pass the full-payment option
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
  }, [show, transaction]); // Run this effect when the modal is opened and transaction changes

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Pay in Full</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {transaction && (
          <div>
            <p><strong>Transaction ID:</strong> {transaction.transactionId}</p>
            <p><strong>Original Amount:</strong> ₱{transaction.totalAmount.toFixed(2)}</p>
            <p><strong>Account Balance:</strong> ₱{accountBalance.toFixed(2)}</p>
            {loading ? (
              <p>Calculating total amount to pay...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <p><strong>Total Amount to Pay (5% discount):</strong> ₱{totalToPay.toFixed(2)}</p>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            console.log(`Paying transaction ${transaction.transactionId} in full.`);
            handleClose();
          }}
          disabled={loading || error}
        >
          Confirm Payment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PayInFullModal;
