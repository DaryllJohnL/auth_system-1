import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const WithdrawModal = ({ show, handleClose, handleSubmit }) => {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState({});

  const handleMethodChange = (e) => {
    const method = e.target.value;
    setWithdrawMethod(method);
    setWithdrawDetails({});
  };

  const handleDetailsChange = (e) => {
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
          <Form.Group controlId="paypalEmail">
            <Form.Label>PayPal Email</Form.Label>
            <Form.Control
              type="email"
              name="paypalEmail"
              placeholder="Enter your PayPal email"
              value={withdrawDetails.paypalEmail || ""}
              onChange={handleDetailsChange}
            />
          </Form.Group>
        );
      case "bank_transfer":
        return (
          <>
            <Form.Group controlId="bankName">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control
                type="text"
                name="bankName"
                placeholder="Enter your Bank Name"
                value={withdrawDetails.bankName || ""}
                onChange={handleDetailsChange}
              />
            </Form.Group>
            <Form.Group controlId="bankAccountNumber">
              <Form.Label>Bank Account Number</Form.Label>
              <Form.Control
                type="text"
                name="bankAccountNumber"
                placeholder="Enter your Bank Account Number"
                value={withdrawDetails.bankAccountNumber || ""}
                onChange={handleDetailsChange}
              />
            </Form.Group>
          </>
        );
      case "gcash":
        return (
          <Form.Group controlId="gcashNumber">
            <Form.Label>GCash Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="gcashNumber"
              placeholder="Enter your GCash number"
              value={withdrawDetails.gcashNumber || ""}
              onChange={handleDetailsChange}
            />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Withdraw Funds</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="amount">
            <Form.Label>Enter Amount:</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter the amount you want to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="withdrawMethod">
            <Form.Label>Select Withdrawal Method</Form.Label>
            <Form.Control as="select" value={withdrawMethod} onChange={handleMethodChange}>
              <option value="">Select...</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="gcash">GCash</option>
            </Form.Control>
          </Form.Group>
          {renderWithdrawInfo()}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Confirm Withdrawal
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WithdrawModal;
