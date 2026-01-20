import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const baseURI = 'http://localhost:8080';
const baseURI = 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
    baseUrl: baseURI,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
    tagTypes: ['user', 'transaction', 'summary', 'labels', 'categories'],
    providesTags: ['user', 'transaction', 'summary', 'labels', 'categories'],
    // Add error handling
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true,
});

export const apiSlice = createApi({
    baseQuery,
    endpoints: builder => ({
        // Auth endpoints
        register: builder.mutation({
            query: (credentials) => ({
                url: '/api/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['user', 'transaction', 'summary', 'labels']
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/api/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['user', 'transaction', 'summary', 'labels'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),
        getProfile: builder.query({
            query: () => '/api/profile',
            providesTags: ['user'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // get categories
        getCategories: builder.query({
            // get: 'http://localhost:8080/api/categories'
            query: () => '/api/categories',
            providesTags: ['categories'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // get labels
        getLabels: builder.query({
            // get: 'http://localhost:8080/api/labels'
            query: () => '/api/labels',
            providesTags: ['transaction', 'user'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // add new Transaction
        addTransaction: builder.mutation({
            query: (initialTransaction) => ({
                // post: 'http://localhost:8080/api/transaction'
                url: '/api/transaction',
                method: "POST",
                body: initialTransaction
            }),
            invalidatesTags: ['transaction', 'summary', 'user', 'labels'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // delete record
        deleteTransaction: builder.mutation({
            query: recordId => ({
                // delete: 'http://localhost:8080/api/transaction'
                url: '/api/transaction',
                method: "DELETE",
                body: recordId
            }),
            invalidatesTags: ['transaction', 'summary', 'user', 'labels'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // update record
        updateTransaction: builder.mutation({
            query: (transaction) => ({
                url: '/api/transaction',
                method: "PUT",
                body: transaction
            }),
            invalidatesTags: ['transaction', 'summary', 'user', 'labels'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        }),

        // get summary
        getSummary: builder.query({
            query: () => '/api/summary',
            providesTags: ['summary'],
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    return { error: 'Authentication failed. Please login again.' }
                }
                if (response.status === 403) {
                    return { error: 'Access denied. Insufficient permissions.' }
                }
                if (response.status >= 500) {
                    return { error: 'Server error. Please try again later.' }
                }
                return response
            }
        })

    }),
    transformErrorResponse: (response) => {
        if (response.status === 401) {
            return { error: 'Authentication failed. Please login again.' }
        }
        if (response.status === 403) {
            return { error: 'Access denied. Insufficient permissions.' }
        }
        if (response.status >= 500) {
            return { error: 'Server error. Please try again later.' }
        }
        return response
    }
})

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery, useGetCategoriesQuery, useGetLabelsQuery, useAddTransactionMutation, useDeleteTransactionMutation, useUpdateTransactionMutation, useGetSummaryQuery } = apiSlice;

export default apiSlice;
