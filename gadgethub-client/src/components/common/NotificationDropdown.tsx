import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const { unseenResponses, unreadCount, markResponseAsSeen, markAllResponsesAsSeen, clearNotifications, checkForUnseenResponses } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Debug logging
  console.log('NotificationDropdown - unseenResponses:', unseenResponses);
  console.log('NotificationDropdown - unreadCount:', unreadCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (response: any) => {
    markResponseAsSeen(response.id);
    setIsOpen(false);
    
    // Navigate to quotations page
    navigate('/quotations');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const responseTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - responseTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return responseTime.toLocaleDateString();
  };

  return (
    <div className="notification-dropdown">
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
                             <button 
                 className="btn-test"
                 onClick={() => {
                   console.log('Test button clicked - Current state:', { unseenResponses, unreadCount });
                   // Force check for unseen responses
                   checkForUnseenResponses();
                 }}
                 title="Test notification system"
                 style={{ fontSize: '12px', padding: '2px 4px', marginRight: '5px' }}
               >
                 🧪
               </button>
              {unreadCount > 0 && (
                <button 
                  className="btn-mark-all-read"
                  onClick={markAllResponsesAsSeen}
                  title="Mark all as seen"
                >
                  ✓
                </button>
              )}
              <button 
                className="btn-clear-all"
                onClick={clearNotifications}
                title="Clear all notifications"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="notification-list">
            {unseenResponses.length === 0 ? (
              <div className="no-notifications">
                <p>No new responses</p>
              </div>
            ) : (
              unseenResponses.map((response) => (
                <div 
                  key={response.id}
                  className="notification-item unread"
                  onClick={() => handleNotificationClick(response)}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      New Quotation Response
                    </div>
                    <div className="notification-message">
                      {response.productName} quotation is arrived
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(response.respondedAt)}
                    </div>
                  </div>
                  <div className="unread-indicator"></div>
                </div>
              ))
            )}
          </div>

          {unseenResponses.length > 0 && (
            <div className="notification-footer">
              <button 
                className="btn-view-all"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/quotations');
                }}
              >
                View All Quotations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 