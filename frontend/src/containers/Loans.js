import React, { useState, useEffect } from "react";
import axios from "axios";
import PayInFullModal from "../components/PayInFullModal"; // Import the new component

const Loans = () => {
  const [creditLimit, setCreditLimit] = useState(50000);
  const [amountUsed, setAmountUsed] = useState(0);
  const [paymentSchedules, setPaymentSchedules] = useState({});
  const [error, setError] = useState(null);
  const [toggleState, setToggleState] = useState({});
  const [accountBalance, setAccountBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchCreditData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userInfoResponse = await axios.get("http://localhost:8000/api/user-info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        
        
        if (userInfoResponse.data && userInfoResponse.data.balance !== undefined) {
          const balance = parseFloat(userInfoResponse.data.balance);
          setAccountBalance(balance);
        }

        const transactionsResponse = await axios.get("http://localhost:8000/api/credit-transactions/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const totalUsed = transactionsResponse.data.reduce(
          (total, transaction) => total + parseFloat(transaction.amount_borrowed),
          0
        );
        setAmountUsed(totalUsed);

        let schedulesByTransaction = {};
        let initialToggleState = {};

        for (let transaction of transactionsResponse.data) {
          const { id, amount_borrowed, months_term, transaction_date } = transaction;

          const scheduleResponse = await axios.post(
            "http://localhost:8000/api/payment-schedule/",
            {
              amount_borrowed,
              months_term,
              transaction_date,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          schedulesByTransaction[id] = {
            transactionId: id,
            amountBorrowed: parseFloat(amount_borrowed),
            monthsTerm: months_term,
            paymentSchedule: scheduleResponse.data.schedule,
          };

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
      [transactionId]: !prevState[transactionId],
    }));
  };

  const calculateTotalPayment = (schedule) => {
    return schedule.reduce((total, entry) => total + parseFloat(entry.payment), 0);
  };

  const handlePayInFull = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
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
                  <tr>
                    <td><strong>Total:</strong></td>
                    <td><strong>₱{calculateTotalPayment(schedule.paymentSchedule).toFixed(2)}</strong></td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handlePayInFull({
                            transactionId: schedule.transactionId,
                            totalAmount: calculateTotalPayment(schedule.paymentSchedule),
                          })
                        }
                      >
                        Pay in Full
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p>No payment schedules available.</p>
      )}

      {/* Use PayInFullModal component */}
      <PayInFullModal
        show={showModal}
        handleClose={handleCloseModal}
        transaction={selectedTransaction}
        accountBalance={accountBalance}
      />
    </div>
  );
};

export default Loans;
