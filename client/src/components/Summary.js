import React from 'react'
import { default as api } from '../store/apiSlice';

export default function Summary() {
    const { data, isFetching, isSuccess, isError } = api.useGetSummaryQuery();

    let SummaryContent;

    if (isFetching) {
        SummaryContent = <div>Loading financial summary...</div>;
    }
    else if (isSuccess) {
        const { 
            totalIncome, 
            totalExpense, 
            totalSavings, 
            totalInvestment,
            balance,
            lastUpdated 
        } = data;

        SummaryContent = (
            <div className="space-y-6">
                {/* Main Financial Overview */}
                <h1 className="py-2 font-bold text-xl">Financial Summary</h1>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-100 p-4 rounded-lg">
                        <h3 className="text-green-800 font-semibold">Total Income</h3>
                        <p className="text-2xl font-bold text-green-600">${totalIncome?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-lg">
                        <h3 className="text-indigo-800 font-semibold">Current Balance</h3>
                        <p className="text-2xl font-bold text-indigo-600">${balance?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Transaction Category Analysis */}
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-gray-800 font-semibold mb-4">Transaction Category Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h4 className="text-red-800 font-semibold mb-2">Total Expenses</h4>
                            <p className="text-xl font-bold text-red-600">${totalExpense?.toFixed(2) || '0.00'}</p>
                            <p className="text-sm text-red-600 mt-1">Calculated from all Expense transactions</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="text-blue-800 font-semibold mb-2">Total Savings</h4>
                            <p className="text-xl font-bold text-blue-600">${totalSavings?.toFixed(2) || '0.00'}</p>
                            <p className="text-sm text-blue-600 mt-1">Calculated from all Savings transactions</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="text-purple-800 font-semibold mb-2">Total Investments</h4>
                            <p className="text-xl font-bold text-purple-600">${totalInvestment?.toFixed(2) || '0.00'}</p>
                            <p className="text-sm text-purple-600 mt-1">Calculated from all Investment transactions</p>
                        </div>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="text-center text-xs text-gray-500 mt-4">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                </div>
            </div>
        );
    }
    else if (isError) {
        SummaryContent = <div className="text-red-600">Error loading financial summary</div>;
    }

    return (
        <div className="py-6">
            {SummaryContent}
        </div>
    )
}
