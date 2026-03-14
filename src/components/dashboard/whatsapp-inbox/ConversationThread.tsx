'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  message_body: string;
  created_at: string;
}

interface Conversation {
  patient_name: string | null;
  patient_phone: string;
}

export default function ConversationThread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    fetchConv();

    const channel = supabase
      .channel(`thread-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `conversation_id=eq.${conversationId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConv() {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('patient_name, patient_phone')
      .eq('id', conversationId)
      .single();
    if (data) setConv(data);
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  }

  async function sendReply() {
    if (!replyText.trim() || !conv || sending) return;
    setSending(true);
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: conv.patient_phone,
          message: replyText,
          conversationId,
        }),
      });
      setReplyText('');
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-full bg-[#ECE5DD]">
      {/* Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">
          {conv?.patient_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            {conv?.patient_name || conv?.patient_phone?.replace('whatsapp:', '')}
          </p>
          <p className="text-green-200 text-xs">{conv?.patient_phone?.replace('whatsapp:', '')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm shadow-sm ${
                msg.direction === 'outbound'
                  ? 'bg-[#DCF8C6] text-gray-800 rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.message_body}</p>
              <p className={`text-xs mt-1 ${msg.direction === 'outbound' ? 'text-green-700 text-right' : 'text-gray-400'}`}>
                {formatTime(msg.created_at)}
                {msg.direction === 'outbound' && ' \u2713\u2713'}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          placeholder="Type a message..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
        />
        <button
          onClick={sendReply}
          disabled={sending || !replyText.trim()}
          className="bg-[#25D366] hover:bg-[#1DAA56] disabled:opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
