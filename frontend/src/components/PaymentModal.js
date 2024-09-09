import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { generateInvoicePDF } from '../utils/pdfUtils'; // Adjust the path as necessary

const PaymentModal = ({ show, handleClose, selectedCategory, userBalance }) => {
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [email, setEmail] = useState('');
  
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
      alert('Please select a payment method.');
      return;
    }
  
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
  
    const months = selectedPaymentMethod.includes('6 Months') ? 6 : 12;
    const transactionDate = new Date().toISOString();
  
    const token = localStorage.getItem('token'); // Retrieve the token
    if (!token) {
      alert('Authentication token is missing. Please log in again.');
      return;
    }
  
    try {
      await axios.post('http://localhost:8000/api/record-credit-transaction/', {
        amount_borrowed: amountValue,
        months_term: months,
        transaction_date: transactionDate,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      alert('Payment confirmed and details saved!');
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Error saving payment details:', error.response.data);
        alert('Failed to save payment details. ' + error.response.data);
      } else {
        console.error('Error saving payment details:', error);
        alert('Failed to save payment details.');
      }
    }
  
    setShowFinancingModal(false);
  };

  const handleGenerateInvoice = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    const months = selectedPaymentMethod.includes('6 Months') ? 6 : 12;
    generateInvoicePDF(amountValue, months); // Generate the invoice
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
              <Form.Control 
                type="number" 
                placeholder="Enter amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formAccountNumber" className="mt-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter account number" 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Email (Optional)</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
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
              label={`Pay using Account Balance (₱${userBalance.amount})`}
              name="paymentMethod"
              value="Account Balance"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <Form.Check 
              type="radio"
              id="sixMonthsFinancing"
              label="6 Months Financing"
              name="paymentMethod"
              value="6 Months Financing"
              className="mt-3"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <Form.Check 
              type="radio"
              id="twelveMonthsFinancing"
              label="12 Months Financing"
              name="paymentMethod"
              value="12 Months Financing"
              className="mt-3"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
          </Form>
          {selectedPaymentMethod.includes('Financing') && (
            <Button 
              variant="primary" 
              onClick={handleGenerateInvoice} 
              className="mt-3"
            >
              Generate Invoice
            </Button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFinancingClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleConfirmPayment}>
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentModal;
