import React, { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../utils/index";
import BillCategoriesCard from "../components/BillCategoriesCard";
import CashInModal from "../components/CashInModal";
import MessageModal from "../components/MessageModal";

const Accounts = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    title: "",
    message: ""
  });

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

    fetchUserInfo();
  }, []);

  const handleCashInClick = () => {
    setShowCashInModal(true);
  };

  const handleCashInSubmit = async (amount, paymentMethod, paymentDetails) => {
    const token = localStorage.getItem("token");
    try {
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
        setMessageModal({
          show: true,
          title: "Cash In Success",
          message: `You have successfully cashed in ₱${amount}. Your new balance is ₱${data.new_balance}.`,
        });

        // Fetch updated user info
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
        const errorData = await response.json();
        setMessageModal({
          show: true,
          title: "Error",
          message: `Error: ${errorData.error}`,
        });
      }
    } catch (error) {
      console.error("Error during cash-in:", error);
      setMessageModal({
        show: true,
        title: "Error",
        message: "Something went wrong, please try again.",
      });
    } finally {
      setShowCashInModal(false);
    }
  };

  if (error) return <div>{error}</div>;
  if (!userInfo) return <div>Loading...</div>;

  const { first_name, last_name, email, balance } = userInfo;

  return (
    <div className="container">
      <div className="jumbotron mt-5">
        <h1 className="display-4">
          Good day, {capitalizeFirstLetter(first_name)} {capitalizeFirstLetter(last_name)}!
        </h1>
        <hr className="my-4" />

        <div className="card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title">Account: {email}</h5>
              <p className="card-text">Balance: ₱{balance}</p>
            </div>
            <button className="btn btn-success" onClick={handleCashInClick}>
              Cash In
            </button>
          </div>
        </div>

        <div className="container mt-4">
          <BillCategoriesCard amount={balance} />
        </div>

        <hr className="my-4" />
      </div>

      <CashInModal
        show={showCashInModal}
        handleClose={() => setShowCashInModal(false)}
        handleSubmit={handleCashInSubmit}
      />

      <MessageModal
        show={messageModal.show}
        title={messageModal.title}
        message={messageModal.message}
        handleClose={() => setMessageModal({ ...messageModal, show: false })}
      />
    </div>
  );
};

export default Accounts;
