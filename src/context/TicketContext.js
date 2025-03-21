"use client";
import { createContext, useContext, useState } from "react";

const TicketContext = createContext({
  username: "",
  setUsername: () => {},
  selectedTickets: [],
  setSelectedTickets: () => {},
  memo: "",
  setMemo: () => {},
});

export const TicketProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [memo, setMemo] = useState("");

  return (
    <TicketContext.Provider
      value={{ username, setUsername, selectedTickets, setSelectedTickets, memo, setMemo }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
