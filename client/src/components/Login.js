import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../store/authSlice'
import { useLoginMutation, useRegisterMutation } from '../store/apiSlice'

export default function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const { register, handleSubmit, reset } = useForm()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation()
    const [registerUser, { isLoading: registerLoading, error: registerError }] = useRegisterMutation()
    const [errorMessage, setErrorMessage] = useState('')

    const onSubmit = async (data) => {
        try {
            setErrorMessage('') // Clear previous errors

            if (isLogin) {
                // Clear all cached data before new login
                localStorage.clear();
                
                const result = await login(data).unwrap()
                dispatch(setCredentials({ user: result.user, token: result.token }))
                navigate('/dashboard')
            } else {
                // Clear cache before registration
                localStorage.clear();
                
                await registerUser(data).unwrap()
                alert('Registration successful! Please login.')
                setIsLogin(true)
                reset()
            }
        } catch (error) {
            console.error('Login/Register error:', error)
            
            // Handle different error types
            let errorMsg = 'An error occurred'
            
            if (error.status === 'FETCH_ERROR') {
                errorMsg = 'Cannot connect to server. Please check if server is running on port 5000.'
            } else if (error.status === 'TIMEOUT_ERROR') {
                errorMsg = 'Connection timeout. Please try again.'
            } else if (error.data?.message) {
                errorMsg = error.data.message
            } else if (error.error) {
                errorMsg = error.error
            } else if (error.message) {
                errorMsg = error.message
            }
            
            setErrorMessage(errorMsg)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                {...register('username', { required: true })}
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <input
                                {...register('password', { required: true })}
                                type="password"
                                required
                                autoComplete="current-password"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        {!isLogin && (
                            <div>
                                <input
                                    {...register('salary', { required: true, valueAsNumber: true })}
                                    type="number"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Monthly Salary"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        {/* Error Display */}
                        {errorMessage && (
                            <div className="bg-red-100 border border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {errorMessage}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={loginLoading || registerLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLogin ? 'Sign in' : 'Register'}
                            {(loginLoading || registerLoading) && (
                                <span className="ml-2">Loading...</span>
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-600 hover:text-indigo-500"
                        >
                            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
