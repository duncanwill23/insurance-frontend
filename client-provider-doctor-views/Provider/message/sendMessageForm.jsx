import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, getDoc, where, query, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import './sendMessage.css';
import { set } from 'firebase/database';

const SendMessageForm = () => {
  const [message, setMessage] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [Doctor, setDoctor] = useState('');
  const [clients, setClients] = useState([]);
  const [Client, setClient] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    fetchDoctors();
    fetchClients();
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(doctorsQuery);
      const fetchedDoctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().username 
      }));
      setDoctors(fetchedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };
  
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

  const saveMessageToFirestore = async (message, Doctor, Provider, Client) => {
    try {
        const currentTimestamp = new Date().toISOString();

        const docRef = doc(db, 'messages', "messages");
        const docSnap = await getDoc(docRef);
        let existingMessages = docSnap.exists() ? docSnap.data().messages : [];
        const senderref = await doc(db, 'users', Provider.uid);
        const senderDoc = await getDoc(senderref);
        const senderName = senderDoc.data().username;

        const existingMessageIndex = existingMessages.findIndex(
            (msg) => msg.Doctor === Doctor && msg.Client === Client
        );

        if (existingMessageIndex !== -1) {
            existingMessages[existingMessageIndex].messages.push({ message, timestamp: currentTimestamp, sender: senderName});
        } else {
          
            existingMessages.push({Doctor: Doctor, Provider: Provider, messages: [{ message, timestamp: currentTimestamp, sender: senderName }], Client: Client});
        }
        await setDoc(docRef, { messages: existingMessages });

        console.log('Message saved to Firestore:', message, Doctor, Provider.uid, Client);
    } catch (error) {
        console.error('Error saving message to Firestore:', error);
        throw error;
    }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    if (!Doctor && Client){
      try {
        await saveMessageToFirestore(message, null, user, Client);
        setMessage('');
        setDoctor('');
        setClient('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (!Client && Doctor){
      try {
        await saveMessageToFirestore(message, Doctor, user, null);
        setMessage('');
        setDoctor('');
        setClient('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (Doctor && Client){
    try {
      await saveMessageToFirestore(message, Doctor, user, Client);
      setMessage('');
      setDoctor('');
      setClient('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
        value={Doctor}
        onChange={(e) => setDoctor(e.target.value)}
      >
        <option value="">Select a doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>
      <select
        value={Client}
        onChange={(e) => setClient(e.target.value)}
      >
        <option value="">Select a client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <button type="submit">Send</button>
    </form>
  );
};

export default SendMessageForm;
