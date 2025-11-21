import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { Camera, Send, Image as ImageIcon, Loader2, User, Bot, Baby, ShieldCheck, Heart, BookOpen } from 'lucide-react';

// --- Styles ---
const styles = `
  :root {
    --primary: #2D6A4F;
    --primary-light: #40916C;
    --secondary: #D8F3DC;
    --accent: #1B4332;
    --background: #F7F9F9;
    --text: #1F2937;
    --msg-user: #2D6A4F;
    --msg-ai: #FFFFFF;
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  body {
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--background);
    color: var(--text);
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
  }

  /* Header */
  header {
    background-color: white;
    padding: 1rem;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Age Selector */
  .age-selector {
    padding: 0.75rem 1rem;
    background: #F0FDF4;
    border-bottom: 1px solid #DCFCE7;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .age-btn {
    background: white;
    border: 1px solid #BBF7D0;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    color: var(--primary);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .age-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    font-weight: 600;
  }

  /* Chat Area */
  .chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scroll-behavior: smooth;
  }

  .message {
    display: flex;
    gap: 0.75rem;
    max-width: 85%;
    animation: messageAppear 0.3s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
  }

  .message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar.ai { background: var(--secondary); color: var(--primary); }
  .avatar.user { background: var(--primary); color: white; }

  .bubble {
    padding: 0.8rem 1rem;
    border-radius: 12px;
    line-height: 1.5;
    font-size: 0.95rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    white-space: pre-wrap;
  }

  .message.user .bubble {
    background-color: var(--msg-user);
    color: white;
    border-top-right-radius: 2px;
    transition: all 0.2s ease;
  }

  .message.user .bubble:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(45, 106, 79, 0.2);
  }

  .message.ai .bubble {
    background-color: var(--msg-ai);
    color: var(--text);
    border: 1px solid #E5E7EB;
    border-top-left-radius: 2px;
  }

  .message-image {
    max-width: 200px;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    border: 2px solid rgba(255,255,255,0.2);
  }

  /* Input Area */
  .input-container {
    padding: 1rem;
    background: white;
    border-top: 1px solid #E5E7EB;
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .preview-container {
    position: absolute;
    bottom: 130px; /* Adjusted for suggestion area */
    left: 20px;
    background: white;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border: 1px solid #E5E7EB;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .preview-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .close-preview {
    background: #EF4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text-input {
    flex: 1;
    border: 1px solid #D1D5DB;
    border-radius: 24px;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    resize: none;
    max-height: 120px;
    outline: none;
    transition: border-color 0.2s;
  }

  .text-input:focus {
    border-color: var(--primary);
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    padding: 0.6rem;
    border-radius: 50%;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: var(--secondary);
  }

  .icon-btn:disabled {
    color: #9CA3AF;
    cursor: not-allowed;
  }

  /* Suggestion Area */
  .suggestion-area {
    padding: 0.5rem 1rem;
    background: #F9FAFB;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
    border-top: 1px solid #F3F4F6;
  }
  
  .suggestion-area::-webkit-scrollbar {
    display: none;
  }

  .suggestion-chip {
    background: white;
    border: 1px solid #E5E7EB;
    color: #4B5563;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .suggestion-chip:hover {
    background: var(--secondary);
    color: var(--primary);
    border-color: var(--primary-light);
  }

  .disclaimer {
    text-align: center;
    font-size: 0.7rem;
    color: #9CA3AF;
    padding: 0.5rem;
    background: #F9FAFB;
  }

  /* Markdown-like styling for AI response */
  .bubble h1, .bubble h2, .bubble h3 { margin-top: 0.5rem; margin-bottom: 0.5rem; font-size: 1.1em; font-weight: 600; }
  .bubble ul, .bubble ol { margin: 0.5rem 0; padding-left: 1.5rem; }
  .bubble li { margin-bottom: 0.25rem; }
  .bubble strong { font-weight: 600; color: var(--primary); }
`;

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
};

type AgeGroup = '0-1 Years' | '2-5 Years' | '6-12 Years' | '13-18 Years';

// --- Constants ---
const PROMPT_SUGGESTIONS: Record<AgeGroup, string[]> = {
  '0-1 Years': [
    "How to help baby sleep better?",
    "Signs of teething?",
    "Starting solid foods guide",
    "Activities for 6-month old"
  ],
  '2-5 Years': [
    "How to handle tantrums gently?",
    "Meal ideas for picky eaters",
    "Potty training tips",
    "Dealing with separation anxiety"
  ],
  '6-12 Years': [
    "Helping with homework motivation",
    "Appropriate screen time limits",
    "Signs of bullying at school",
    "Building self-confidence"
  ],
  '13-18 Years': [
    "How to talk about mental health?",
    "Social media safety rules",
    "Dealing with mood swings",
    "College preparation advice"
  ]
};

