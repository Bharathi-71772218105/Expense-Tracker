import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'
import Form from './Form'
import Graph from './Graph'
import Labels from './Labels'
import List from './List'
import Summary from './Summary'
import { default as api } from '../store/apiSlice'

export default function Dashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { data: summaryData } = api.useGetSummaryQuery()
    const { data: profileData } = api.useGetProfileQuery()

    // Force refetch all data when user changes
    useEffect(() => {
        if (user) {
            api.util.invalidateTags(['user', 'transaction', 'summary', 'labels'])
        }
    }, [user])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    // Use dynamic balance from summary, fallback to profile balance, then auth balance
    const currentBalance = summaryData?.balance ?? profileData?.balance ?? user?.balance ?? 0
    const currentUser = profileData || user

    return (
        <div className="App">
            <div className="container mx-auto max-w-6xl text-center drop-shadow-lg text-gray-800">
                <div className="flex justify-between items-center py-8 mb-10 bg-purple text-white rounded px-4">
                    <h1 className="text-4xl">Expense Tracker</h1>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {currentUser?.username}</span>
                        <span>Balance: ${currentBalance.toFixed(2)}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* grid columns */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Chart */}
                    <Graph />
                    {/* Form */}
                    <Form />
                </div>

                {/* Labels and List */}
                <div className="mt-8">
                    <Summary />
                    <Labels />
                    <List />
                </div>
            </div>
        </div>
    )
}
