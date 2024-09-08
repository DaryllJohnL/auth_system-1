import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Loans = () => {
  const [showModal, setShowModal] = useState(false);
  const [calculatedAmountPayAmountDue, setCalculatedAmountPayAmountDue] = useState(0);
  const [calculatedAmountPayInFull, setCalculatedAmountPayInFull] = useState(0);
  const [calculatedAmountInterestFree, setCalculatedAmountInterestFree] = useState(0);
  const [calculatedAmountWithPenalty, setCalculatedAmountWithPenalty] = useState(0);
  const [paymentOption, setPaymentOption] = useState(""); // State for payment option

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const calculatePayment = async (option) => {
    let amount = 10000; // Base amount

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
        const financing = await calculatePayment("financing");
        const payInFull = await calculatePayment("full-payment");
        const interestFree = await calculatePayment("30-day-interest-free");
        const withPenalty = await calculatePayment("after-30-days");
        setCalculatedAmountPayAmountDue(financing);
        setCalculatedAmountPayInFull(payInFull);
        setCalculatedAmountInterestFree(interestFree);
        setCalculatedAmountWithPenalty(withPenalty);
      };

      fetchCalculations();
    }
  }, [showModal]);

  // Generate the Statement of Account PDF
  const generateStatementOfAccount = () => {
    // Initialize jsPDF
    const doc = new jsPDF();

    // Get the current date for the statement date
    const today = new Date();
    const statementDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Calculate the due date (e.g., 30 days from the statement date)
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30); // Adds 30 days to the current date
    const formattedDueDate = dueDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Example data for the statement
    const totalBalanceDue = 10000;  // Replace with actual dynamic data
    const minimumPaymentDue = 1500; // Replace with actual dynamic data
    const cardNumber = "**** **** **** 1234"; // Replace with actual dynamic data
    const creditLimit = 50000;      // Replace with actual dynamic data
    const cashAdvanceLimit = 10000; // Replace with actual dynamic data
    const monthlyInterestRate = 3.5; // Replace with actual dynamic data (as percentage)
    const monthlyEIR = 4.2;         // Replace with actual dynamic data (as percentage)

    // Add title
    doc.text("Statement of Account", 14, 15);

    // Define the table headers and data
    const tableData = [
      ["Statement Date", statementDate],
      ["Due Date", formattedDueDate],
      ["Total Balance Due", `₱${totalBalanceDue.toFixed(2)}`],  // Use \u20B1 for peso
      ["Minimum Payment Due", `₱${minimumPaymentDue.toFixed(2)}`], 
      ["Card Number", cardNumber],
      ["Credit Limit", `₱${creditLimit.toFixed(2)}`],  
      ["Cash Advance Limit", `₱${cashAdvanceLimit.toFixed(2)}`],  
      ["Monthly Interest Rate", `${monthlyInterestRate.toFixed(2)}%`],
      ["Monthly EIR", `${monthlyEIR.toFixed(2)}%`]
    ];

    // Create table using autoTable
    doc.autoTable({
      head: [["Details", "Value"]], // Table headers
      body: tableData,               // Table data (as array of arrays)
      startY: 30,                    // Y position where the table should start
      theme: "grid",                 // Optional: set the table theme (striped, grid, plain)
      headStyles: { fillColor: [233, 236, 239] }, // Optional: Light gray header background
    });

    // Save the PDF
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
                {/* Payment Option Selection */}
                <div className="mb-3">
                  <label htmlFor="paymentOption" className="form-label">Select Payment Type:</label>
                  <select
                    id="paymentOption"
                    className="form-select"
                    value={paymentOption}
                    onChange={(e) => setPaymentOption(e.target.value)}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="property-tax">Property Tax</option>
                    <option value="business-tax">Business Tax</option>
                    <option value="other-fees">Other Fees, Licenses and Permits</option>
                  </select>
                </div>

                {/* Payment Amount Display */}
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
                <div className="row mb-3">
                  <div className="col-md-12">
                    <h5>
                    30-day-interest-free: ₱{calculatedAmountInterestFree.toFixed(2)}
                    </h5>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <h5>
                    After 30 days: ₱{calculatedAmountWithPenalty.toFixed(2)}
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
                  {/* Add a button to handle payment based on selected option */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (paymentOption) {
                        // Handle payment based on selected option
                        console.log(`Selected Payment Option: ${paymentOption}`);
                        closeModal();
                      } else {
                        alert("Please select a payment type.");
                      }
                    }}
                  >
                    Proceed with Payment
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
