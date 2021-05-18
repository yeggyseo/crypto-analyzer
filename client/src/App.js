import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  useEffect(() => {
    const testAPI = async () => {
      let response = await fetch("/test");
      let data = await response.text();
      console.log(data);
    };

    testAPI();
  });

  return (
    <div className="App">
      <p>Titillium Web</p>
    </div>
  );
}

export default App;
