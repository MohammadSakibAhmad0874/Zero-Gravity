import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../App'
import { Send, MessageCircle, Search, Bot } from 'lucide-react'
import './ChatPage.css'

export default function ChatPage() {
  const { userId } = useParams()
  const { user, token } = useContext(AuthContext)
  const [contacts, setContacts] = useState([])
  const [activeChat, setActiveChat] = useState(userId || null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [chatUser, setChatUser] = useState(null)
  const [search, setSearch] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetch('/api/matches', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(data => setContacts(data.matches || []))
      .catch(() => {})
  }, [token])

  const fetchMessages = useCallback(() => {
    if (!activeChat) return
    fetch(`/api/chat/${activeChat}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { messages: [] })
      .then(data => setMessages(data.messages || []))
      .catch(() => {})
  }, [activeChat, token])

  useEffect(() => {
    if (activeChat) {
      fetchMessages()
      const found = contacts.find(c => c.id === activeChat)
      setChatUser(found || null)
    }
  }, [activeChat, contacts, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return

    const msgText = newMsg.trim()

    // Optimistic: add sent message immediately
    const msg = {
      id: Date.now().toString(),
      senderId: user.id,
      text: msgText,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, msg])
    setNewMsg('')

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: activeChat, text: msgText })
      })

      const data = await res.json()

      if (data.autoReply) {
        // Show typing indicator
        setIsTyping(true)

        // Wait for the "typing" effect, then show the auto-reply
        const delay = 1500 + Math.random() * 1000 // 1.5-2.5s natural delay
        setTimeout(() => {
          setIsTyping(false)
          setMessages(prev => [...prev, data.autoReply])
        }, delay)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Format auto-reply text with line breaks and bold
  const formatMessageText = (text) => {
    if (!text) return ''
    // Convert **text** to bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar glass-card">
        <div className="chat-sidebar-header">
          <h2><MessageCircle size={20} /> Chats</h2>
          <div className="chat-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        <div className="contacts-list">
          {filteredContacts.length > 0 ? filteredContacts.map(c => (
            <button
              key={c.id}
              className={`contact-item ${activeChat === c.id ? 'active' : ''}`}
              onClick={() => setActiveChat(c.id)}
            >
              <div className="avatar avatar-sm">{c.name?.charAt(0)}</div>
              <div className="contact-info">
                <span className="contact-name">{c.name}</span>
                <span className="contact-detail">{c.country}</span>
              </div>
            </button>
          )) : (
            <div className="contacts-empty">
              <p>No contacts yet. Discover matches first!</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeChat && chatUser ? (
          <>
            <div className="chat-main-header glass-card">
              <div className="avatar">{chatUser.name?.charAt(0)}</div>
              <div>
                <h3>{chatUser.name}</h3>
                <span className="chat-user-detail">
                  {chatUser.country}
                  {chatUser.role && ` · ${chatUser.role.replace(/_/g, ' ')}`}
                </span>
              </div>
              <div className="chat-header-status">
                <span className="availability-badge availability-open">
                  Open for collaboration
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length > 0 ? messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === user.id ? 'sent' : 'received'} ${msg.isAutoReply ? 'auto-reply' : ''}`}
                >
                  {msg.isAutoReply && (
                    <div className="auto-reply-badge">
                      <Bot size={12} />
                      <span>Auto-reply</span>
                    </div>
                  )}
                  <div className="message-bubble">
                    <p>{formatMessageText(msg.text)}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="chat-empty">
                  <MessageCircle size={48} />
                  <p>Start the conversation! Say hello 👋</p>
                  <span className="chat-empty-hint">
                    You'll receive an auto-reply with their profile and availability
                  </span>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="message received">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={sendMessage}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                id="chat-input"
              />
              <button type="submit" className="btn btn-primary btn-icon" disabled={!newMsg.trim()} id="chat-send">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a contact from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
