"use client";
import { createContext, useContext, useState } from "react";

// ✅ Only selectedTickets & memo are used globally now
const TicketContext = createContext({
  selectedTickets: [],
  setSelectedTickets: () => {},
  memo: "",
  setMemo: () => {},
});

export const TicketProvider = ({ children }) => {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [memo, setMemo] = useState("");

  return (
    <TicketContext.Provider value={{ selectedTickets, setSelectedTickets, memo, setMemo }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
