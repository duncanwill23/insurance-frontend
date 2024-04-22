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
          console.log('data:', data);
          
          for (const message of data.messages) {
            if (message.Doctor === user.uid) {
              try {
                const providerData = message.Provider ? await getUserData(message.Provider) : null;
                const clientData = message.Client ? await getUserData(message.Client) : null;
                const doctorData = await getUserData(user.uid);

                console.log('clientData:', clientData);
    
                const conversationKey = `${message.Provider}-${message.Doctor}-${message.Client}`;
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
            } else if (message.Doctor === "toAllDoctors") {
              console.log('toAllDoctors:', message);
              try {

                const doctorData = await getUserData(user.uid);
                
    
                const conversationKey = "toAllDoctors";
                if (!conversationMap.has(conversationKey)) {
                  conversationMap.set(conversationKey, {
                    id: conversationKey,
                    userDoctor: doctorData,
                    userProvider: null,
                    userClient: null,
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
        console.log('Conversations:', conversations);

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
          {console.log("html convo", conversation)}
          // Check if either client or provider is not null
          if (conversation.userClient || conversation.userProvider) {
            return (
              <li key={conversation.id}>
                <div className="conversation-heading">Conversation with:
                <div className='client-display'>
                  {conversation.userClient && <span> {conversation.userClient.username}</span>}
                  {conversation.userClient && (isUserOnline(conversation.userClient) ? <span className='online' style={{ fontSize: 'x-small' }}> (Online)</span> : <span className='offline' style={{ fontSize: 'x-small' }}> (Offline)</span>)}
                </div> 
                  {conversation.userClient && conversation.userProvider && <span> and </span>}
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
          } else if (conversation.id === "toAllDoctors") {
            console.log("toAllDoctors", conversation);
            return (
              <li key={conversation.id}>
                <div className="conversation-heading">Conversation with: All Doctors</div>
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
