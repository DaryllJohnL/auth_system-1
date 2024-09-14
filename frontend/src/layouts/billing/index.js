/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Collapse, Button, Grid, Typography } from "@mui/material";
import {
  FaBolt,
  FaWater,
  FaTv,
  FaPhone,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import PaymentModal from "./components/PaymentModal"; // Import the modal component
import meralcoBg from "./assets/images/MERALCO.jpg";
import alecoBg from "./assets/images/ALECO.jpg";
import anecoBg from "./assets/images/ANECO.png";
import mayniladBg from "./assets/images/MAYNILAD.jpg";
import angelesBg from "./assets/images/ANGELES.png";
import aquaBg from "./assets/images/AQUA.jpg";
import globeBg from "./assets/images/GLOBE.png";
import pldtBg from "./assets/images/PLDT.jpg";
import convergeBg from "./assets/images/CONVERGE.jpg";
import visaBg from "./assets/images/VISA.png";
import mastercardBg from "./assets/images/MASTERCARD.jpg";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import { mapTransactionType } from "layouts/utils";

const BillCategoriesCard = ({ balance }) => {
  const [electricOpen, setElectricOpen] = useState(false);
  const [error, setError] = useState(null);
  const [waterOpen, setWaterOpen] = useState(false);
  const [cableOpen, setCableOpen] = useState(false);
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [creditCardOpen, setCreditCardOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(balance);
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [selectedCategory, setSelectedCategory] = useState(null); // Store selected category

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
  const handleSubcategoryClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const renderSubcategories = (items) => (
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={12} md={4} key={index} className="text-center my-2">
          <div
            className="subcategory-item"
            style={{
              backgroundImage: `url(${item.background})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              padding: "10px",
              borderRadius: "8px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "120px",
              border: "1px solid #ddd",
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => handleSubcategoryClick(item)} // Handle click
          >
            <Typography variant="body2" style={{ color: "transparent" }}>
              {item.name}
            </Typography>
          </div>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Card className="mb-4 h-100">
        <CardHeader title="Pay Bills" />
        <CardContent>
          {/* Electric Utilities */}
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1">
                  <FaBolt /> Electric Utilities
                </Typography>
              }
              action={
                <Button onClick={() => setElectricOpen(!electricOpen)} size="small">
                  {electricOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              }
            />
            <Collapse in={electricOpen}>
              {renderSubcategories([
                { name: "Meralco", background: meralcoBg },
                { name: "ANECO", background: anecoBg },
                { name: "ALECO", background: alecoBg },
              ])}
            </Collapse>
          </Card>

          {/* Water Utilities */}
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1">
                  <FaWater /> Water Utilities
                </Typography>
              }
              action={
                <Button onClick={() => setWaterOpen(!waterOpen)} size="small">
                  {waterOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              }
            />
            <Collapse in={waterOpen}>
              {renderSubcategories([
                { name: "Maynilad", background: mayniladBg },
                { name: "Angeles Water", background: angelesBg },
                { name: "Aqua Centro", background: aquaBg },
              ])}
            </Collapse>
          </Card>

          {/* Cable/Internet */}
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1">
                  <FaTv /> Cable/Internet
                </Typography>
              }
              action={
                <Button onClick={() => setCableOpen(!cableOpen)} size="small">
                  {cableOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              }
            />
            <Collapse in={cableOpen}>
              {renderSubcategories([
                { name: "Globe", background: globeBg },
                { name: "PLDT", background: pldtBg },
                { name: "Converge", background: convergeBg },
              ])}
            </Collapse>
          </Card>

          {/* Telecoms */}
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1">
                  <FaPhone /> Telecoms
                </Typography>
              }
              action={
                <Button onClick={() => setTelecomOpen(!telecomOpen)} size="small">
                  {telecomOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              }
            />
            <Collapse in={telecomOpen}>
              {renderSubcategories([
                { name: "Globe at Home", background: globeBg },
                { name: "PLDT", background: pldtBg },
              ])}
            </Collapse>
          </Card>

          {/* Credit Cards */}
          <Card>
            <CardHeader
              title={
                <Typography variant="subtitle1">
                  <FaCreditCard /> Credit Cards
                </Typography>
              }
              action={
                <Button onClick={() => setCreditCardOpen(!creditCardOpen)} size="small">
                  {creditCardOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              }
            />
            <Collapse in={creditCardOpen}>
              {renderSubcategories([
                { name: "Visa", background: visaBg },
                { name: "Mastercard", background: mastercardBg },
              ])}
            </Collapse>
          </Card>
        </CardContent>
      </Card>

      {/* Render the modal */}
      <PaymentModal
        show={showModal}
        handleClose={handleCloseModal}
        selectedCategory={selectedCategory}
        userBalance={userInfo.balance}
      />
    </>
  );
};

function Billing() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BillCategoriesCard balance={1000} /> {/* Pass the balance as needed */}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
