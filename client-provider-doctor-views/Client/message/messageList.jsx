import React, { useEffect, useState } from 'react';
import { db } from '../../../../firebase';
import { collection, getDocs, where, query, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import './message.css';

const MessageList = () => {
  const [userConversations, setUserConversations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'messages'));
        const conversationMap = new Map();
        
        for (const queryDoc of querySnapshot.docs) {
          const data = queryDoc.data();

          for (const message of data.messages) {
            
            if (message.Client === user.uid) {
              try {
                const providerData = message.Provider ? await getUserData(message.Provider) : null;
                const doctorData = message.Doctor ? await getUserData(message.Doctor) : null;
                const clientData = await getUserData(user.uid);
    
                const conversationKey = `${message.Provider}-${message.Doctor}-${user.uid}`;
                if (!conversationMap.has(conversationKey)) {
                  conversationMap.set(conversationKey, {
                    id: conversationKey,
                    userDoctor: doctorData,
                    userProvider: providerData,
                    userClient: clientData,
                    messages: message.messages ? message.messages : []
                  });

                } else {
                  const conversation = conversationMap.get(conversationKey);
                  conversation.messages.push(message);
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }
          }
        }        
    
        const conversations = Array.from(conversationMap.values());
        setUserConversations(conversations);

      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

    return () => {
      setUserConversations([]);

    };
  }, [user]);

  const getUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const isUserOnline = (user) => {
    if (!user) return false;
    const lastSeen = user.lastSignIn.toDate();
    const now = new Date();
    const diff = now - lastSeen;
    return diff < 24*60*60*1000;
  }

  return (
    <div className="message-list-container">
      <h2>Your Conversations:</h2>
      <ul className="conversation-list">
        {userConversations.map(conversation => {
          // Check if either doctor or provider is not null
          if (conversation.userDoctor || conversation.userProvider) {
            return (
              <li key={conversation.id}>
                <div className="conversation-heading">Conversation with:
                <div className='doctor-display'>
                  {conversation.userDoctor && <span> Dr.{conversation.userDoctor.username}</span>}
                  {conversation.userDoctor && (isUserOnline(conversation.userDoctor) ? <span className='online' style={{ fontSize: 'x-small' }}> (Online)</span> : <span className='offline' style={{ fontSize: 'x-small' }}> (Offline)</span>)}
                </div> 
                  {conversation.userDoctor && conversation.userProvider && <span> and </span>}
                <div className='provider-display'>
                  {conversation.userProvider && <span> {conversation.userProvider.username}</span>}
                  {conversation.userProvider && (isUserOnline(conversation.userProvider) ? <span className='online' style={{ fontSize: 'x-small' }}> (Online)</span> : <span className='offline' style={{ fontSize: 'x-small' }}> (Offline)</span>)}
                </div> 
                </div>
                <ul className="message-list">
                  {conversation.messages.map(message => (
                    <li key={message.timestamp} className="message-item">
                      <p className="message-timestamp">{formatTimestamp(message.timestamp)}</p>
                      <p className="message-sender">From: {message.sender}</p>
                      <p className="message-text">{message.message}</p>
                      <p style={{ fontSize: 'x-small' }}>delivered</p>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }
          else {
            // If both doctor and provider are null, don't render the conversation
            return null;
          }
          
        })}
      </ul>
    </div>
  );  
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export default MessageList;
