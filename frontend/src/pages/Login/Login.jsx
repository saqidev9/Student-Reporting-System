import React, { useState } from "react";
import logo from "../../assets/logo.svg";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const Navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Login Faild");
      }
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", data.data.user.role);

        const role = data.data.user.role;
        Navigate(role === "admin" ? "/admin" : "/student");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
      setError("Something Went Wrong");
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-300  ">
      <div
        id="login-container"
        className="w-[400px] bg-white border border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 shadow-lg"
      >
        {/* Logo */}
        <img src={logo} alt="Tensai Devs Logo" />

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Tensai Devs</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {error && <p className="text-red-500 mt-1">{error}</p>}
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm">
              Email <span className="text-orange-500">*</span>
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@gmail.com"
              required
              className="border border-gray-300 rounded-md p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm">
              Password <span className="text-orange-500">*</span>
            </label>

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="**********"
              className="border border-gray-300 rounded-md p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-[#6349c2] text-white p-3 rounded-md hover:bg-[#275DBE] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
