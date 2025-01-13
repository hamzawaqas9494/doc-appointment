"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";

const AppointmentBooking = () => {
  const [bookedTokens, setBookedTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("morning");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for the submit button

  const tokens = Array.from({ length: 40 }, (_, i) => i + 1);

  const formattedDate = useMemo(() => {
    return selectedDate ? new Date(selectedDate).toISOString().split("T")[0] : "";
  }, [selectedDate]);
  

  useEffect(() => {
    const controller = new AbortController();
    if (selectedTime && selectedDate) {
      fetch(
        `/api/getdata-based-ontoken?time=${selectedTime}&date=${formattedDate}`,
        {
          method: "GET",
          signal: controller.signal,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.bookedTokens) {
            setBookedTokens(data.bookedTokens);
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Error fetching data:", error);
          }
        });

    }
    return () => controller.abort();
  }, [selectedTime, selectedDate, formattedDate]);

  const handleTokenSelect = useCallback((token) => {
    if (!bookedTokens.includes(token)) {
      setSelectedToken(token);
    }
  }, [bookedTokens]);

  const handleSubmit = async () => {
    if (!selectedToken) {
      alert("Please select a token before booking!");
      return;
    }
    setLoading(true); // Set loading to true while submitting
    const formData = new FormData();
    formData.append("appointment_date", formattedDate);
    formData.append("appointment_time", selectedTime);
    formData.append("token_number", selectedToken);
    formData.append("patient_name", patientName);
    formData.append("patient_age", patientAge);
    formData.append("patient_gender", patientGender);

    try {
      const response = await fetch("/api/send-data-maintable", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setBookedTokens((prevTokens) => [...prevTokens, selectedToken]);
        clearFormFields();
      } else {
        console.error("Server Error:", data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false); // Set loading to false after submission
    }
  };

  const clearFormFields = () => {
    setSelectedToken(null);
    setPatientName("");
    setPatientAge("");
    setPatientGender("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book Your Appointment</h1>

      {/* Appointment Date */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Appointment Date</label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          aria-label="Appointment Date"
        />
      </div>

      {/* Appointment Time */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Appointment Time</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          aria-label="Appointment Time"
        >
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      {/* Token Selection */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Select Token</label>
        <div className="grid grid-cols-10 gap-2">
          {tokens.map((token) => {
            let tokenClass = "p-2 border rounded";
            if (bookedTokens.includes(token)) {
              tokenClass += " bg-gray-300 cursor-not-allowed";
            } else if (selectedToken === token) {
              tokenClass += " bg-blue-500 text-white";
            } else {
              tokenClass += " bg-white";
            }

            return (
              <button
                key={token}
                onClick={() => handleTokenSelect(token)}
                disabled={bookedTokens.includes(token)}
                className={tokenClass}
                aria-label={`Token ${token}`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Details */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Patient Name</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          aria-label="Patient Name"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Patient Age</label>
        <input
          type="number"
          className="border rounded p-2 w-full"
          value={patientAge}
          onChange={(e) => setPatientAge(e.target.value)}
          aria-label="Patient Age"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Patient Gender</label>
        <select
          className="border rounded p-2 w-full"
          value={patientGender}
          onChange={(e) => setPatientGender(e.target.value)}
          aria-label="Patient Gender"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        aria-label="Book Appointment"
      >
        {loading ? "Booking..." : "Book Appointment"}
      </button>
    </div>
  );
};

export default AppointmentBooking;
