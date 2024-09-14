import React, { useState, useEffect } from "react";
import axios from "axios";
import PayInFullModal from "../components/PayInFullModal";
import jsPDF from "jspdf";
const Loans = () => {
  const [creditLimit, setCreditLimit] = useState(50000);
  const [amountUsed, setAmountUsed] = useState(0);
  const [paymentSchedules, setPaymentSchedules] = useState({});
  const [error, setError] = useState(null);
  const [toggleState, setToggleState] = useState({});
  const [accountBalance, setAccountBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [remainingCredit, setRemainingCredit] = useState(50000);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    date_created: "",
  });
  const [availableMonths, setAvailableMonths] = useState([]); // Define availableMonths
  const [selectedMonth, setSelectedMonth] = useState(""); // Define selectedMonth

  useEffect(() => {
    const fetchCreditData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch profile creation date
        const profileResponse = await axios.get(
          "http://localhost:8000/api/user-info/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileResponse.data?.balance !== undefined) {
          setAccountBalance(parseFloat(profileResponse.data.balance));
        }

        const transactionsResponse = await axios.get(
          "http://localhost:8000/api/credit-transactions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let totalUsed = 0;
        const schedulesByTransaction = {};
        const initialToggleState = {};
        const transactions = transactionsResponse.data;

        for (let transaction of transactions) {
          const {
            id,
            amount_borrowed,
            months_term,
            transaction_date,
            paid_months,
            description,
          } = transaction;
          totalUsed += parseFloat(amount_borrowed);

          const scheduleResponse = await axios.post(
            "http://localhost:8000/api/payment-schedule/",
            { amount_borrowed, months_term, transaction_date, description },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          schedulesByTransaction[id] = {
            transactionId: id,
            amountBorrowed: parseFloat(amount_borrowed),
            monthsTerm: months_term,
            paymentSchedule: scheduleResponse.data.schedule,
            paidMonths: paid_months || [],
            description: description,
          };

          initialToggleState[id] = false;
        }
        const profileCreationDate = new Date(profileResponse.data.date_created);
        setUserInfo({
          name:
            (profileResponse.data?.first_name || "N/A") +
            " " +
            (profileResponse.data?.last_name || "N/A"),
          email: profileResponse.data?.email || "N/A",
          date_created: profileResponse.data?.date_created
            ? new Date(profileResponse.data.date_created)
            : new Date(),
        });
        setCreditLimit(50000);
        setAmountUsed(totalUsed);
        setRemainingCredit(creditLimit - totalUsed);
        setPaymentSchedules(schedulesByTransaction);
        setToggleState(initialToggleState);

        // Set available months starting from the profile creation date
        setAvailableMonths(getMonthOptions(profileCreationDate));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      }
    };

    const getMonthOptions = (profileCreationDate) => {
      const monthsSet = new Set();
      const today = new Date();
      const profileStartMonth = new Date(profileCreationDate);

      // Ensure profileStartMonth is the first day of the month
      profileStartMonth.setDate(1);

      // Add months starting from profile creation date
      let currentMonth = profileStartMonth;
      while (currentMonth <= today) {
        monthsSet.add(
          currentMonth.toLocaleString("default", {
            year: "numeric",
            month: "long",
          })
        );
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      // Convert Set to Array and sort
      return Array.from(monthsSet).sort((a, b) => new Date(b) - new Date(a));
    };

    fetchCreditData();
  }, [creditLimit]);

  const handleToggle = (transactionId) => {
    setToggleState((prevState) => ({
      ...prevState,
      [transactionId]: !prevState[transactionId],
    }));
  };

  const calculateTotalPayment = (schedule) => {
    // Calculate total amount for unpaid payments
    return schedule
      .filter(entry => !entry.isPaid) // Filter out paid entries
      .reduce(
        (total, entry) => total + parseFloat(entry.payment),
        0
      );
};

  const handlePayInFull = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  const generatePDF = (userInfo, paymentSchedules) => {
    const doc = new jsPDF();
    // Check if date_created is present and valid
    const createdDate = new Date(userInfo.date_created);
    if (isNaN(createdDate.getTime())) {
      doc.text("Invalid creation date", 14, 15);
      doc.save("statement_of_account.pdf");
      return;
    }

    // Get the day from the date_created
    const dueDay = createdDate.getDate(); // Day of the month from date_created

    // Calculate the due date (e.g., the same day of the next month)
    const dueDate = new Date(createdDate);
    dueDate.setMonth(dueDate.getMonth() + 1); // Move to the next month
    dueDate.setDate(
      Math.min(
        dueDay,
        new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
      )
    ); // Handle month-end

    const formattedDueDate = dueDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const creditLimit = 50000; // Replace with actual dynamic data
    const monthlyInterestRate = 3; // Replace with actual dynamic data (as percentage)

    // Calculate total paid amount and remaining balance
    let totalPaidAmount = 0;
    let totalPaymentAmount = 0;
    const paymentScheduleData = [];

    Object.values(paymentSchedules).forEach((transaction) => {
      transaction.paymentSchedule.forEach((payment) => {
        const isPaid = transaction.paidMonths.includes(payment.month);
        paymentScheduleData.push([
          transaction.description, // Description of the payment
          `${payment.payment.toFixed(2)}`, // Payment amount
          payment.due_date, // Due date
          isPaid ? "Paid" : "Pending", // Status
        ]);
        totalPaymentAmount += payment.payment;
        if (isPaid) {
          totalPaidAmount += payment.payment;
        }
      });
    });

    // Calculate remaining balance
    const remainingBalance = totalPaymentAmount - totalPaidAmount;

    // Add title
    doc.setFontSize(18);
    doc.text("Statement of Account", 14, 15);

    // Define the table headers and data for the general statement
    const tableData = [
      ["Name", userInfo.name],
      ["Account", userInfo.email],
      ["Due Date", formattedDueDate],
      ["Credit Limit", `${creditLimit.toFixed(2)}`],
      ["Monthly Interest Rate", `${monthlyInterestRate.toFixed(2)}%`],
    ];

    // Create table using autoTable for general statement
    doc.autoTable({
      head: [["Details", "Value"]],
      body: tableData,
      startY: 30, // Adjust Y position for better spacing
      theme: "grid",
      headStyles: { fillColor: [233, 236, 239] },
      margin: { top: 25 }, // Ensure space at the top
    });

    // Add payment schedule section
    const paymentScheduleTitleY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text("Payment Schedule", 14, paymentScheduleTitleY);

    // Add total payment amount and remaining balance rows
    paymentScheduleData.push([
      "Total Payment Amount",
      `${totalPaymentAmount.toFixed(2)}`,
      "",
    ]);
    paymentScheduleData.push([
      "Total Remaining Balance",
      `${remainingBalance.toFixed(2)}`,
      "",
    ]);

    doc.autoTable({
      head: [["Description", "Payment Amount", "Due Date", "Status"]],
      body: paymentScheduleData,
      startY: paymentScheduleTitleY + 10,
      theme: "grid",
      headStyles: { fillColor: [233, 236, 239] },
      margin: { top: 20 }, // Ensure space above the table
    });

    // Save the PDF
    doc.save("statement_of_account.pdf");
  };

  const handleShowConfirmModal = (transactionId, month, paymentAmount) => {
    setSelectedPayment({ transactionId, month, paymentAmount });
    setShowConfirmModal(true);
  };
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedPayment(null);
  };

  const handlePayment = async () => {
    if (!selectedPayment) return;

    try {
      const { transactionId, paymentAmount } = selectedPayment;
      const token = localStorage.getItem("token");

      // Deduct the balance first
      await axios.post(
        "http://localhost:8000/api/deduct-balance/",
        {
          amount: paymentAmount, // Deduct the balance from the account
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process the payment
      await axios.post(
        "http://localhost:8000/api/update-payment/",
        {
          transaction_id: transactionId,
          payment_amount: paymentAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update paid months after processing the payment
      await axios.post(
        "http://localhost:8000/api/update-paid-months/",
        {
          transaction_id: transactionId,
          paid_month: selectedPayment.month, // Assuming this is the month to update
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Insert the new transaction into TransactionHistory
      await axios.post(
        "http://localhost:8000/api/transaction/", // Your transaction history API endpoint
        {
          transaction_type: "payment", // Assuming this is a payment
          amount: paymentAmount,
          description: `Payment for transaction ID ${transactionId}`, // Optional, but useful for tracking
          user: 1, // The logged-in user ID; adjust based on your auth system
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the paymentSchedules state to reflect the payment
      setPaymentSchedules((prevSchedules) => {
        const updatedSchedules = { ...prevSchedules };
        const schedule = updatedSchedules[transactionId];
        if (schedule) {
          // Update paidMonths
          if (!schedule.paidMonths.includes(selectedPayment.month)) {
            schedule.paidMonths.push(selectedPayment.month);
            updatedSchedules[transactionId] = schedule;
          }
        }
        return updatedSchedules;
      });

      // Recalculate total used and remaining credit
      const updatedTransactionsResponse = await axios.get(
        "http://localhost:8000/api/credit-transactions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTotalUsed = updatedTransactionsResponse.data.reduce(
        (total, transaction) => total + parseFloat(transaction.amount_borrowed),
        0
      );
      setAmountUsed(updatedTotalUsed);
      setRemainingCredit(creditLimit - updatedTotalUsed); // Update remaining credit
      handleCloseConfirmModal(); // Close modal after payment
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Failed to process payment.");
    }
  };

  const handleFullPayment = async () => {
    try {
      if (selectedTransaction) {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:8000/api/update-full-payment/",
          {
            transaction_id: selectedTransaction.transactionId,
            total_amount: selectedTransaction.totalAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedTransactionsResponse = await axios.get(
          "http://localhost:8000/api/credit-transactions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedTotalUsed = updatedTransactionsResponse.data.reduce(
          (total, transaction) =>
            total + parseFloat(transaction.amount_borrowed),
          0
        );
        setAmountUsed(updatedTotalUsed);
        setRemainingCredit(creditLimit - updatedTotalUsed);
        setShowModal(false);
        setSelectedTransaction(null);
      }
    } catch (err) {
      console.error("Error processing full payment:", err);
      setError("Failed to process full payment.");
    }
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
              <h1 className="display-6">₱{remainingCredit.toFixed(2)}</h1>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="row mb-4">
          <div className="col-md-12">
            <h3 className="mt-4">Payment Schedule by Transaction</h3>
          </div>
          <div className="col-md-12 text-md-right">
            <div className="d-flex justify-content-between align-items-center mt-4">
              <select
                className="form-select me-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {availableMonths.length > 0 ? (
                  availableMonths.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))
                ) : (
                  <option value="">No months available</option>
                )}
              </select>
              <button
                className="btn btn-info"
                onClick={() => generatePDF(userInfo, paymentSchedules)}
                disabled={!selectedMonth}
              >
                Generate Statement of Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(paymentSchedules).length > 0 ? (
        Object.values(paymentSchedules).map((schedule) => (
          <div key={schedule.transactionId} className="mb-4">
            <h4>{schedule.description}</h4>
            <p>Amount Borrowed: ₱{schedule.amountBorrowed.toFixed(2)}</p>
            <p>Months Term: {schedule.monthsTerm}</p>
            <p>Paid Months: {schedule.paidMonths.join(", ")}</p>

            <button
              className="btn btn-info mb-2"
              onClick={() => handleToggle(schedule.transactionId)}
              aria-expanded={toggleState[schedule.transactionId]}
              aria-controls={`schedule-${schedule.transactionId}`}
            >
              {toggleState[schedule.transactionId]
                ? "Hide Schedule"
                : "Show Schedule"}
            </button>

            <div
              className={`collapse ${
                toggleState[schedule.transactionId] ? "show" : ""
              }`}
              id={`schedule-${schedule.transactionId}`}
            >
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
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleShowConfirmModal(
                              schedule.transactionId,
                              entry.month,
                              entry.payment
                            )
                          }
                          disabled={schedule.paidMonths.includes(entry.month)}
                        >
                          {schedule.paidMonths.includes(entry.month)
                            ? "Paid"
                            : "Pay"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>
                        ₱
                        {calculateTotalPayment(
                          schedule.paymentSchedule.map((entry) => ({
                            ...entry,
                            isPaid: schedule.paidMonths.includes(entry.month),
                          }))
                        ).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                    <button
                  className="btn btn-success"
                  onClick={() =>
                    handlePayInFull({
                      transactionId: schedule.transactionId,
                      originalAmount: schedule.amountBorrowed,
                      totalAmount: calculateTotalPayment(
                        schedule.paymentSchedule.map((entry) => ({
                          ...entry,
                          isPaid: schedule.paidMonths.includes(entry.month),
                        }))
                      ),
                    })
                  }
                  disabled={schedule.paidMonths.length > 0}
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
      <PayInFullModal
        show={showModal}
        handleClose={handleCloseModal}
        transaction={selectedTransaction}
        accountBalance={accountBalance}
        handleFullPayment={handleFullPayment}
        dueDate="2024-10-01" // Safely accessing dueDate
      />

      {/* Confirmation Modal */}
      <div
        className={`modal fade ${showConfirmModal ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: showConfirmModal ? "block" : "none" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Payment</h5>
              <button
                type="button"
                className="close"
                onClick={handleCloseConfirmModal}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to pay ₱
                {selectedPayment?.paymentAmount.toFixed(2)} for month{" "}
                {selectedPayment?.month}?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseConfirmModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePayment}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Loans;
