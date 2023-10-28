module.exports.socket = (io) => {
  const activeUsers = new Map();
  const chatRooms = new Map();

  io.on("connect", (socket) => {
    socket.on("addUser", (userId) => {
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, []);
      }
      // Add the current socket.id to the user's array of sockets
      activeUsers.get(userId).push(socket.id);
      console.log(activeUsers, "adduser");
      io.emit("getUsers", Array.from(activeUsers.keys()));
    });

    socket.on("joinRoom", ({ chatId, userId }) => {
      // Check if the chat room exists in chatRooms
      if (!chatRooms.has(chatId)) {
        chatRooms.set(chatId, new Map());
      }

      const chatRoom = chatRooms.get(chatId);

      // Store the userId with the socket.id in the chat room
      if (!chatRoom.has(userId)) {
        chatRoom.set(userId, { sockets: [socket.id] });
      } else {
        chatRoom.get(userId).sockets.push(socket.id);
      }

      console.log(chatRooms.get(chatId), socket.id, "join room");

      // Broadcast the updated chat room to all clients in the chat room
      io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
    });

    socket.on("leaveRoom", ({ chatId, userId }) => {
      if (chatRooms.has(chatId)) {
        const chatRoom = chatRooms.get(chatId);

        if (chatRoom.has(userId)) {
          const user = chatRoom.get(userId);

          // Remove the socket.id of the leaving socket from the user's array
          const socketIndex = user.sockets.indexOf(socket.id);
          if (socketIndex !== -1) {
            user.sockets.splice(socketIndex, 1);
            console.log(
              `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`
            );

            // If the user has no more active sockets in the chat room, remove the user entirely
            if (user.sockets.length === 0) {
              chatRoom.delete(userId);
              console.log(`Removed user ${userId} from chat room ${chatId}`);
            }

            // If the chat room becomes empty after removing the user, you can also remove the chat room
            if (chatRoom.size === 0) {
              chatRooms.delete(chatId);
              console.log(`Removed empty chat room ${chatId}`);
            }

            // Broadcast the updated chat room to all clients in the chat room
            io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
          }
        }
        console.log(chatRooms.get(chatId), socket.id, "leave room");
      }
    });
    socket.on("sendMessage", ({ chatId, senderId, receiverIds, message }) => {
      if (chatRooms.has(chatId)) {
        const chatRoom = chatRooms.get(chatId);
        const receiversNotActive = [];
        const receiversActiveSockets = new Map();

        receiverIds.forEach((receiverId) => {
          if (activeUsers.has(receiverId)) {
            activeUsers.get(receiverId).forEach((activeUser) => {
              if (!receiversActiveSockets.has(receiverId)) {
                receiversActiveSockets.set(receiverId, {
                  sockets: [activeUser],
                });
              } else {
                receiversActiveSockets.get(receiverId).sockets.push(activeUser);
              }
            });
          } else {
            receiversNotActive.push(receiverId);
          }
        });
        if (activeUsers.has(senderId)) {
          const senderSockets = activeUsers.get(senderId);

          senderSockets.forEach((senderSocket) => {
            // Check if the sender's socket is not the current socket
            if (senderSocket !== socket.id) {
              io.to(senderSocket).emit("receiveMessage", {
                senderId,
                message,
              });
            }
            io.to(senderSocket).emit("latestMessage", { senderId, message });
          });
        }
        receiversActiveSockets.forEach((socketsObj, receiverId) => {
          if (chatRoom.has(receiverId)) {
            const chatRoomSockets = chatRoom.get(receiverId).sockets;
            // Check if any of the receiver's sockets are in the chat room
            const socketsInChatRoom = socketsObj.sockets.filter(
              (receiverSocket) => chatRoomSockets.includes(receiverSocket)
            );

            const socketsNotInChatRoom = socketsObj.sockets.filter(
              (receiverSocket) => !chatRoomSockets.includes(receiverSocket)
            );

            if (socketsInChatRoom.length > 0) {
              // At least one socket is in the chat room, emit "messageReceived"
              socketsInChatRoom.forEach((receiverSocket) => {
                io.to(receiverSocket).emit("receiveMessage", {
                  senderId,
                  message,
                });
                io.to(receiverSocket).emit("latestMessage", {
                  senderId,
                  message,
                });
              });
            }
            if (socketsNotInChatRoom.length > 0) {
              socketsNotInChatRoom.forEach((receiverSocket) => {
                io.to(receiverSocket).emit("inAppNotification", {
                  senderId,
                  message,
                });
              });
            }
          } else {
            socketsObj.sockets.forEach((receiverSocket) => {
              io.to(receiverSocket).emit("inAppNotification", {
                senderId,
                message,
              });
              io.to(receiverSocket).emit("latestMessage", {
                senderId,
                message,
              });
            });
          }
        });
      }
    });
    socket.on("typing", ({ receiverIds, sender, chatId }) => {
      receiverIds.forEach((receiverId) => {
        if (activeUsers.has(receiverId)) {
          activeUsers.get(receiverId).forEach((activeUser) => {
            io.to(activeUser).emit("type", {
              typing: true,
              sender,
              chatId,
            });
          });
        }
      });
      console.log("Typing", chatId);
    });
    socket.on("stopTyping", ({ receiverIds, sender, chatId }) => {
      receiverIds.forEach((receiverId) => {
        if (activeUsers.has(receiverId)) {
          activeUsers.get(receiverId).forEach((activeUser) => {
            io.to(activeUser).emit("type", {
              typing: false,
              sender,
              chatId,
            });
          });
        }
      });
      console.log("Stop typing");
    });
    socket.on("disconnect", () => {
      const userIds = Array.from(activeUsers.keys());

      for (const userId of userIds) {
        const sockets = activeUsers.get(userId);

        // Check if the disconnected socket ID exists in the user's sockets
        const socketIndex = sockets.indexOf(socket.id);
        if (socketIndex !== -1) {
          sockets.splice(socketIndex, 1);
          console.log(`Removed socket ID ${socket.id} from user ${userId}`);

          // If the user has no more active sockets, remove the user entirely
          if (sockets.length === 0) {
            activeUsers.delete(userId);
            console.log(`Removed user ${userId} from activeUsers`);
          }
        }
      }

      chatRooms.forEach((chatRoom, chatId) => {
        chatRoom.forEach((user, userId) => {
          if (user.sockets.includes(socket.id)) {
            const socketIndex = user.sockets.indexOf(socket.id);
            if (socketIndex !== -1) {
              user.sockets.splice(socketIndex, 1);
              console.log(
                `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`
              );

              if (user.sockets.length === 0) {
                chatRoom.delete(userId);
                console.log(`Removed user ${userId} from chat room ${chatId}`);
              }
            }
          }
        });

        // If the chat room becomes empty after removing users, you can also remove the chat room
        if (chatRoom.size === 0) {
          chatRooms.delete(chatId);
          console.log(`Removed empty chat room ${chatId}`);
        }

        // Broadcast the updated chat room to all clients in the chat room
        io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
      });
    });
  });
};

