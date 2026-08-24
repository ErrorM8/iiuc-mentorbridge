'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import {
  Bell,
  UserCheck,
  UserX,
  CheckCheck,
  Heart,
  ShoppingBag,
  Droplets,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
// import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function NotificationsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [actionDone, setActionDone] = useState({});
  const [token, setToken] = useState('');

  // =========================
  // Fetch all notifications
  // =========================
  const fetchAll = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!tkn) {
      router.push('/login');
      return;
    }

    setToken(tkn);

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Invalid user data:', error);
      }
    }

    try {
      const [reqRes, notifRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/connections/requests`,
          {
            headers: {
              Authorization: `Bearer ${tkn}`,
            },
          }
        ),

        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${tkn}`,
            },
          }
        ),
      ]);

      setRequests(
        Array.isArray(reqRes.data)
          ? reqRes.data
          : []
      );

      setNotifications(
        Array.isArray(notifRes.data)
          ? notifRes.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch notifications:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // =========================
  // Handle connection request
  // =========================
  const handleAction = async (
    connectionId,
    status
  ) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionDone((prev) => ({
        ...prev,
        [connectionId]: status,
      }));
    } catch (error) {
      console.error(
        'Connection action failed:',
        error
      );
    }
  };

  // =========================
  // Mark notification read
  // =========================
  const markRead = async (id) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        'Mark read failed:',
        error
      );
    }
  };

  // =========================
  // Mark all notifications read
  // =========================
  const markAllRead = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        'Mark all read failed:',
        error
      );
    }
  };

  // =========================
  // Notification click
  // =========================
  const handleNotifClick = (notification) => {
    if (!notification.read) {
      markRead(notification.id);
    }

    if (
      notification.type ===
        'connection_accepted' ||
      notification.type ===
        'connection_request'
    ) {
      if (notification.sender?.id) {
        router.push(
          `/users/${notification.sender.id}`
        );
      }

      return;
    }

    if (
      notification.type ===
      'buy_request'
    ) {
      router.push('/market');
      return;
    }

    if (
      notification.type ===
      'blood_request'
    ) {
      router.push('/blood');
      return;
    }
  };

  // =========================
  // Notification icon/style
  // =========================
  const getNotifStyle = (type) => {
    if (type === 'connection_request') {
      return {
        color: '#22c55e',
        icon: UserCheck,
      };
    }

    if (type === 'connection_accepted') {
      return {
        color: '#60a5fa',
        icon: UserCheck,
      };
    }

    if (type === 'like') {
      return {
        color: '#f87171',
        icon: Heart,
      };
    }

    if (type === 'buy_request') {
      return {
        color: '#f59e0b',
        icon: ShoppingBag,
      };
    }

    if (type === 'blood_request') {
      return {
        color: '#ef4444',
        icon: Droplets,
      };
    }

    return {
      color: '#a78bfa',
      icon: Bell,
    };
  };

  // =========================
  // Counts
  // =========================
  const pendingCount = requests.filter(
    (request) =>
      !actionDone[request.id]
  ).length;

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.read
  ).length;

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div
        className="page-bg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border:
              '3px solid rgba(34,197,94,0.2)',
            borderTop:
              '3px solid #22c55e',
            borderRadius: '50%',
            animation:
              'notificationSpin 0.8s linear infinite',
          }}
        />

        <style>
          {`
            @keyframes notificationSpin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <div
      className="page-bg"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main area */}
      <div
        className="main-with-sidebar"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Content */}
        <div
          style={{
            flex: 1,
            width: '100%',
            minWidth: 0,
            padding:
              '2rem 2.5rem 3rem',
            boxSizing: 'border-box',
          }}
        >
          {/* =========================
              Header
          ========================= */}
          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              margin: '0 auto',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  color: 'white',
                  marginBottom:
                    '0.25rem',
                }}
              >
                Notifications
              </h2>

              {pendingCount +
                unreadCount >
                0 && (
                <p
                  style={{
                    color: '#22c55e',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {pendingCount +
                    unreadCount}{' '}
                  new
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="btn-ghost"
                style={{
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCheck
                  size={14}
                />
                Mark all read
              </button>
            )}
          </div>

          {/* =========================
              Connection Requests
          ========================= */}
          {requests.length > 0 && (
            <div
              style={{
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto',
                marginBottom:
                  '1.5rem',
              }}
            >
              <p
                style={{
                  color: 'var(--text3)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                  marginBottom:
                    '0.6rem',
                }}
              >
                Connection Requests (
                {pendingCount})
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: '0.5rem',
                }}
              >
                {requests.map(
                  (request) => {
                    const done =
                      actionDone[
                        request.id
                      ];

                    return (
                      <div
                        key={request.id}
                        className="feed-card"
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '0.75rem',
                          opacity: done
                            ? 0.6
                            : 1,
                          cursor: done
                            ? 'default'
                            : 'pointer',
                        }}
                        onClick={() => {
                          if (
                            !done &&
                            request
                              .sender
                              ?.id
                          ) {
                            router.push(
                              `/users/${request.sender.id}`
                            );
                          }
                        }}
                      >
                        <Avatar
                          user={
                            request.sender
                          }
                          size={42}
                          radius="11px"
                        />

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <p
                            style={{
                              color:
                                'white',
                              fontSize:
                                '0.875rem',
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              request
                                .sender
                                ?.name
                            }
                          </p>

                          <p
                            style={{
                              color:
                                'var(--text3)',
                              fontSize:
                                '0.72rem',
                            }}
                          >
                            {
                              request
                                .sender
                                ?.department
                            }{' '}
                            • Batch{' '}
                            {
                              request
                                .sender
                                ?.batch
                            }
                          </p>

                          <p
                            style={{
                              color:
                                'var(--text3)',
                              fontSize:
                                '0.7rem',
                              marginTop:
                                '0.1rem',
                            }}
                          >
                            Sent you a
                            connection
                            request
                          </p>
                        </div>

                        {!done ? (
                          <div
                            style={{
                              display:
                                'flex',
                              gap:
                                '0.4rem',
                              flexShrink: 0,
                            }}
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <button
                              onClick={() =>
                                handleAction(
                                  request.id,
                                  'accepted'
                                )
                              }
                              className="btn-primary"
                              style={{
                                padding:
                                  '0.35rem 0.7rem',
                                fontSize:
                                  '0.78rem',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap:
                                  '0.25rem',
                              }}
                            >
                              <UserCheck
                                size={13}
                              />
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                handleAction(
                                  request.id,
                                  'rejected'
                                )
                              }
                              className="btn-danger"
                              style={{
                                padding:
                                  '0.35rem 0.7rem',
                                fontSize:
                                  '0.78rem',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap:
                                  '0.25rem',
                              }}
                            >
                              <UserX
                                size={13}
                              />
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{
                              color:
                                done ===
                                'accepted'
                                  ? '#22c55e'
                                  : '#f87171',
                              fontSize:
                                '0.78rem',
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap:
                                '0.3rem',
                              flexShrink: 0,
                            }}
                          >
                            {done ===
                            'accepted' ? (
                              <>
                                <CheckCheck
                                  size={
                                    13
                                  }
                                />
                                Accepted
                              </>
                            ) : (
                              <>
                                <UserX
                                  size={
                                    13
                                  }
                                />
                                Declined
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =========================
              Activity
          ========================= */}
          {notifications.length >
            0 && (
            <div
              style={{
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto',
              }}
            >
              <p
                style={{
                  color:
                    'var(--text3)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                  marginBottom:
                    '0.6rem',
                }}
              >
                Activity
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: '0.5rem',
                }}
              >
                {notifications.map(
                  (notification) => {
                    const {
                      color,
                      icon: Icon,
                    } =
                      getNotifStyle(
                        notification.type
                      );

                    return (
                      <div
                        key={
                          notification.id
                        }
                        className="feed-card"
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap:
                            '0.75rem',
                          opacity:
                            notification.read
                              ? 0.6
                              : 1,
                          cursor:
                            'pointer',
                          transition:
                            'opacity 0.2s',
                        }}
                        onClick={() =>
                          handleNotifClick(
                            notification
                          )
                        }
                      >
                        <div
                          style={{
                            position:
                              'relative',
                            flexShrink: 0,
                          }}
                        >
                          <Avatar
                            user={
                              notification.sender
                            }
                            size={40}
                            radius="10px"
                          />

                          <div
                            style={{
                              position:
                                'absolute',
                              bottom:
                                '-3px',
                              right:
                                '-3px',
                              width:
                                '16px',
                              height:
                                '16px',
                              borderRadius:
                                '50%',
                              background:
                                `${color}22`,
                              border:
                                `1px solid ${color}`,
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                            }}
                          >
                            <Icon
                              size={9}
                              color={
                                color
                              }
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <p
                            style={{
                              color:
                                notification.read
                                  ? 'var(--text2)'
                                  : 'white',
                              fontSize:
                                '0.82rem',
                              lineHeight:
                                '1.45',
                            }}
                          >
                            {
                              notification.message
                            }
                          </p>

                          <p
                            style={{
                              color:
                                'var(--text3)',
                              fontSize:
                                '0.7rem',
                              marginTop:
                                '0.15rem',
                            }}
                          >
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}{' '}
                            •{' '}
                            {new Date(
                              notification.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  '2-digit',
                                minute:
                                  '2-digit',
                              }
                            )}
                          </p>

                          {notification.type ===
                            'blood_request' && (
                            <span
                              style={{
                                color:
                                  '#ef4444',
                                fontSize:
                                  '0.7rem',
                              }}
                            >
                              🩸 Tap to view
                              blood request
                            </span>
                          )}

                          {notification.type ===
                            'buy_request' && (
                            <span
                              style={{
                                color:
                                  '#f59e0b',
                                fontSize:
                                  '0.7rem',
                              }}
                            >
                              🛍️ Tap to view
                              in Market
                            </span>
                          )}
                        </div>

                        {!notification.read && (
                          <div
                            style={{
                              width:
                                '7px',
                              height:
                                '7px',
                              borderRadius:
                                '50%',
                              background:
                                '#22c55e',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =========================
              Empty State
          ========================= */}
          {requests.length === 0 &&
            notifications.length ===
              0 && (
              <div
                style={{
                  width: '100%',
                  maxWidth: '1000px',
                  margin: '0 auto',
                  textAlign:
                    'center',
                  padding:
                    '4rem 1rem',
                }}
              >
                <Bell
                  size={48}
                  style={{
                    margin:
                      '0 auto 0.75rem',
                    display:
                      'block',
                    color:
                      'rgba(255,255,255,0.1)',
                  }}
                />

                <p
                  style={{
                    color:
                      'var(--text2)',
                    fontSize:
                      '0.875rem',
                  }}
                >
                  No notifications
                  yet
                </p>

                <p
                  style={{
                    color:
                      'var(--text3)',
                    fontSize:
                      '0.78rem',
                    marginTop:
                      '0.25rem',
                  }}
                >
                  You'll see
                  connection
                  requests and
                  activity here
                </p>
              </div>
            )}
        </div>

        {/* <Footer /> */}
      </div>
    </div>
  );
}