import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/ping") 
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="w-screen flex justify-center items-center text-center p-10">
      <h1 className="text-2xl font-bold">Backend says:</h1>
      <p className="text-2xl mt-4">{message}</p>
    </div>
  );
}

export default App;
