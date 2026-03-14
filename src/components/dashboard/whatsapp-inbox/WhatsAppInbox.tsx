'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ConversationThread from './ConversationThread';

interface Conversation {
  id: string;
  patient_phone: string;
  patient_name: string | null;
  session_state: string;
  updated_at: string;
}

export default function WhatsAppInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchConversations();

    // Real-time subscription
    const channel = supabase
      .channel('whatsapp-inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_conversations' },
        () => fetchConversations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConversations() {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('id, patient_phone, patient_name, session_state, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }

  function formatPhone(phone: string) {
    return phone.replace('whatsapp:', '');
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-xl overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-[#075E54]">
          <h2 className="text-white font-semibold text-lg">WhatsApp Inbox</h2>
          <p className="text-green-100 text-sm">{conversations.length} conversations</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv.id)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selected === conv.id ? 'bg-green-50 border-l-4 border-l-[#25D366]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {conv.patient_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {conv.patient_name || formatPhone(conv.patient_phone)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {timeAgo(conv.updated_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{formatPhone(conv.patient_phone)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1">
        {selected ? (
          <ConversationThread conversationId={selected} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a chat from the left to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
