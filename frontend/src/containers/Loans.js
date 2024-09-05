import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf"; // Import jsPDF

const Loans = () => {
  const [showModal, setShowModal] = useState(false);
  const [calculatedAmountPayAmountDue, setCalculatedAmountPayAmountDue] =
    useState(0);
  const [calculatedAmountPayInFull, setCalculatedAmountPayInFull] = useState(0);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const calculatePayment = async (option) => {
    let amount = 1510.11; // Base amount
    if (option === "pay-in-full") {
      amount = amount * 12;
    }

    const token = localStorage.getItem("token"); // Replace with your actual method

    try {
      const response = await axios.post(
        "http://localhost:8000/api/calculate_payment/",
        {
          amount,
          option,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the Authorization header with the JWT token
          },
        }
      );

      return response.data.final_amount || 0;
    } catch (error) {
      console.error("There was an error calculating the payment!", error);
      return 0;
    }
  };

  useEffect(() => {
    if (showModal) {
      const fetchCalculations = async () => {
        const amountDue = await calculatePayment("pay-amount-due");
        const payInFull = await calculatePayment("pay-in-full");

        setCalculatedAmountPayAmountDue(amountDue);
        setCalculatedAmountPayInFull(payInFull);
      };

      fetchCalculations();
    }
  }, [showModal]);

  // Generate the Statement of Account PDF
  const generateStatementOfAccount = () => {
    const doc = new jsPDF();

    doc.text("Statement of Account", 20, 20);
    doc.text(`Loan Account ID: HMVZ5609`, 20, 30);
    doc.text(`Amount Due: ₱${calculatedAmountPayAmountDue.toFixed(2)}`, 20, 40);
    doc.text(`Pay in Full: ₱${calculatedAmountPayInFull.toFixed(2)}`, 20, 50);
    doc.text(`Remaining Balance: ₱8,489.89`, 20, 60); // Example value

    doc.save("statement_of_account.pdf");
  };

  return (
    <div className="container">
      <div className="jumbotron mt-5">
        <p className="lead">Loan Account ID</p>
        <h5 className="display-5">HMVZ5609</h5>
        <hr className="my-4" />
        <div className="row">
          <div className="col-md-6">
            <p className="lead">My Loans</p>
            <h1 className="display-5">₱10000</h1>
          </div>
          <div className="col-md-6 d-flex justify-content-end align-items-center">
            <button className="btn btn-primary" onClick={openModal}>
              Pay now
            </button>
          </div>
        </div>

        {/* Statement of Account Button */}
        <div className="row mt-3">
          <div className="col-md-12 d-flex justify-content-center">
            <button
              className="btn btn-secondary"
              onClick={generateStatementOfAccount}
            >
              Download Statement of Account
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="paymentOptionsModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="paymentOptionsModalLabel">
                  Payment Options
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-12">
                    <h5>
                      Pay Amount Due: ₱{calculatedAmountPayAmountDue.toFixed(2)}
                    </h5>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <h5>
                      Pay in Full: ₱{calculatedAmountPayInFull.toFixed(2)}
                    </h5>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Loans;
