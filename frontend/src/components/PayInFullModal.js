import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import MessageModal from "./MessageModal";

const PayInFullModal = ({ show, handleClose, transaction, accountBalance, dueDate }) => {
  const [totalToPay, setTotalToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    title: '',
    message: '',
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
              originalAmount: transaction.originalAmount,
              totalAmount: transaction.totalAmount,
              option: "full-payment",
              due_date: dueDate, // Pass the due date
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
        await axios.delete(`http://localhost:8000/api/delete-transaction/${transaction.transactionId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessageModal({
          show: true,
          title: 'Payment Successful',
          message: 'Payment confirmed, balance deducted, and transaction deleted!',
        });
        setPaymentSuccess(true);
        handleClose();
        window.location.reload();
      }
    } catch (err) {
      setMessageModal({
        show: true,
        title: 'Payment Error',
        message: 'Failed to confirm payment or delete transaction.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                <p><strong>Total Amount to Pay:</strong> ₱{totalToPay.toFixed(2)}</p>
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
            onClick={handleConfirmPayment}
            disabled={loading || error}
          >
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>

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
