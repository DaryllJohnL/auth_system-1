import { PDFDocument, rgb } from "pdf-lib";

export const generatePDF = async (responseData, paymentSchedules, userInfo) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]); // Adjust the page size as needed
  const { width, height } = page.getSize();

  let y = height - 50;

  // Title: Statement of Account
  page.drawText("Statement of Account", { x: 50, y, size: 20, color: rgb(0, 0, 1) });
  y -= 30;

  // Draw Account Details Section in Table
  page.drawText("Account Details", { x: 50, y, size: 15, color: rgb(0, 0, 1) });
  y -= 20;

  const accountHeaders = ["Name", "Email", "Card Number", "Expiration Date"];
  const accountValues = [
    `${userInfo.first_name} ${userInfo.last_name}`,
    userInfo.email,
    userInfo.card_number,
    userInfo.card_expiration_date,
  ];

  const accountX = [50, 150, 300, 400, 500]; // Adjust X positions for columns

  // Draw Account Details Headers
  accountHeaders.forEach((header, index) => {
    page.drawText(header, { x: accountX[index], y, size: 12, color: rgb(0, 0, 0) });
  });
  y -= 20;

  // Draw Account Details Values
  accountValues.forEach((value, index) => {
    page.drawText(value, { x: accountX[index], y, size: 10, color: rgb(0, 0, 0) });
  });
  y -= 40;

  // Transaction History Section Title
  page.drawText("Transaction History", { x: 50, y, size: 15, color: rgb(0, 0, 1) });
  y -= 20;

  // Table Headers for Transaction History
  const headers = ["Payment", "Date", "Amount", "Description"];
  const headerX = [50, 150, 250, 350]; // X positions for transaction table columns

  // Draw Transaction History Table Headers
  headers.forEach((header, index) => {
    page.drawText(header, { x: headerX[index], y, size: 12, color: rgb(0, 0, 0) });
  });
  y -= 20;

  // Draw Transaction History Rows
  responseData.forEach((transaction) => {
    const paymentType = transaction.transaction_type || "N/A";
    const date = new Date(transaction.date).toLocaleDateString();
    const amount = transaction.amount || "0.00";
    const description = transaction.description || "No description";

    page.drawText(paymentType, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(date, { x: 150, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(amount, { x: 250, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(description, { x: 350, y, size: 10, color: rgb(0, 0, 0) });
    y -= 20;

    if (y < 50) {
      page = pdfDoc.addPage([600, 800]);
      y = height - 50;
    }
  });

  // Add Payment Schedule Section
  y -= 40;
  page.drawText("Payment Schedule", { x: 50, y, size: 15, color: rgb(0, 0, 1) });
  y -= 20;

  // Table Headers for Payment Schedule
  const scheduleHeaders = ["Description", "Borrowed Amount", "Balance Remaining"];
  const scheduleHeaderX = [50, 200, 350]; // X positions for payment schedule columns

  // Draw the payment schedule table headers
  scheduleHeaders.forEach((header, index) => {
    page.drawText(header, { x: scheduleHeaderX[index], y, size: 12, color: rgb(0, 0, 0) });
  });
  y -= 20;

  // Draw Payment Schedule Rows
  Object.entries(paymentSchedules).forEach(
    ([id, { description, paymentSchedule, paidMonths, amountBorrowed }]) => {
      const unpaidTotalForSchedule = paymentSchedule
        .filter((schedule) => !paidMonths.includes(schedule.month))
        .reduce((acc, schedule) => acc + parseFloat(schedule.payment), 0);

      page.drawText(description, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
      page.drawText(amountBorrowed.toString(), { x: 200, y, size: 10, color: rgb(0, 0, 0) });
      page.drawText(unpaidTotalForSchedule.toFixed(2), {
        x: 350,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      if (y < 50) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }
    }
  );

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Download the PDF file
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "statement_of_account.pdf";
  link.click();
};
