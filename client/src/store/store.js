import { configureStore } from '@reduxjs/toolkit'
import expenseSlice from './reducer'
import apiSlice from './apiSlice';
import authReducer from './authSlice'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
    reducer: {
        expense: expenseSlice,
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: persistedAuthReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(apiSlice.middleware)
})

export const persistor = persistStore(store)
