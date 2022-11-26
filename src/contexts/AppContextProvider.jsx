import React from 'react';

import { initialState, reducer } from '../services/State';

export const AppContext = React.createContext();

export function AppContextProvider(props) {
    const fullInitialState = {
        ...initialState,
    }
  
    let [state, dispatch] = React.useReducer(reducer, fullInitialState);
    let value = { state, dispatch };
  
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}
export const AppContextConsumer = AppContext.Consumer;