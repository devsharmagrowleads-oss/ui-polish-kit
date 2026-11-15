// The same screen as index.html, the way an agent typically writes it in
// React + Tailwind. Not wired to a build; it exists to show the patterns and to
// exercise the checker's JSX and Tailwind detectors.
import { useState } from "react";
import { Bell } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import { PlusIcon } from "@heroicons/react/24/outline";

export function InvoiceForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [due, setDue] = useState("");
  const [open, setOpen] = useState(false);

  async function remove() {
    if (confirm("Are you sure?")) {
      await fetch("/api/invoice", { method: "DELETE" });
      alert("Deleted!");
    }
  }

  return (
    <div className="w-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[13px] dark:bg-gray-900">
      <h1 className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-[42px] font-extrabold text-transparent">
        ✨ Create Invoice
      </h1>
      <h1 className="text-[15px] text-gray-400">Lorem ipsum dolor sit amet</h1>

      <div
        className="w-[800px] rounded-3xl border border-white/20 bg-white/10 p-[22px] shadow-[0_0_40px_rgba(139,92,246,0.5)] backdrop-blur-xl transition-all duration-700"
        onClick={() => setOpen(!open)}
      >
        <img src="/logo.png" />

        <input type="text" placeholder="Invoice number" className="mb-[9px] rounded-[5px] border border-gray-300 p-2 outline-none" />
        <input type="email" placeholder="Client email" className="mb-[9px] rounded-[5px] border border-gray-300 p-2 outline-none" />

        <select className="mb-[9px]" onChange={(e) => console.log(e.target.value)}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <input type="file" />

        <div className="mt-[18px] flex gap-[10px]">
          <button title="Delete invoice" onClick={remove} className="rounded-full bg-red-500 p-2 text-white shadow-lg shadow-red-500/50">
            <FaTrash />
          </button>
          <button className="z-[9999] animate-bounce rounded-full bg-blue-600 px-[18px] py-[9px] text-white hover:bg-blue-700" style={{ color: "#ffffff" }}>
            <PlusIcon /> Submit
          </button>
          <button tabIndex={3}>
            <Bell />
          </button>
        </div>
      </div>
    </div>
  );
}
