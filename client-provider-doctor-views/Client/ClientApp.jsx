import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import doctor from "./homepage/doctor.jpg";
import "./App.css";
import Calender from "./homepage/calender.jsx";
import MessageList from "./message/messageList.jsx";
import SendMessageForm from "./message/sendMessageForm.jsx";
import ChatBot from "./message/chatbot.jsx";
import SearchDoctor from "./search/searchDoctor.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to the Client central page</h1>
      <div className="page-content">
        <Calender />
        <img src={doctor} alt="doctor" />
      </div>
    </div>
  );
}

function Message() {
  return (
    <div className="message">
      <div className="message-header">
        <h1>Messages with Doctors and Providers</h1>
        <MessageList />
      </div>
      <div className="message-send">
        <SendMessageForm />
      </div>
    </div>
  );
}

function Chatbot() {
  return (
    <div className="chatbot">
      <h1>This is our systems Chatbot Medi</h1>
      <p className="chatbot-notice">
        Ask MediApp anything you have concerns about. Please note that Medi is
        not a real doctor and should not be used for medical advice.
      </p>
      <ChatBot />
    </div>
  );
}

function Search() {
  return (
    <div className="search-bar">
      <h1>Find your doctor here</h1>
      <SearchDoctor />
    </div>
  );
}

function ClientApp() {
  const navigate = useNavigate();

  const { user, logOut } = useAuth();

  const [userInfo, setUserInfo] = useState({ username: "", role: "" });

  const handleSignOut = () => {
    logOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserInfo({
              username: userDocSnap.data().username,
              role: userDocSnap.data().role,
            });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserInfo();
  }, [user]);
  return (
    <div className="App">
      <header>
        <div className="flex">
          <div className="ml-10">
            <h1>MediApp</h1>
            <nav>
              <ul>
                <li>
                  <Link to="">Home</Link>
                </li>
                <li>
                  <Link to="message">Messages</Link>
                </li>
                <li>
                  <Link to="chatbot">Chatbot</Link>
                </li>
                <li>
                  <Link to="search">Search</Link>
                </li>
              </ul>
            </nav>

            {/* <div className="logout">
            <a href="/">Logout</a>
          </div> */}
          </div>
          <div className="flex mr-10 ml-auto gap-5 w-auto">
            <div className="h-10 w-auto px-5 bg-white   flex items-center justify-center">
              <h1 className="text-black text-center ">Email: {user.email}</h1>
            </div>
            <div className="h-10 w-auto px-5 bg-white flex items-center justify-center  ">
              <h1 className="text-black text-center ">
                Username: {userInfo.username}
              </h1>
            </div>
            <div className="h-10 w-auto px-5 bg-white  flex items-center justify-center ">
              <h1 className="text-black ">Role: {userInfo.role}</h1>
            </div>
            <div className="h-10 w-20 rounded-lg bg-white flex items-center justify-center hover:bg-gray-300 cursor-pointer">
              <button className="text-black" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <section className="hero">
        <div className="container">
          <Routes>
            <Route path="" element={<Home />} />
            <Route path="message" element={<Message />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="search" element={<Search />} />
          </Routes>
        </div>
      </section>
      <footer>
        <div className="container">
          <p>&copy; 2024 Insurance Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ClientApp;