//Fastify way
// module.exports.socket = (app) => {
//   const activeUsers = new Map();
//   const chatRooms = new Map();
//   app.ready((err) => {
//     if (err) throw err;

//     app.io.on("connect", (socket) => {
//       socket.on("addUser", (userId) => {
//         if (!activeUsers.has(userId)) {
//           activeUsers.set(userId, []);
//         }
//         // Add the current socket.id to the user's array of sockets
//         activeUsers.get(userId).push(socket.id);
//         console.log(activeUsers, "adduser");
//         app.io.emit("getUsers", Array.from(activeUsers.keys()));
//       });

//       socket.on("joinRoom", ({ chatId, userId }) => {
//         // Check if the chat room exists in chatRooms
//         if (!chatRooms.has(chatId)) {
//           chatRooms.set(chatId, new Map());
//         }

//         const chatRoom = chatRooms.get(chatId);

//         // Store the userId with the socket.id in the chat room
//         if (!chatRoom.has(userId)) {
//           chatRoom.set(userId, { sockets: [socket.id] });
//         } else {
//           chatRoom.get(userId).sockets.push(socket.id);
//         }

//         console.log(chatRooms.get(chatId), socket.id, "join room");

//         // Broadcast the updated chat room to all clients in the chat room
//         app.io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
//       });

//       socket.on("leaveRoom", ({ chatId, userId }) => {
//         if (chatRooms.has(chatId)) {
//           const chatRoom = chatRooms.get(chatId);

//           if (chatRoom.has(userId)) {
//             const user = chatRoom.get(userId);

//             // Remove the socket.id of the leaving socket from the user's array
//             const socketIndex = user.sockets.indexOf(socket.id);
//             if (socketIndex !== -1) {
//               user.sockets.splice(socketIndex, 1);
//               console.log(
//                 `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`
//               );

//               // If the user has no more active sockets in the chat room, remove the user entirely
//               if (user.sockets.length === 0) {
//                 chatRoom.delete(userId);
//                 console.log(`Removed user ${userId} from chat room ${chatId}`);
//               }

//               // If the chat room becomes empty after removing the user, you can also remove the chat room
//               if (chatRoom.size === 0) {
//                 chatRooms.delete(chatId);
//                 console.log(`Removed empty chat room ${chatId}`);
//               }

//               // Broadcast the updated chat room to all clients in the chat room
//               app.io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
//             }
//           }
//           console.log(chatRooms.get(chatId), socket.id, "leave room");
//         }
//       });
//       socket.on("sendMessage", ({ chatId, senderId, receiverIds, message }) => {
//         if (chatRooms.has(chatId)) {
//           const chatRoom = chatRooms.get(chatId);
//           const receiversNotActive = [];
//           const receiversActiveSockets = new Map();

