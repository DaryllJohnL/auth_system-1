import React, { useState, useEffect } from "react";
import axios from "axios";

const Loans = () => {
  const [creditLimit, setCreditLimit] = useState(50000);
  const [amountUsed, setAmountUsed] = useState(0);
  const [paymentSchedules, setPaymentSchedules] = useState({});
  const [error, setError] = useState(null);
  const [toggleState, setToggleState] = useState({});

  useEffect(() => {
    const fetchCreditData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfoResponse = await axios.get("http://localhost:8000/api/user-info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const creditLimit = 50000;
        setCreditLimit(creditLimit);

        const transactionsResponse = await axios.get("http://localhost:8000/api/credit-transactions/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Calculate total amount used across all transactions
        const totalUsed = transactionsResponse.data.reduce((total, transaction) => total + parseFloat(transaction.amount_borrowed), 0);
        setAmountUsed(totalUsed);

        // Fetch payment schedules for each transaction and group them by transaction ID
        let schedulesByTransaction = {};
        let initialToggleState = {};

        for (let transaction of transactionsResponse.data) {
          const { id, amount_borrowed, months_term, transaction_date } = transaction;

          // Send POST request to get payment schedule for each transaction
          const scheduleResponse = await axios.post("http://localhost:8000/api/payment-schedule/", {
            amount_borrowed,
            months_term,
            transaction_date,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Store payment schedule under the transaction ID
          schedulesByTransaction[id] = {
            transactionId: id,
            amountBorrowed: parseFloat(amount_borrowed), // Ensure amount_borrowed is a number
            monthsTerm: months_term,
            paymentSchedule: scheduleResponse.data.schedule,
          };

          // Set initial toggle state to false (collapsed)
          initialToggleState[id] = false;
        }

        setPaymentSchedules(schedulesByTransaction);
        setToggleState(initialToggleState);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      }
    };

    fetchCreditData();
  }, []);

  const handleToggle = (transactionId) => {
    setToggleState((prevState) => ({
      ...prevState,
      [transactionId]: !prevState[transactionId], // Toggle the visibility
    }));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Credit Summary</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="lead">Credit Limit</p>
              <h1 className="display-6">₱{creditLimit.toFixed(2)}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="lead">Amount Used</p>
              <h1 className="display-6">₱{amountUsed.toFixed(2)}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="lead">Remaining Credit</p>
              <h1 className="display-6">₱{(creditLimit - amountUsed).toFixed(2)}</h1>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-4">Payment Schedule by Transaction</h3>

      {Object.keys(paymentSchedules).length > 0 ? (
        Object.values(paymentSchedules).map((schedule) => (
          <div key={schedule.transactionId} className="mb-4">
            <h4>Transaction ID: {schedule.transactionId}</h4>
            <p>Amount Borrowed: ₱{schedule.amountBorrowed.toFixed(2)}</p>
            <p>Months Term: {schedule.monthsTerm}</p>

            <button
              className="btn btn-info mb-2"
              onClick={() => handleToggle(schedule.transactionId)}
              aria-expanded={toggleState[schedule.transactionId]}
              aria-controls={`schedule-${schedule.transactionId}`}
            >
              {toggleState[schedule.transactionId] ? "Hide Schedule" : "Show Schedule"}
            </button>

            <div className={`collapse ${toggleState[schedule.transactionId] ? "show" : ""}`} id={`schedule-${schedule.transactionId}`}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Due Date</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.paymentSchedule.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.due_date}</td>
                      <td>₱{entry.payment.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-primary">Pay</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p>No payment schedules available.</p>
      )}
    </div>
  );
};

export default Loans;
