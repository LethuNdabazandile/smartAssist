import { useEffect, useState } from "react";
// import { Database, Storage } from '@ionic/storage';
// import { Storage } from '@ionic/storage';

const PREFIX = 'appimate-';
const useLocalStorage = (key, initialValue)=>{
    const prefixedKey = PREFIX+key;
    // const [db, setDb] = useState<Database | null>(null);
    // const [db, setDb] = useState(null);


    // const storageSetFunction = useCallback((key, value)=>{
    //     db.set(key, value);
    // }, [db])
    // const storageGetFunction = async (key)=>{
    //     await db.get(key);
    // }
    const [value, setValue] = useState(()=>{
        const jsonValue = localStorage.getItem(prefixedKey);
        // const jsonValue = storageGetFunction(prefixedKey);
        if (jsonValue != null) return JSON.parse(jsonValue);
        if (typeof initialValue === 'function') {
            return initialValue();
        } else {
            return initialValue;
        }
    });

    // useEffect(() => {
    //     async function initDb() {
    //         const store = new Storage();

    //         const db = await store.create();

    //         setDb(db);
    //     }
    
    //     initDb();
    // }, []);
    useEffect(()=>{
        localStorage.setItem(prefixedKey, JSON.stringify(value));
        // storageSetFunction(prefixedKey, JSON.stringify(value));
    // }, [prefixedKey, value, storageSetFunction]);
    }, [prefixedKey, value]);
    
    return [value, setValue];
};

export default useLocalStorage;