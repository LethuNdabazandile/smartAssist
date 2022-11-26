import React, { useContext, useMemo, useCallback } from 'react';
import { AppContext } from './AppContextProvider';

import {arrayEquality} from '../services/Utils';
import useLocalStorage from '../hooks/useLocalStorage';
import { getUserID, setMessageCounter } from '../services/State';
import { onDeviceStorage } from "../services/Utils";

const ConversationsContext = React.createContext();

export const useConversations = ()=>{
    return useContext(ConversationsContext);
};

export const ConversationsProvider = ({children})=>{
    const {state, dispatch} = useContext(AppContext);
    const id = getUserID(state);
    const [conversations, setConversations] = useLocalStorage('conversations',[]);
    const [selectedConversationIndex, setSelectedConversationIndex] = useLocalStorage('convoIndex', 0);

    const createConversation = (recipients, names)=>{
        setConversations(prevConversations=>{
            let madeChange = false;
            const newConversation = prevConversations.map(conversation=>{
                if (arrayEquality(conversation.recipients, recipients)) {
                    madeChange = true;
                    return {
                        ...conversation
                    }
                }
                return conversation;
            })
            if (madeChange) {
                return newConversation;
            } else {
                return [...prevConversations, {recipients, names, messages: []}]
            }
        })
    }
    const addMessageToConversation = useCallback(({recipients, msg, sender, callback})=>{
        setConversations(prevConversations=>{
            let affectedConvo = null;
            const newMessage = {sender: sender.id, text: msg.text, ask: msg.ask};
            if ('state' in msg) newMessage.state = msg.state;
            if ('msgID' in msg) newMessage.msgID = msg.msgID; 
            var  newConversations = prevConversations.map((conversation, key)=>{
                if (arrayEquality(conversation.recipients, recipients)) {
                    affectedConvo = key;
                    return {
                        ...conversation, names: sender.chatName, messages: [...conversation.messages, newMessage]
                    }
                }
                return conversation;
            });
            if (!affectedConvo) {
                newConversations = [...prevConversations, {recipients, names: sender.chatName, messages: [newMessage]}];
                affectedConvo = newConversations.length-1;
            };
            if (true) {
                callback({
                    success: true, 
                    data: {
                        insertId: newConversations[affectedConvo].messages.length-1
                    }
                });
                return newConversations;
            };
            callback({success: false, msg: "Message not recorded."});
            return prevConversations;
        });
    }, [setConversations]);
    const updateMessageOnConversation = useCallback((updateInfo)=>{
        console.log(updateInfo)
        setConversations(prevConversations=>{
            const convoToUpdateIndex = prevConversations.findIndex(c=> arrayEquality(c.recipients, updateInfo.recipients));
            const convoToUpdate = prevConversations[convoToUpdateIndex];
            let updatedMsgs = convoToUpdate.messages.map((msg, key)=>{
                var msgUpdate = msg;
                if (key === updateInfo.localIndex) {
                    if ('state' in updateInfo) msgUpdate.state = updateInfo.state;
                    if ('msgID' in updateInfo) msgUpdate.msgID = updateInfo.msgID; onDeviceStorage('set', {'appimate-lastMsgID': updateInfo.msgID}); 
                };
                return msgUpdate;
            });
            convoToUpdate.messages = updatedMsgs;
            prevConversations[convoToUpdateIndex] = convoToUpdate;
            return prevConversations;
        });
    }, [setConversations])
    const sendMessage = async (sender, recipients, msg, callback)=>{
        addMessageToConversation({recipients, msg, sender, callback});
    }
    const recieveMessage = useCallback((messageFromSocket)=>{
        // console.log(messageFromSocket);
        var msgID = messageFromSocket.message.msgID;
        var msgToAdd = {
            recipients: messageFromSocket.recipients, 
            msg: {
                text: messageFromSocket.message.text,
                state: messageFromSocket.message.state,
                msgID,
            },
            sender: messageFromSocket.sender,
            callback: ()=>{}
        };
        addMessageToConversation(msgToAdd);
        dispatch(setMessageCounter(1));
        onDeviceStorage('set', {'appimate-lastMsgID': msgID}); 
    }, [dispatch, addMessageToConversation]);
    const selectConversationIndex = (recipients)=>{
        var currentConvoIndex;
        if (conversations.findIndex(c=> arrayEquality(c.recipients, recipients)) < 0) {
            var tempNewConos = [...conversations, {recipients, messages: []}];
            currentConvoIndex = tempNewConos.findIndex(c=> arrayEquality(c.recipients, recipients));
        } else {
            currentConvoIndex = conversations.findIndex(c=> arrayEquality(c.recipients, recipients));
        };
        setSelectedConversationIndex(currentConvoIndex);
    }

    var formattedConversations = useMemo(()=> conversations.map((conversation, index)=>{
        const recipients = conversation.recipients.map(recipient=>{
            return {
                id: recipient, 
            };
        })
        const messages = conversation.messages.map(message=>{
            const fromMe = id === message.sender;

            return {...message, 
                fromMe
            };
        })
        return {...conversation, messages, recipients}
    }), [conversations, id]);

    let formattedChatContacts = useMemo(()=> conversations.map((conversation, index)=>{
        const recipients = conversation.recipients.map(recipient=>{
            return recipient;
        })

        const names = conversation.names;
        const selected = index === selectedConversationIndex;
        var lastMsgText = "";
        var fromMe = false;
        var msgState = 0;
        if (conversation.messages) {
            if (conversation.messages.length > 0) {
                const lastMsg = conversation.messages[conversation.messages.length - 1];
                lastMsgText = (lastMsg.text).substring(0, 25);
                msgState = lastMsg.state;
                fromMe = id === lastMsg.sender;
            }
        }
        return {recipients, names, lastMsgText, fromMe, selected, state: msgState}
    }), [conversations, selectedConversationIndex, id]);
    let lastMsgID = useMemo(()=>{
        if (conversations.length>0) {
            var conoMsgs = conversations[conversations.length-1];
            if (conoMsgs.length > 0) {
                return conoMsgs[conoMsgs.length-1].msgID;
            } else {
                return 0;
            };
        } else {
            return 0;
        }
    }, [conversations]);
    const clearConvo = (convo)=>{
        setConversations(prevConversations=>{
            const newConversation = prevConversations.map(conversation=>{
                if (arrayEquality(conversation.recipients, convo.recipients)) {
                    return {
                        ...conversation, messages: []
                    }
                }
                return conversation;
            })
            return newConversation;
        })   
    }
    const deleteConvo = (convo)=>{
        setConversations(prevConversations=>{
            return prevConversations.filter(conversation=> !arrayEquality(conversation.recipients, convo.recipients));
        })
    }
    const value = {
        lastMsgID,
        conversations: formattedChatContacts, 
        selectedConversation: formattedConversations[selectedConversationIndex],
        sendMessage,
        selectConversationIndex,
        createConversation,
        recieveMessage,
        updateMessageOnConversation,
        clearConvo,
        deleteConvo
    }

    return (
        <ConversationsContext.Provider value={value}>
            {children}
        </ConversationsContext.Provider>
    )
}