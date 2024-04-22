import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, getDoc, where, query, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import './sendMessage.css';

const SendMessageForm = () => {
  const [message, setMessage] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [Doctor, setDoctor] = useState('');
  const [providers, setProviders] = useState([]);
  const [Provider, setProvider] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    fetchDoctors();
    fetchProviders();
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

  const saveMessageToFirestore = async (message, Doctor, Provider, user) => {
    try {
        const currentTimestamp = new Date().toISOString();

        const docRef = doc(db, 'messages', "messages");
        const docSnap = await getDoc(docRef);
        let existingMessages = docSnap.exists() ? docSnap.data().messages : [];
        const senderref = await doc(db, 'users', user.uid);
        const senderDoc = await getDoc(senderref);
        const senderName = senderDoc.data().username;

        const existingMessageIndex = existingMessages.findIndex(
            (msg) => msg.Doctor === Doctor && msg.Provider === Provider
        );

        if (existingMessageIndex !== -1) {
            existingMessages[existingMessageIndex].messages.push({ message, timestamp: currentTimestamp, sender: senderName});
        } else {
          
            existingMessages.push({Doctor: Doctor, Provider, messages: [{ message, timestamp: currentTimestamp, sender: senderName }], Client: user.uid});
        }
        await setDoc(docRef, { messages: existingMessages });

        console.log('Message saved to Firestore:', message, Doctor, Provider, user.uid);
    } catch (error) {
        console.error('Error saving message to Firestore:', error);
        throw error;
    }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    if (!Doctor && Provider){
      try {
        await saveMessageToFirestore(message, null, Provider, user);
        setMessage('');
        setDoctor('');
        setProvider('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (!Provider && Doctor){
      try {
        await saveMessageToFirestore(message, Doctor, null, user);
        setMessage('');
        setDoctor('');
        setProvider('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    if (Doctor && Provider){
    try {
      await saveMessageToFirestore(message, Doctor, Provider, user);
      setMessage('');
      setDoctor('');
      setProvider('');
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

      <button type="submit">Send</button>
    </form>
  );
};

export default SendMessageForm;
