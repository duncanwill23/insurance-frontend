import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, getDoc, where, query, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import './sendMessage.css';
import { set } from 'firebase/database';

const SendMessageForm = () => {
  const [message, setMessage] = useState('');
  const [clients, setClients] = useState([]);
  const [Client, setClient] = useState('');
  const [providers, setProviders] = useState([]);
  const [Provider, setProvider] = useState('');
  const [sendToAllDoctors, setSendToAllDoctors] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    fetchClients();
    fetchProviders();
    
  }, []);

  const fetchClients = async () => {
    try {
      const clientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
      const querySnapshot = await getDocs(clientsQuery);
      const fetchedClients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().username
      }));
      setClients(fetchedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  
  const fetchProviders = async () => {
    try {
      const providersQuery = query(collection(db, 'users'), where('role', '==', 'insuranceProvider'));
      const querySnapshot = await getDocs(providersQuery);
      const fetchedProviders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().username 
      }));
      setProviders(fetchedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const saveMessageToFirestore = async (message, user, Provider, Client) => {
    try {
        const currentTimestamp = new Date().toISOString();

        const docRef = doc(db, 'messages', "messages");
        const docSnap = await getDoc(docRef);
        let existingMessages = docSnap.exists() ? docSnap.data().messages : [];
        const senderref = await doc(db, 'users', user.uid);
        const senderDoc = await getDoc(senderref);
        const senderName = senderDoc.data().username;

        const existingMessageIndex = existingMessages.findIndex(
            (msg) => msg.Client === Client && msg.Provider === Provider
        );

        if (existingMessageIndex !== -1) {
            existingMessages[existingMessageIndex].messages.push({ message, timestamp: currentTimestamp, sender: senderName});
        } else {
          
            existingMessages.push({Client: Client, Provider, messages: [{ message, timestamp: currentTimestamp, sender: senderName }], Doctor: user.uid});
        }
        await setDoc(docRef, { messages: existingMessages });

        console.log('Message saved to Firestore:', message, Client, Provider, user.uid);
    } catch (error) {
        console.error('Error saving message to Firestore:', error);
        throw error;
    }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    if (!Client && Provider){
      try {
        await saveMessageToFirestore(message, user, Provider, null);
        setMessage('');
        setClient('');
        setProvider('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (!Provider && Client){
      try {
        await saveMessageToFirestore(message, user, null, Client);
        setMessage('');
        setClient('');
        setProvider('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (Client && Provider){
    try {
      await saveMessageToFirestore(message, user, Provider, Client);
      setMessage('');
      setClient('');
      setProvider('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
    if (sendToAllDoctors) {
      console.log('Sending message to all doctors:');
      try{
        const docRef = doc(db, 'messages', "messages");
        const docSnap = await getDoc(docRef);
        let existingMessages = docSnap.exists() ? docSnap.data().messages : [];
        const senderref = await doc(db, 'users', user.uid);
        const senderDoc = await getDoc(senderref);
        const senderName = senderDoc.data().username;
        const currentTimestamp = new Date().toISOString();
        const existingMessageIndex = existingMessages.findIndex(
          (msg) => msg.Doctor === "toAllDoctors"
      );
      if (existingMessageIndex !== -1) {
        existingMessages[existingMessageIndex].messages.push({ message, timestamp: currentTimestamp, sender: senderName});
      
      }else{
        existingMessages.push({Doctor: "toAllDoctors", messages: [{ message, timestamp: currentTimestamp, sender: senderName }]});
      }
      await setDoc(docRef, { messages: existingMessages });
      console.log('Message saved to Firestore:', message, Client, Provider, user.uid);
    }catch (error) {
        console.error('Error sending message to all doctors:', error);
    }
    setMessage('');
    setSendToAllDoctors(false);
  }
};



  return (
    <form onSubmit={handleSubmit} className="send-message-form">
      <h3>Send a message</h3>
      <input
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <select
        value={Client}
        onChange={(e) => setClient(e.target.value)}
      >
        <option value="">Select a patient</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
      <select
        value={Provider}
        onChange={(e) => setProvider(e.target.value)}
      >
        <option value="">Select a provider</option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={sendToAllDoctors}
          onChange={(e) => setSendToAllDoctors(e.target.checked)}
        />
        Send to all doctors
      </label>
      <button type="submit">Send</button>
    </form>
  );
};

export default SendMessageForm;
