import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

export default function MainLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        marginTop: "60px",
        marginLeft: isOpen ? "230px" : "0",
        padding: "25px",
        width: "100%",
        transition: "0.3s"
      }}>
        {children}
      </div>
    </div>
  );
}