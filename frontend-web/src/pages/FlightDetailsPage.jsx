import React from "react";
import { useParams, useLocation } from "react-router-dom";
import FlightDetails from "../components/FlightDetails";
import { MOCK_FLIGHTS } from "../data/mockFlights";

export default function FlightDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const flightFromState = location.state?.flight;
  const flight = flightFromState || MOCK_FLIGHTS.find(f => f.id === id) || null;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Chi tiết chuyến</h2>
      <FlightDetails flight={flight} />
    </section>
  );
}
