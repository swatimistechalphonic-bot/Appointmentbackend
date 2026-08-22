import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  UserCheck,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Circle
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchConversation(activeContact._id || activeContact.id);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await chatApi.getContacts();
      if (res.data?.success && Array.isArray(res.data.contacts)) {
        setContacts(res.data.contacts);
        if (res.data.contacts.length > 0) {
          setActiveContact(res.data.contacts[0]);
        }
      }
    } catch (err) {
      console.error('Fetch Contacts Error:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchConversation = async (contactId) => {
    setLoadingMessages(true);
    try {
      const res = await chatApi.getConversation(contactId);
      if (res.data?.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      } else {
        // Mock initial welcome conversation
        setMessages([
          {
            _id: 'm1',
            senderName: activeContact?.name || 'Dr. Specialist',
            text: `Hello ${user?.name || 'Patient'}, I am ${activeContact?.name || 'Doctor'}. How can I assist you with your health today?`,
            createdAt: new Date().toISOString(),
            isSender: false
          }
        ]);
      }
    } catch (err) {
      console.error('Fetch Conversation Error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Instant UI update
    const tempMsg = {
      _id: Date.now().toString(),
      sender: user?._id || user?.id || 'me',
      senderName: user?.name || 'You',
      receiver: activeContact._id || activeContact.id,
      receiverName: activeContact.name,
      text: messageText,
      createdAt: new Date().toISOString(),
      isSender: true
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await chatApi.sendMessage({
        receiver: activeContact._id || activeContact.id,
        text: messageText
      });

      if (res.data?.success && res.data.chatMessage) {
        // Optional backend confirmation update
      }
    } catch (err) {
      console.error('Send Message Error:', err);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.specialization && c.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 140px)' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Doctor Consultation Chat 💬
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', margin: 0 }}>Direct real-time messaging with specialist doctors</p>
        </div>
      </div>

      {/* 2-Column Chat Dashboard */}
      <div className="card" style={{ display: 'flex', padding: 0, overflow: 'hidden', flex: 1, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        {/* Left Column: Contacts List */}
        <div style={{ width: '320px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0' }}>
            <div className="header-search" style={{ width: '100%' }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                placeholder="Search Doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                No doctors found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isActive = activeContact && (activeContact._id === contact._id || activeContact.id === contact.id);
                return (
                  <div
                    key={contact._id || contact.id}
                    onClick={() => setActiveContact(contact)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.9rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      background: isActive ? '#EFF6FF' : 'transparent',
                      borderLeft: isActive ? '4px solid #0066FF' : '4px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={contact.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                        alt={contact.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: contact.online !== false ? '#10B981' : '#94A3B8',
                          border: '2px solid #FFFFFF'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {contact.name}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: '#0066FF', fontWeight: '600', margin: '0.1rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {contact.specialization || 'Doctor'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Feed & Input */}
        {activeContact ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
            {/* Active Contact Bar */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={activeContact.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                    alt={activeContact.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #FFFFFF'
                    }}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {activeContact.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Circle size={8} fill="#10B981" color="#10B981" /> Online • {activeContact.specialization || 'Medical Specialist'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: '0.45rem' }} title="Voice Call">
                  <Phone size={16} color="#475569" />
                </button>
                <button className="btn btn-secondary btn-sm" style={{ padding: '0.45rem' }} title="Video Consultation">
                  <Video size={16} color="#0066FF" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.88rem', margin: 'auto' }}>
                  Loading chat conversation...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.88rem', margin: 'auto' }}>
                  No messages yet. Send a message to start consultation!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUserSender = msg.isSender || (msg.sender === (user?._id || user?.id));
                  return (
                    <div
                      key={msg._id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUserSender ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isUserSender ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '0.2rem', fontWeight: '600' }}>
                        {isUserSender ? 'You' : msg.senderName || activeContact.name}
                      </span>
                      <div
                        style={{
                          padding: '0.85rem 1.15rem',
                          borderRadius: isUserSender ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                          background: isUserSender ? 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)' : '#FFFFFF',
                          color: isUserSender ? '#FFFFFF' : '#0F172A',
                          border: isUserSender ? 'none' : '1px solid #E2E8F0',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '0.9rem',
                          lineHeight: '1.45'
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isUserSender && <CheckCheck size={14} color="#0066FF" />}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF' }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.45rem' }} title="Attach File">
                <Paperclip size={18} color="#64748B" />
              </button>

              <input
                type="text"
                className="input-field"
                placeholder={`Type a message for ${activeContact.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{ flex: 1, borderRadius: '24px', padding: '0.65rem 1.15rem' }}
              />

              <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Send</span> <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            Select a doctor contact to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
