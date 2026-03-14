import WhatsAppInbox from '@/components/dashboard/whatsapp-inbox/WhatsAppInbox';
import AppointmentsList from '@/components/dashboard/whatsapp-inbox/AppointmentsList';

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Receptionist</h1>
        <p className="text-gray-500 mt-1">AI-powered patient conversations via WhatsApp</p>
      </div>
      <WhatsAppInbox />
      <AppointmentsList />
    </div>
  );
}
