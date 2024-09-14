import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (amount, months) => {
  const amountValue = parseFloat(amount);
  if (!amountValue || isNaN(amountValue)) {
    alert("Please enter a valid amount");
    return;
  }

  const monthlyInterestRate = 0.03; // 3% monthly interest
  const totalInterest = amountValue * monthlyInterestRate * months;
  const totalAmount = amountValue + totalInterest;
  const monthlyPayment = totalAmount / months;

  // Penalty example (3% penalty through Landbank)
  const penaltyRate = 0.03; // 3% penalty rate
  const penaltyAmount = totalAmount * penaltyRate;

  const doc = new jsPDF();

  doc.setFontSize(12);
  doc.text("Invoice", 14, 22);

  // Invoice Details Table
  doc.autoTable({
    head: [["Description", "Amount"]],
    body: [
      ["Original Amount", `${amountValue.toFixed(2)}`],
      ["Total Interest (3% per month)", `${totalInterest.toFixed(2)}`],
      ["Total Amount", `${totalAmount.toFixed(2)}`],
      ["Monthly Payment", `${monthlyPayment.toFixed(2)}`],
      ["Late Penalty Charge (3%)", `${penaltyAmount.toFixed(2)}`],
    ],
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 102, 204], // Header background color
      textColor: [255, 255, 255], // Header text color
      fontStyle: "bold", // Header font style
    },
    columnStyles: {
      0: { cellWidth: "auto", minCellWidth: 50 }, // Adjust width to fit content
      1: { cellWidth: "auto", minCellWidth: 40 },
    },
    margin: { top: 30, left: 14, right: 14 },
    pageBreak: "avoid",
  });

  // Payment Schedule Table
  const startDate = new Date();
  const paymentSchedule = [];
  for (let i = 1; i <= months; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i);
    paymentSchedule.push([
      `Payment ${i}`,
      `${paymentDate.toLocaleDateString()}`,
      `${monthlyPayment.toFixed(2)}`,
    ]);
  }

  doc.autoTable({
    head: [["Month", "Due Date", "Amount"]],
    body: paymentSchedule,
    startY: doc.autoTable.previous.finalY + 10,
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 102, 204], // Header background color
      textColor: [255, 255, 255], // Header text color
      fontStyle: "bold", // Header font style
    },
    columnStyles: {
      0: { cellWidth: "auto", minCellWidth: 40 }, // Adjust column width to fit page
      1: { cellWidth: "auto", minCellWidth: 60 },
      2: { cellWidth: "auto", minCellWidth: 40 },
    },
    margin: { top: 30, left: 14, right: 14 },
    pageBreak: "avoid",
  });

  doc.save("Invoice.pdf");
};
