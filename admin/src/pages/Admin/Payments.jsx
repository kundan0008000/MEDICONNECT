import React, { useState } from "react";

const mockPayments = [
  { id: 1, user: "John Doe", doctor: "Dr. A", amount: 500, status: "Success", date: "2026-05-06" },
  { id: 2, user: "Jane Smith", doctor: "Dr. B", amount: 700, status: "Pending", date: "2026-05-05" },
  { id: 3, user: "Alex Roy", doctor: "Dr. C", amount: 400, status: "Failed", date: "2026-05-04" },
];

export default function Payments() {
  const [tab, setTab] = useState("all");

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-500">Total Earnings</div>
          <div className="text-2xl font-bold">₹{mockPayments.filter(p => p.status === "Success").reduce((a, b) => a + b.amount, 0)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-500">Completed Payments</div>
          <div className="text-2xl font-bold">{mockPayments.filter(p => p.status === "Success").length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-500">Pending/Failed</div>
          <div className="text-2xl font-bold">{mockPayments.filter(p => p.status !== "Success").length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button className={`px-4 py-2 rounded-full ${tab === "all" ? "bg-blue-600 text-white" : "bg-gray-100"}`} onClick={() => setTab("all")}>All</button>
        <button className={`px-4 py-2 rounded-full ${tab === "success" ? "bg-blue-600 text-white" : "bg-gray-100"}`} onClick={() => setTab("success")}>Completed</button>
        <button className={`px-4 py-2 rounded-full ${tab === "pending" ? "bg-blue-600 text-white" : "bg-gray-100"}`} onClick={() => setTab("pending")}>Pending/Failed</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments
              .filter(p => tab === "all" ? true : tab === "success" ? p.status === "Success" : p.status !== "Success")
              .map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.user}</td>
                  <td className="p-3">{p.doctor}</td>
                  <td className="p-3">₹{p.amount}</td>
                  <td className={`p-3 ${p.status === "Success" ? "text-green-600" : p.status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>{p.status}</td>
                  <td className="p-3">{p.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
