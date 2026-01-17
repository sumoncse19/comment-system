import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import commentsReducer from './slices/commentsSlice';

/**
 * Redux Store Configuration
 *
 * Using Redux Toolkit's configureStore which includes:
 * - Redux DevTools Extension support
 * - Redux Thunk middleware by default
 * - Immutability and serializability checks in development
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    comments: commentsReducer,
  },
  // Middleware is added automatically by Redux Toolkit
  // Includes thunk by default for async actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializability check
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
  // DevTools are enabled by default in development
  devTools: import.meta.env.DEV,
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
