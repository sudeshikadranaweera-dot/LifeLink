import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where,
  doc, updateDoc, deleteDoc } from "firebase/firestore";
import Navbar from "./Navbar";

function Notifications() {
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const aTime = a.createdAt?.toDate
          ? a.createdAt.toDate() : new Date(0);
        const bTime = b.createdAt?.toDate
          ? b.createdAt.toDate() : new Date(0);
        return bTime - aTime;
      });
      setNotifications(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const updates = notifications
        .filter(n => !n.read)
        .map(n => updateDoc(
          doc(db, "notifications", n.id), { read: true }
        ));
      await Promise.all(updates);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      const deletes = notifications.map(n =>
        deleteDoc(doc(db, "notifications", n.id))
      );
      await Promise.all(deletes);
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "Unread") return !n.read;
    if (filter === "Read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Notifications</h2>
            <p>{unreadCount} unread</p>
          </div>
          <div style={{display:"flex", gap:"10px"}}>
            <button className="btn-secondary"
              style={{padding:"8px 16px", fontSize:"13px"}}
              onClick={markAllRead}>
              Mark All as Read
            </button>
            <button className="btn-danger"
              style={{padding:"8px 16px"}}
              onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>
        <div className="page-content">
          <div className="tab-buttons" style={{marginBottom:"20px"}}>
            {["All","Unread","Read"].map(tab => (
              <button key={tab}
                className={`tab-btn ${filter === tab ? "active" : ""}`}
                onClick={() => setFilter(tab)}>
                {tab}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">🔔</span>
              <h3>No notifications yet</h3>
              <p>You will be notified about emergency requests
                and responses from hospitals</p>
            </div>
          ) : (
            <div style={{display:"flex",
              flexDirection:"column", gap:"10px"}}>
              {filteredNotifications.map(n => (
                <div key={n.id} style={{
                  background: n.read
                    ? "white" : "var(--primary-light)",
                  border: n.read
                    ? "1px solid var(--gray-200)"
                    : "1px solid var(--primary)",
                  borderRadius:"var(--radius)",
                  padding:"16px 20px",
                  display:"flex", alignItems:"flex-start",
                  gap:"14px", cursor:"pointer"}}
                  onClick={async () => {
                    await updateDoc(
                      doc(db, "notifications", n.id),
                      { read: true }
                    );
                    fetchNotifications();
                  }}>
                  <span style={{fontSize:"24px", flexShrink:0}}>
                    {n.type === "emergency" ? "🔴" :
                     n.type === "accepted" ? "🟢" :
                     n.type === "closed" ? "🔵" : "🟡"}
                  </span>
                  <div style={{flex:1}}>
                    <h4 style={{fontSize:"14px", fontWeight:"600",
                      marginBottom:"4px"}}>{n.title}</h4>
                    <p style={{fontSize:"13px",
                      color:"var(--gray-500)"}}>{n.message}</p>
                    <p style={{fontSize:"11px",
                      color:"var(--gray-500)", marginTop:"6px"}}>
                      {n.createdAt?.toDate
                        ? n.createdAt.toDate().toLocaleString()
                        : "Recently"}
                    </p>
                  </div>
                  {!n.read && (
                    <span style={{fontSize:"10px",
                      background:"var(--primary)", color:"white",
                      padding:"2px 8px", borderRadius:"99px",
                      fontWeight:"600", flexShrink:0}}>
                      Unread
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;