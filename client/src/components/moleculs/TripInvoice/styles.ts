export const styles = {
  container: {
    backgroundColor: "white",
    padding: "16px 32px",
  },
  invoice: {
    maxWidth: "56rem",
    margin: "0 auto",
    border: "1px solid #e5e7eb",
  },
  grid3Cols: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0",
  },
  grid2Cols: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  borderRight: {
    borderRight: "1px solid #e5e7eb",
  },
  borderBottom: {
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    padding: "16px",
    border: "1px solid #d1d5db",
    margin: "16px",
    height: "64px",
    width: "96px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  companyName: {
    padding: "0 16px 16px 16px",
    color: "#0891b2",
    fontWeight: "bold",
  },
  invoiceTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  labelCell: {
    padding: "8px",
    textAlign: "right",
    fontWeight: "500",
  },
  valueCell: {
    padding: "8px",
    textAlign: "right",
  },
  tableHeader: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "left",
    fontStyle: "italic",
  },
  tableHeaderCenter: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "center",
    fontStyle: "italic",
  },
  tableCell: {
    border: "1px solid #e5e7eb",
    padding: "8px",
  },
  tableCellRight: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "right",
  },
  totalLabel: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "right",
    fontWeight: "bold",
  },
  totalValue: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "right",
    fontWeight: "bold",
  },
  finalTotal: {
    border: "1px solid #e5e7eb",
    padding: "8px",
    textAlign: "right",
    fontWeight: "bold",
    fontSize: "18px",
  },
  tvaInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "16px 0",
  },
  buttonContainer: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
    justifyContent: "flex-end",
  },
} as const;
