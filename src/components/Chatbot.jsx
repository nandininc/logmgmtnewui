import React, { useState, useEffect, useRef } from 'react';

const Chatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open chat on component mount with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Add initial greeting based on user role
      const greeting = `Hi ${getUserRoleTitle(user)}! How can I help you today?`;
      addBotMessage(greeting);
    }, 1500); // 1.5 second delay

    return () => clearTimeout(timer);
  }, [user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserRoleTitle = (user) => {
    if (!user) return 'Guest';
    
    // Extract role from user object
    const role = user.role?.toLowerCase() || '';
    
    if (role.includes('operator')) return 'Operator';
    if (role.includes('avp')) return 'AVP';
    if (role.includes('qa')) return 'QA Manager';
    if (role.includes('master')) return 'Master Admin';
    
    // If custom name is available, use it
    if (user.name) return user.name;
    
    return 'User';
  };

  const addBotMessage = (content) => {
    setIsBotTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', content }]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', content: inputValue }]);
    
    // Process user message and generate bot response
    const botResponse = generateResponse(inputValue);
    setInputValue('');
    
    // Add bot response after a delay
    addBotMessage(botResponse);
  };

  const generateResponse = (message) => {
    const normalizedMessage = message.toLowerCase();
    
    // Simple response logic
    if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
      return 'Hello! How can I assist you today?';
    } else if (normalizedMessage.includes('help')) {
      return 'I can help with information about the inspection forms, navigation, or general assistance. What do you need help with?';
    } else if (normalizedMessage.includes('form') || normalizedMessage.includes('inspection')) {
      return 'You can create a new inspection form by going to the forms page and clicking on "New Form". Let me know if you need more specific guidance.';
    } else if (normalizedMessage.includes('logout') || normalizedMessage.includes('log out')) {
      return 'To log out, click the "Logout" button at the top right corner of the page.';
    } else if (normalizedMessage.includes('thank')) {
      return "You're welcome! If you need anything else, I'm here to help.";
    } else if (normalizedMessage.includes('dashboard')) {
      return 'To access the dashboard, click on the "Dashboard" link in the main navigation menu.';
    } else if (normalizedMessage.includes('settings')) {
      return 'You can adjust your settings by clicking on the "Settings" icon located in the top right corner.';
    } else if (normalizedMessage.includes('profile')) {
      return 'To view or edit your profile, click on your name in the top right corner and select "Profile".';
    } else if (normalizedMessage.includes('error') || normalizedMessage.includes('issue')) {
      return 'I’m sorry to hear you’re experiencing an issue. Can you describe the problem in more detail so I can assist you better?';
    } else if (normalizedMessage.includes('contact')) {
      return 'You can contact support by clicking the "Contact Us" link in the footer, or by sending an email to support@example.com.';
    } else if (normalizedMessage.includes('notification') || normalizedMessage.includes('alert')) {
      return 'To view your notifications, click on the bell icon in the top right corner of the page.';
    } else if (normalizedMessage.includes('language')) {
      return 'To change your language preferences, go to the "Settings" section and select "Language".';
    } else if (normalizedMessage.includes('save')) {
      return 'Don’t forget to save your work regularly by clicking the "Save" button at the bottom of the page!';
    } else {
      return "I'm not sure I understand. Could you please provide more details or try asking in a different way?";
    }
};


  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-16 right-6 z-50">
      {/* Chat button */}
      <button 
        onClick={toggleChat}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center w-14 h-14"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 flex flex-col">
          {/* Chat header */}
          <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">AGI Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;