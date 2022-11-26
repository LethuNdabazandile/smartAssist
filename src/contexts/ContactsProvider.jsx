import React, { useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';


const ContactsContext = React.createContext();

export const useContacts = ()=>{
    return useContext(ContactsContext);
};

export const ContactsProvider = ({children})=>{
    const [contacts, setContacts] = useLocalStorage('contacts',[]);
    const createContacts = (id, name)=>{
        setContacts(previousContacts=>{
            return [...previousContacts, {id, name}]
        })
    }

    return (
        <ContactsContext.Provider value={{contacts, createContacts}}>
            {children}
        </ContactsContext.Provider>
    )
}