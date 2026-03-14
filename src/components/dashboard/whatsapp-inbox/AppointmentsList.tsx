'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  treatment_type: string;
  status: string;
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('whatsapp_appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .then(({ data }: { data: Appointment[] | null }) => { if (data) setAppointments(data); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">WhatsApp Appointments</h2>
        <p className="text-sm text-gray-500">Appointments booked via AI chat</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Patient', 'Phone', 'Date', 'Time', 'Treatment', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{appt.patient_name}</td>
                <td className="px-4 py-3 text-gray-500">{appt.patient_phone.replace('whatsapp:', '')}</td>
                <td className="px-4 py-3">{appt.appointment_date}</td>
                <td className="px-4 py-3">{appt.appointment_time}</td>
                <td className="px-4 py-3">{appt.treatment_type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                    {appt.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No appointments booked yet via WhatsApp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
