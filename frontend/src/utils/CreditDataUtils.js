import axios from "axios";

// Fetches credit and user data, and updates state accordingly
export const fetchCreditData = async (
  setAccountBalance,
  setUserInfo,
  setCreditLimit,
  setAmountUsed,
  setRemainingCredit,
  setPaymentSchedules,
  setToggleState,
  setAvailableMonths,
  getMonthOptions,
  creditLimit,
  setError
) => {
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

// Calculates due date based on profile creation date
export const calculateDueDate = (createdDateStr) => {
  const createdDate = new Date(createdDateStr);
  if (isNaN(createdDate.getTime())) {
    return "Invalid Date";
  }

  const dueDay = createdDate.getDate();
  const dueDate = new Date(createdDate);
  dueDate.setMonth(dueDate.getMonth() + 1);

  dueDate.setDate(
    Math.min(
      dueDay,
      new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
    )
  );

  return dueDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

// Returns available months starting from the profile creation date
export const getMonthOptions = (profileCreationDate) => {
  const monthsSet = new Set();
  const today = new Date();
  const profileStartMonth = new Date(profileCreationDate);

  profileStartMonth.setDate(1); // Ensure the first day of the month

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
