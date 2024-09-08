import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PaymentModal = ({ show, handleClose, selectedCategory, userBalance }) => {
  const [showFinancingModal, setShowFinancingModal] = useState(false);

  if (!selectedCategory) return null; // Return null if no category is selected

  const handlePaymentSubmit = () => {
    setShowFinancingModal(true); // Show the financing modal after payment submission
  };

  const handleFinancingClose = () => {
    setShowFinancingModal(false);
    handleClose(); // Close both modals
  };

  return (
    <>
      {/* Main Payment Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Payment for {selectedCategory.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" placeholder="Enter amount" />
            </Form.Group>

            <Form.Group controlId="formAccountNumber" className="mt-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control type="text" placeholder="Enter account number" />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Email (Optional)</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePaymentSubmit}>
            Submit Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Financing Options Modal */}
      <Modal show={showFinancingModal} onHide={handleFinancingClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check 
              type="radio"
              id="accountBalance"
              label={`Pay using Fintech Account Balance (₱${userBalance})`}
              name="paymentMethod"
            />
            <Form.Check 
              type="radio"
              id="sixMonthsFinancing"
              label="6 Months Financing"
              name="paymentMethod"
              className="mt-3"
            />
            <Form.Check 
              type="radio"
              id="twelveMonthsFinancing"
              label="12 Months Financing"
              name="paymentMethod"
              className="mt-3"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFinancingClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => alert('Financing option selected!')}>
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentModal;