//           receiverIds.forEach((receiverId) => {
//             if (activeUsers.has(receiverId)) {
//               activeUsers.get(receiverId).forEach((activeUser) => {
//                 if (!receiversActiveSockets.has(receiverId)) {
//                   receiversActiveSockets.set(receiverId, {
//                     sockets: [activeUser],
//                   });
//                 } else {
//                   receiversActiveSockets
//                     .get(receiverId)
//                     .sockets.push(activeUser);
//                 }
//               });
//             } else {
//               receiversNotActive.push(receiverId);
//             }
//           });
//           if (activeUsers.has(senderId)) {
//             const senderSockets = activeUsers.get(senderId);

//             senderSockets.forEach((senderSocket) => {
//               // Check if the sender's socket is not the current socket
//               if (senderSocket !== socket.id) {
//                 app.io
//                   .to(senderSocket)
//                   .emit("receiveMessage", { senderId, message });
//               }
//               app.io
//                 .to(senderSocket)
//                 .emit("latestMessage", { senderId, message });
//             });
//           }
//           receiversActiveSockets.forEach((socketsObj, receiverId) => {
//             if (chatRoom.has(receiverId)) {
//               const chatRoomSockets = chatRoom.get(receiverId).sockets;
//               // Check if any of the receiver's sockets are in the chat room
//               const socketsInChatRoom = socketsObj.sockets.filter(
//                 (receiverSocket) => chatRoomSockets.includes(receiverSocket)
//               );

//               const socketsNotInChatRoom = socketsObj.sockets.filter(
//                 (receiverSocket) => !chatRoomSockets.includes(receiverSocket)
//               );

//               if (socketsInChatRoom.length > 0) {
//                 // At least one socket is in the chat room, emit "messageReceived"
//                 socketsInChatRoom.forEach((receiverSocket) => {
//                   app.io
//                     .to(receiverSocket)
//                     .emit("receiveMessage", { senderId, message });
//                   app.io
//                     .to(receiverSocket)
//                     .emit("latestMessage", { senderId, message });
//                 });
//               }
//               if (socketsNotInChatRoom.length > 0) {
//                 socketsNotInChatRoom.forEach((receiverSocket) => {
//                   app.io
//                     .to(receiverSocket)
//                     .emit("inAppNotification", { senderId, message });
//                 });
//               }
//             } else {
//               socketsObj.sockets.forEach((receiverSocket) => {
//                 app.io
//                   .to(receiverSocket)
//                   .emit("inAppNotification", { senderId, message });
//                 app.io
//                   .to(receiverSocket)
//                   .emit("latestMessage", { senderId, message });
//               });
//             }
//           });
//         }
//       });
//       socket.on("typing", ({ receiverIds, sender, chatId }) => {
//         receiverIds.forEach((receiverId) => {
//           if (activeUsers.has(receiverId)) {
//             activeUsers.get(receiverId).forEach((activeUser) => {
//               app.io.to(activeUser).emit("type", {
//                 typing: true,
//                 sender,
//                 chatId,
//               });
//             });
//           }
//         });
//         console.log("Typing", chatId);
//       });
//       socket.on("stopTyping", ({ receiverIds, sender, chatId }) => {
//         receiverIds.forEach((receiverId) => {
//           if (activeUsers.has(receiverId)) {
//             activeUsers.get(receiverId).forEach((activeUser) => {
//               app.io.to(activeUser).emit("type", {
//                 typing: false,
//                 sender,
//                 chatId,
//               });
//             });
//           }
//         });
//         console.log("Stop typing");
//       });
//       socket.on("disconnect", () => {
//         const userIds = Array.from(activeUsers.keys());

//         for (const userId of userIds) {
//           const sockets = activeUsers.get(userId);

//           // Check if the disconnected socket ID exists in the user's sockets
//           const socketIndex = sockets.indexOf(socket.id);
//           if (socketIndex !== -1) {
//             sockets.splice(socketIndex, 1);
//             console.log(`Removed socket ID ${socket.id} from user ${userId}`);

//             // If the user has no more active sockets, remove the user entirely
//             if (sockets.length === 0) {
//               activeUsers.delete(userId);
//               console.log(`Removed user ${userId} from activeUsers`);
//             }
//           }
//         }

//         chatRooms.forEach((chatRoom, chatId) => {
//           chatRoom.forEach((user, userId) => {
//             if (user.sockets.includes(socket.id)) {
//               const socketIndex = user.sockets.indexOf(socket.id);
//               if (socketIndex !== -1) {
//                 user.sockets.splice(socketIndex, 1);
//                 console.log(
//                   `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`
//                 );

//                 if (user.sockets.length === 0) {
//                   chatRoom.delete(userId);
//                   console.log(
//                     `Removed user ${userId} from chat room ${chatId}`
//                   );
//                 }
//               }
//             }
//           });

//           // If the chat room becomes empty after removing users, you can also remove the chat room
//           if (chatRoom.size === 0) {
//             chatRooms.delete(chatId);
//             console.log(`Removed empty chat room ${chatId}`);
//           }

//           // Broadcast the updated chat room to all clients in the chat room
//           app.io.to(chatId).emit("chatUsers", Array.from(chatRoom.keys()));
//         });
//       });
//     });
//   });
// };
