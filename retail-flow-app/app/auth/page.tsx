"use client"
import { Button, Input, Image, Card } from "@nextui-org/react";
import React, { useState } from "react";
import axios from "axios";

// For static images in the 'public' directory, use the string path directly
export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });

      if (response.status === 200) {
        // Handle successful login
        console.log("Login successful:", response.data);
        // You can save the token to local storage or context
        localStorage.setItem('token', response.data.token);
        // Redirect or update state based on login success
        window.location.href = '/home'; 
      } else {
        // Handle errors
        setError(response.data.message || "Login failed");
      }
    } catch (error: any) { // eslint-disable-line
      console.error("An error occurred:", error);
      setError(error.response?.data?.message || "An error occurred during login");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", width: "100%" }}>
 
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Use the path to the image in the 'public' directory */}
        <Image src="/logo.jpg" alt="logo" width={200} height={200} />
        <h3>Login</h3>
        {error && <h4 style={{ color: "red" }}>{error}</h4>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Input
            isClearable
            underlined
            label="User Name"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Input
            isClearable
            underlined
            type="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" color="secondary" radius="md">
            Login
          </Button>
        </form>
      </div>
  </div>
  );
}