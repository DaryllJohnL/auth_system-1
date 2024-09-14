/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Grid, Card, Collapse } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import axios from "axios";
import { Select, MenuItem, FormControl, InputLabel, Button, Typography, Box } from "@mui/material";
import { Table, TableBody, TableCell, TableRow, TableContainer } from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import MasterCard from "examples/Cards/MasterCard";
import { capitalizeFirstLetter } from "layouts/utils";
import PayInFullModal from "./compononents/PayInFullModal";
import PaymentConfirmationModal from "./compononents/PaymentConfirmationModal"; // Import the modal
import { generatePDF } from "./utils/pdf";
function Gcredit() {
  const [creditLimit, setCreditLimit] = useState(50000);
  const [amountUsed, setAmountUsed] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [toggleState, setToggleState] = useState({});
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [remainingCredit, setRemainingCredit] = useState(50000);
  const [paymentSchedules, setPaymentSchedules] = useState({});
  const [availableMonths, setAvailableMonths] = useState([]); // Define availableMonths
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showPayInFullModal, setShowPayInFullModal] = useState(false);
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false);
  const [pendingPaymentDetails, setPendingPaymentDetails] = useState({
    transactionId: null,
    month: "",
    paymentAmount: 0,
  });
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchCreditData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch profile creation date
        const profileResponse = await axios.get("http://localhost:8000/api/user-info/", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        const schedulesById = {};
        const initialToggleState = {};
        const transactions = transactionsResponse.data;

        for (let transaction of transactions) {
          const { id, amount_borrowed, months_term, transaction_date, paid_months, description } =
            transaction;

          const scheduleResponse = await axios.post(
            "http://localhost:8000/api/payment-schedule/",
            { amount_borrowed, months_term, transaction_date, description },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Calculate monthly payment and interest
          const monthlyInterest = parseFloat(amount_borrowed) * 0.03;
          const monthlyPayment = amount_borrowed / months_term;
          const monthlyPaymentWithInterest = monthlyPayment + monthlyInterest;

          // Calculate unpaid months
          const unpaidMonths = months_term - (paid_months ? paid_months.length : 0);
          const unpaidAmount = monthlyPaymentWithInterest * unpaidMonths;

          totalUsed += unpaidAmount;

          schedulesById[id] = {
            description: description,
            amountBorrowed: parseFloat(amount_borrowed),
            monthsTerm: months_term,
            paymentSchedule: scheduleResponse.data.schedule,
            paidMonths: paid_months || [],
            transaction_date: transaction_date,
          };

          initialToggleState[description] = false;
        }

        const profileCreationDate = new Date(profileResponse.data.date_created);
        setUserInfo({
          first_name: profileResponse.data?.first_name || "N/A",
          last_name: profileResponse.data?.last_name || "N/A",
          email: profileResponse.data?.email || "N/A",
          date_created: profileResponse.data?.date_created
            ? new Date(profileResponse.data.date_created)
            : new Date(),
          card_number: profileResponse.data?.card_number || "N/A",
          card_expiration_date: profileResponse.data?.card_expiration_date || "N/A",
        });
        setCreditLimit(50000);
        setAmountUsed(totalUsed);
        setRemainingCredit(creditLimit - totalUsed);
        setPaymentSchedules(schedulesById);
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const { first_name, last_name, email, card_number, card_expiration_date } = userInfo;
  const maskedCardNumber = `000000000000${card_number.slice(-4)}`;
  const cardExp = card_expiration_date;

  const handleToggle = (description) => {
    setToggleState((prevState) => ({
      ...prevState,
      [description]: !prevState[description],
    }));
  };

  const handlePay = async () => {
    const { transactionId, month, paymentAmount } = pendingPaymentDetails; // Destructure the details
    try {
      const token = localStorage.getItem("token");

      // Transaction
      const transactionResponse = await fetch("http://localhost:8000/api/transaction/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: userId, // Include the user ID
          transaction_type: "credit_payment",
          amount: paymentAmount,
          description: `Credit payment for ${month}`,
        }),
      });

      // Deduct the balance
      await axios.post(
        "http://localhost:8000/api/deduct-balance/",
        { amount: paymentAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Process the payment
      await axios.post(
        "http://localhost:8000/api/update-payment/",
        {
          transaction_id: transactionId,
          payment_amount: paymentAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update paid months
      await axios.post(
        "http://localhost:8000/api/update-paid-months/",
        {
          transaction_id: transactionId,
          paid_month: month,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state after successful payment
      setPaymentSchedules((prevSchedules) => {
        const updatedSchedules = { ...prevSchedules };
        const transaction = updatedSchedules[transactionId];

        // Mark the selected month as paid
        transaction.paidMonths.push(month);

        // Recalculate total used and remaining credit
        const updatedAmountUsed = amountUsed - parseFloat(paymentAmount);
        setAmountUsed(updatedAmountUsed);
        setRemainingCredit(creditLimit - updatedAmountUsed);

        return updatedSchedules;
      });

      // Optionally show a success message
      console.log(`Payment of ₱${paymentAmount} for month ${month} completed.`);
    } catch (error) {
      console.error("Error processing monthly payment:", error);
      setError("Failed to process monthly payment.");
    }

    // Close the confirmation modal
    setShowPaymentConfirmationModal(false);
  };
  const handlePayButtonClick = (transactionId, month, paymentAmount) => {
    // Set the pending payment details
    setPendingPaymentDetails({ transactionId, month, paymentAmount });
    // Show the confirmation modal
    setShowPaymentConfirmationModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentConfirmationModal(false);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
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
          (total, transaction) => total + parseFloat(transaction.amount_borrowed),
          0
        );
        setAmountUsed(updatedTotalUsed);
        setRemainingCredit(creditLimit - updatedTotalUsed);
        setShowModal(false);
        setSelectedTransaction(null);
        setPaymentSchedules((prevSchedules) => {
          const updatedSchedules = { ...prevSchedules };
          const transaction = updatedSchedules[transactionId];

          // Mark the selected month as paid
          transaction.paidMonths.push(month);

          // Recalculate total used and remaining credit
          const updatedAmountUsed = amountUsed + parseFloat(paymentAmount);
          setAmountUsed(updatedAmountUsed);
          setRemainingCredit(creditLimit - updatedAmountUsed);

          return updatedSchedules;
        });
      }
    } catch (err) {
      console.error("Error processing full payment:", err);
      setError("Failed to process full payment.");
    }
  };
  const handlePayInFull = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  const handleGenerateStatement = async () => {
    if (!selectedMonth) return;

    // Define the transaction type you want to filter by
    const transactionType = "credit_payment";

    try {
      const token = localStorage.getItem("token");
      console.log(selectedMonth);
      console.log(transactionType);

      // Construct the URL with query parameters
      const url = new URL("http://localhost:8000/api/filter-transactions/");
      url.searchParams.append("month", selectedMonth);
      url.searchParams.append("transaction_type", transactionType);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Statement generated:", data);

      // Generate and download the PDF with the response data
      console.log(userInfo);
      generatePDF(data, paymentSchedules, userInfo);
    } catch (error) {
      console.error("Error generating statement:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <MasterCard
              number={maskedCardNumber} // Use masked card number
              holder={`${capitalizeFirstLetter(first_name)} ${capitalizeFirstLetter(last_name)}`}
              expires={cardExp} // Example expiration date
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                bgcolor="background.paper"
                borderRadius="lg"
                p={3}
                shadow="md"
              >
                <MDTypography variant="h5" mb={2}>
                  Account Information
                </MDTypography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Email
                        </TableCell>
                        <TableCell>{email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Credit Limit
                        </TableCell>
                        <TableCell>₱{creditLimit.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Amount Used
                        </TableCell>
                        <TableCell>₱{amountUsed.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Remaining Credit
                        </TableCell>
                        <TableCell>₱{remainingCredit.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        {/* Payment Schedule Section */}
        <Box mb={3}>
          <Typography variant="h6">Generate Statement of Account</Typography>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
            >
              {availableMonths.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            onClick={handleGenerateStatement}
            variant="contained"
            color="info"
            disabled={!selectedMonth}
          >
            Generate Statement of Account
          </Button>
        </Box>
        {/* Payment Schedule Section */}
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <MDTypography variant="h6" color="white">
                    Payment Schedule
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  {Object.entries(paymentSchedules).map(
                    ([id, { description, paymentSchedule, paidMonths, amountBorrowed }]) => {
                      // Calculate unpaid total for this schedule
                      const unpaidTotalForSchedule = paymentSchedule
                        .filter((schedule) => !paidMonths.includes(schedule.month))
                        .reduce((acc, schedule) => acc + parseFloat(schedule.payment), 0);

                      return (
                        <Card key={id} sx={{ mb: 2 }}>
                          <MDBox
                            display="flex"
                            flexDirection="column"
                            p={2}
                            onClick={() => handleToggle(description)}
                            sx={{ cursor: "pointer", bgcolor: "background.paper" }}
                          >
                            {/* Show both description and amount borrowed */}
                            <MDTypography variant="h6">
                              {description} - ₱{amountBorrowed.toFixed(2)}
                            </MDTypography>
                          </MDBox>

                          <Collapse in={toggleState[description]}>
                            <MDBox pt={3}>
                              <DataTable
                                table={{
                                  columns: [
                                    { Header: "Month", accessor: "month" },
                                    { Header: "Payment", accessor: "payment" },
                                    { Header: "Due Date", accessor: "due_date" },
                                    {
                                      Header: "Status",
                                      accessor: "status",
                                      Cell: ({ row }) =>
                                        paidMonths.includes(row.original.month) ? "Paid" : "Unpaid",
                                    },
                                    {
                                      Header: "Action",
                                      accessor: "pay",
                                      Cell: ({ row }) =>
                                        !paidMonths.includes(row.original.month) ? (
                                          <MDButton
                                            onClick={() =>
                                              handlePayButtonClick(
                                                id,
                                                row.original.month,
                                                row.original.payment
                                              )
                                            }
                                            variant="contained"
                                            color="info"
                                          >
                                            Pay
                                          </MDButton>
                                        ) : null,
                                    },
                                  ],
                                  rows: paymentSchedule,
                                }}
                                isSorted={true}
                              />

                              {/* Add "Pay in Full" button for this specific schedule */}
                              <MDBox p={3} display="flex" justifyContent="flex-end">
                                <MDButton
                                  onClick={() =>
                                    handlePayInFull({
                                      transactionId: id,
                                      description: description,
                                      totalAmount: unpaidTotalForSchedule,
                                      amountBorrowed: amountBorrowed, // Pass amount borrowed to handlePayInFull
                                    })
                                  }
                                  variant="contained"
                                  color="info"
                                  disabled={unpaidTotalForSchedule === 0} // Disable if fully paid
                                >
                                  Pay in Full (₱{unpaidTotalForSchedule.toFixed(2)})
                                </MDButton>
                              </MDBox>
                            </MDBox>
                          </Collapse>
                        </Card>
                      );
                    }
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      {/* Modal confirmation for payment */}
      <PaymentConfirmationModal
        open={showPaymentConfirmationModal}
        handleClose={handleClosePaymentModal}
        handleConfirm={handlePay}
        paymentAmount={pendingPaymentDetails.paymentAmount}
        month={pendingPaymentDetails.month}
      />
      <PayInFullModal
        show={showModal}
        handleClose={handleCloseModal}
        transaction={selectedTransaction}
        accountBalance={accountBalance}
        handleFullPayment={handleFullPayment}
        dueDate="2024-10-01" // Safely accessing dueDate
      />
      <Footer />
    </DashboardLayout>
  );
}

export default Gcredit;
