import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CashInModal = ({ show, handleClose, handleSubmit }) => {
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
          <Form.Group controlId="paypalEmail">
            <Form.Label>PayPal Email</Form.Label>
            <Form.Control
              type="email"
              name="paypalEmail"
              placeholder="Enter your PayPal email"
              value={paymentDetails.paypalEmail || ""}
              onChange={handlePaymentDetailsChange}
            />
          </Form.Group>
        );
      case "visa":
      case "mastercard":
        return (
          <>
            <Form.Group controlId="cardName">
              <Form.Label>Name on Card</Form.Label>
              <Form.Control
                type="text"
                name="cardName"
                placeholder="Enter name as on card"
                value={paymentDetails.cardName || ""}
                onChange={handlePaymentDetailsChange}
              />
            </Form.Group>
            <Form.Group controlId="cardNumber">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                placeholder="Enter card number"
                value={paymentDetails.cardNumber || ""}
                onChange={handlePaymentDetailsChange}
              />
            </Form.Group>
            <Form.Group controlId="cardExpiry">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="text"
                name="cardExpiry"
                placeholder="MM/YY"
                value={paymentDetails.cardExpiry || ""}
                onChange={handlePaymentDetailsChange}
              />
            </Form.Group>
            <Form.Group controlId="cardCVV">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="text"
                name="cardCVV"
                placeholder="Enter CVV"
                value={paymentDetails.cardCVV || ""}
                onChange={handlePaymentDetailsChange}
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
              value={paymentDetails.gcashNumber || ""}
              onChange={handlePaymentDetailsChange}
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
        <Modal.Title>Cash In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="amount">
            <Form.Label>Enter Amount:</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter the amount you want to cash in"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="paymentMethod">
            <Form.Label>Select Payment Method</Form.Label>
            <Form.Control as="select" value={paymentMethod} onChange={handlePaymentChange}>
              <option value="">Select...</option>
              <option value="paypal">PayPal</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="gcash">GCash</option>
            </Form.Control>
          </Form.Group>
          {renderBillingInfo()}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Confirm Payment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CashInModal;
