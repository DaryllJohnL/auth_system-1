import React from "react";
import { Modal, Button } from "react-bootstrap";

const PaymentOptionsModal = ({ show, handleClose, userBalance, handleSubmit }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Choose Payment Option</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Select your preferred payment method:</p>
        <ul>
          <li>
            <Button variant="primary" onClick={() => handleSubmit("Fintech Account")}>
              Pay Using Fintech Account (₱{userBalance})
            </Button>
          </li>
          <li>
            <Button variant="secondary" onClick={() => handleSubmit("6 Months Financing")}>
              6 Months Financing
            </Button>
          </li>
          <li>
            <Button variant="secondary" onClick={() => handleSubmit("12 Months Financing")}>
              12 Months Financing
            </Button>
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentOptionsModal;