// --- App Component ---
const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your Parenting Compass. I'm here to listen and support you with practical advice tailored to your child's age.\n\nPlease select your child's age to begin, and feel free to share whatever is on your mind."
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('2-5 Years');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    textInputRef.current?.focus();
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: input,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    // Determine Model and System Instruction
    // Flash Lite for text (Fast), Pro for Images (Analysis)
    const isImageRequest = !!newUserMessage.image;
    const modelName = isImageRequest ? 'gemini-3-pro-preview' : 'gemini-2.5-flash-lite';
    
    const systemInstruction = `
      You are "Parenting Compass", a warm, non-judgmental, and deeply empathetic parenting partner.
      
      YOUR CORE APPROACH:
      1. EMPATHY FIRST: Always start by validating the parent's feelings. Put yourself in their shoes. Acknowledge that parenting is challenging. Make them feel relaxed, understood, and safe to share their struggles. Use a comforting and supportive tone, like a wise, caring friend.
      2. PRACTICAL SOLUTIONS: Move beyond theory. Provide clear, concrete, and actionable steps they can implement immediately. Focus on "how-to" rather than just "why".

      CURRENT CHILD AGE GROUP: ${ageGroup}
      Tailor all advice to the specific developmental stage, emotional needs, and cognitive abilities of a ${ageGroup} child.

      ETHICAL GUIDELINES (Universal Traditional Values):
      Your advice must be universally welcoming but adhere to conservative, traditional family values to ensure safety and wholesomeness.
      1. Promote deep respect for parents and family cohesion.
      2. For social relationships (especially teens), emphasize friendship, group activities, and family involvement; avoid encouraging private dating or exclusive romantic relationships for minors.
      3. In dietary advice, do not recommend alcohol, intoxicants, or pork products.
      4. Focus on modesty, responsibility, resilience, and character development.
      5. Do not use religious terminology. Keep the language secular yet deeply moral and professional.
      
      If an image is provided, analyze it in the context of parenting (e.g., assessing a drawing, checking a homework assignment, identifying a room hazard) with a helpful and encouraging perspective.
      
      FORMATTING:
      Use warm opening sentences. Use bolding for key practical steps. Keep paragraphs concise.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Streaming logic
      let streamResponse;
      let fullText = '';
      const modelId = Date.now().toString() + '-ai';

      // Optimistic update for AI message
      setMessages(prev => [...prev, { id: modelId, role: 'model', text: '' }]);

      if (isImageRequest && newUserMessage.image) {
        // Image + Text Request (Gemini 3 Pro)
        // Strip prefix for API
        const base64Data = newUserMessage.image.split(',')[1];
        const mimeType = newUserMessage.image.substring(newUserMessage.image.indexOf(':') + 1, newUserMessage.image.indexOf(';'));
        
        streamResponse = await ai.models.generateContentStream({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Data } },
              { text: newUserMessage.text || "Analyze this image in a parenting context." }
            ]
          },
          config: { systemInstruction }
        });
      } else {
        // Text Only Request (Gemini 2.5 Flash Lite - Fast)
        // We use chat history for context
        const chat = ai.chats.create({
          model: modelName,
          config: { systemInstruction },
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }] // Simplify history to text for lite model speed
          }))
        });

        streamResponse = await chat.sendMessageStream({ message: newUserMessage.text });
      }

      for await (const chunk of streamResponse) {
        const textChunk = chunk.text;
        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => 
            prev.map(msg => msg.id === modelId ? { ...msg, text: fullText } : msg)
          );
        }
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "I apologize, but I encountered a temporary issue. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <header>
          <div className="header-title">
            <Heart size={24} fill="var(--primary)" />
            Parenting Compass
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} />
            <span>Family Focused</span>
          </div>
        </header>

        {/* Age Group Tabs */}
        <div className="age-selector">
          {(['0-1 Years', '2-5 Years', '6-12 Years', '13-18 Years'] as AgeGroup[]).map((age) => (
            <button 
              key={age}
              className={`age-btn ${ageGroup === age ? 'active' : ''}`}
              onClick={() => setAgeGroup(age)}
            >
              {ageGroup === age && <Baby size={14} style={{display:'inline', marginRight:4}}/>}
              {age}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="chat-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="bubble-container" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="message-image" />
                )}
                <div className="bubble">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message model">
              <div className="avatar ai"><Bot size={18} /></div>
              <div className="bubble" style={{ color: '#6B7280', fontStyle: 'italic' }}>
                <Loader2 className="animate-spin" size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Consulting resources...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          {selectedImage && (
            <div className="preview-container">
              <img src={selectedImage} alt="Preview" className="preview-image" />
              <button onClick={clearImage} className="close-preview">×</button>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
          
          <button 
            className="icon-btn" 
            onClick={triggerFileInput}
            title="Upload image for analysis"
          >
            <Camera size={24} />
          </button>

          <textarea
            ref={textInputRef}
            className="text-input"
            placeholder={`Ask about your ${ageGroup} child...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          
          <button 
            className="icon-btn" 
            onClick={sendMessage}
            disabled={(!input && !selectedImage) || isLoading}
            style={{ backgroundColor: (input || selectedImage) ? 'var(--primary)' : 'transparent', color: (input || selectedImage) ? 'white' : undefined }}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Suggestions Area (Below Input) */}
        <div className="suggestion-area">
          {PROMPT_SUGGESTIONS[ageGroup].map((prompt, index) => (
            <button 
              key={index} 
              className="suggestion-chip"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="disclaimer">
          Not medical advice. Consult professionals for serious issues.
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);