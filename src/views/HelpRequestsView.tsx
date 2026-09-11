import React, { useState } from 'react';
import { HelpRequest } from '../types';

interface HelpRequestsViewProps {
  helpRequests: HelpRequest[];
}

export const HelpRequestsView: React.FC<HelpRequestsViewProps> = ({ helpRequests: initial }) => {
  const [requests, setRequests] = useState(initial);

  const handleFulfill = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Fulfilled' as const } : r))
    );
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-[#e4beba] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Community Help Requests & Assistance
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            Urgent civilian requests for food, water, medical supplies, and emergency transport.
          </p>
        </div>

        <div className="bg-[#ffdad6] text-[#93000a] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">handshake</span>
          38 Pending Requests
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-[#e4beba] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-[#1a1c1c]">{req.requesterName}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#e0e0ff] text-[#27308a]">
                  {req.category}
                </span>
                <span className="text-xs text-[#5b403d] font-mono">{req.timeAgo}</span>
              </div>

              <p className="text-sm text-[#1a1c1c] font-medium">{req.urgentNeed}</p>

              <div className="text-xs text-[#5b403d] flex items-center gap-4">
                <span>
                  <strong>Location:</strong> {req.location}
                </span>
                <span>
                  <strong>People Count:</strong> {req.peopleCount}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  req.status === 'Fulfilled'
                    ? 'bg-[#e6f4ea] text-[#137333]'
                    : req.status === 'Assigned'
                    ? 'bg-[#e0e0ff] text-[#27308a]'
                    : 'bg-[#ffdad6] text-[#93000a]'
                }`}
              >
                {req.status}
              </span>

              {req.status !== 'Fulfilled' && (
                <button
                  onClick={() => handleFulfill(req.id)}
                  className="bg-[#005f7b] hover:bg-[#00799c] text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-xs"
                >
                  Dispatch & Fulfill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
