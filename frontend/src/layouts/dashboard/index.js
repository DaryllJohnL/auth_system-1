import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { Grid, Card, Table, TableBody, TableCell, TableRow, TableContainer } from "@mui/material";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MasterCard from "examples/Cards/MasterCard";
import CashInModal from "./components/CashInModal";
import WithdrawModal from "./components/WithdrawModal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { capitalizeFirstLetter, mapTransactionType } from "layouts/utils";
// Utility function to capitalize the first letter

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    title: "",
    message: "",
  });
  const [transactions, setTransactions] = useState({ columns: [], rows: [] });

  useEffect(() => {
    // Fetch user info from server
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:8000/api/user-info/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Something went wrong, please try again.");
      }
    };

    // Fetch transaction history from server
    const fetchTransactionHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:8000/api/transaction-history/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();

          // Define columns for DataTable
          const columns = [
            { Header: "Date", accessor: "date" },
            { Header: "Type", accessor: "transaction_type" },
            { Header: "Amount", accessor: "amount", align: "right" },
            { Header: "Description", accessor: "description" },
          ];

          // Transform data into rows for DataTable
          const rows = data.map((transaction) => ({
            id: transaction.user, // Ensure this is unique for each row
            date: new Date(transaction.date).toLocaleDateString(),
            transaction_type: mapTransactionType(transaction.transaction_type),
            amount: parseFloat(transaction.amount).toFixed(2),
            description: transaction.description,
          }));

          setTransactions({ columns, rows });
        } else {
          const errorData = await response.json();
          setError(errorData.error);
        }
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setError("Something went wrong, please try again.");
      }
    };

    fetchUserInfo();
    fetchTransactionHistory();
  }, []);

  const handleCashInClick = () => {
    setShowCashInModal(true);
  };
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleCashInSubmit = async (amount, paymentMethod, paymentDetails) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Retrieve the user ID from local storage

    if (!userId) {
      setMessageModal({
        show: true,
        title: "Error",
        message: "User ID not found. Please log in again.",
      });
      return;
    }

    try {
      // Perform the cash-in operation
      const response = await fetch("http://localhost:8000/auth/cash-in/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod, paymentDetails }),
      });

      if (response.ok) {
        const data = await response.json();

        // Set success message for cash-in
        setMessageModal({
          show: true,
          title: "Cash In Success",
          message: `You have successfully cashed in ₱${amount}. Your new balance is ₱${data.new_balance}.`,
        });

        // Record the transaction in the transaction history
        const transactionResponse = await fetch("http://localhost:8000/api/transaction/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: userId, // Include the user ID
            transaction_type: "deposit",
            amount: amount,
            description: `Cash In via ${paymentMethod}`,
          }),
        });

        if (!transactionResponse.ok) {
          const transactionError = await transactionResponse.json();
          console.error("Error creating transaction:", transactionError);
          setMessageModal({
            show: true,
            title: "Transaction Error",
            message: `Error recording transaction: ${transactionError.error}`,
          });
        }

        // Fetch updated user info after cash-in
        const updatedResponse = await fetch("http://localhost:8000/api/user-info/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setUserInfo(updatedData);
        } else {
          const errorData = await updatedResponse.json();
          setError(errorData.error);
        }
      } else {
        // Handle error from cash-in
        const errorData = await response.json();
        setMessageModal({
          show: true,
          title: "Error",
          message: `Error: ${errorData.error}`,
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error during cash-in:", error);
      setMessageModal({
        show: true,
        title: "Error",
        message: "Something went wrong, please try again.",
      });
    } finally {
      // Close the modal
      setShowCashInModal(false);
    }
  };
  const handleWithdrawSubmit = async (amount, paymentMethod, paymentDetails) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Retrieve the user ID from local storage

    if (!userId) {
      setMessageModal({
        show: true,
        title: "Error",
        message: "User ID not found. Please log in again.",
      });
      return;
    }

    try {
      // Perform the cash-in operation
      const response = await fetch("http://localhost:8000/auth/cash-out/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod, paymentDetails }),
      });

      if (response.ok) {
        const data = await response.json();

        // Set success message for cash-in
        setMessageModal({
          show: true,
          title: "Cash In Success",
          message: `You have successfully withdraw ₱${amount}. Your new balance is ₱${data.new_balance}.`,
        });

        // Record the transaction in the transaction history
        const transactionResponse = await fetch("http://localhost:8000/api/transaction/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: userId, // Include the user ID
            transaction_type: "withdrawal",
            amount: amount,
            description: `Withdraw via ${paymentMethod}`,
          }),
        });

        if (!transactionResponse.ok) {
          const transactionError = await transactionResponse.json();
          console.error("Error creating transaction:", transactionError);
          setMessageModal({
            show: true,
            title: "Transaction Error",
            message: `Error recording transaction: ${transactionError.error}`,
          });
        }

        // Fetch updated user info after cash-in
        const updatedResponse = await fetch("http://localhost:8000/api/user-info/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setUserInfo(updatedData);
        } else {
          const errorData = await updatedResponse.json();
          setError(errorData.error);
        }
      } else {
        // Handle error from cash-in
        const errorData = await response.json();
        setMessageModal({
          show: true,
          title: "Error",
          message: `Error: ${errorData.error}`,
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error during cash-in:", error);
      setMessageModal({
        show: true,
        title: "Error",
        message: "Something went wrong, please try again.",
      });
    } finally {
      // Close the modal
      setShowWithdrawModal(false);
    }
  };
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const { first_name, last_name, email, balance, card_number, card_expiration_date } = userInfo;

  // Extract the last 4 digits and fill the rest with `0000`
  const maskedCardNumber = `000000000000${card_number.slice(-4)}`;
  const cardExp = card_expiration_date;

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
                          Account Balance
                        </TableCell>
                        <TableCell>₱{balance}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Buttons for Cash In and Withdraw */}
                <MDBox mt={2} width="100%" display="flex" justifyContent="space-between">
                  <MDButton variant="gradient" color="info" onClick={handleCashInClick}>
                    Cash In
                  </MDButton>
                  <MDButton variant="gradient" color="warning" onClick={handleWithdrawClick}>
                    Withdraw
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Transaction History Section */}
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
                    Transaction History
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                    table={transactions}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <CashInModal
          open={showCashInModal}
          handleClose={() => setShowCashInModal(false)}
          handleSubmit={handleCashInSubmit}
        />
        <WithdrawModal
          open={showWithdrawModal}
          handleClose={() => setShowWithdrawModal(false)}
          handleSubmit={handleWithdrawSubmit}
        />
      </MDBox>
      <Footer />

      {/* Modal for success and error messages */}
      <Dialog
        open={messageModal.show}
        onClose={() => setMessageModal({ ...messageModal, show: false })}
      >
        <DialogTitle>{messageModal.title}</DialogTitle>
        <DialogContent>{messageModal.message}</DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageModal({ ...messageModal, show: false })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Dashboard;
