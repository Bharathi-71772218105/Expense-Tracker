import React, { useState } from 'react'
import 'boxicons';
import { default as api } from '../store/apiSlice';
import _ from "lodash";

export default function List() {
    const { data, isFetching, isSuccess, isError } = api.useGetLabelsQuery();
    const [deleteTransaction] = api.useDeleteTransactionMutation();
    const [updateTransaction] = api.useUpdateTransactionMutation();
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleClick = (e) => {
        if (!e.target.dataset.id) return 0;
        deleteTransaction({ _id: e.target.dataset.id });
    }

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingTransaction) return;
        
        const formData = new FormData(e.target);
        const updatedData = {
            _id: editingTransaction._id,
            name: formData.get('name'),
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount'))
        };
        
        await updateTransaction(updatedData).unwrap();
        setEditingTransaction(null);
    }

    let Transactions;

    if (isFetching) {
        Transactions = <div>Fetching</div>;
    }
    else if (isSuccess) {
        Transactions = data.map((v, i) => 
            <Transaction 
                key={i} 
                category={v} 
                handler={handleClick}
                onEdit={handleEdit}
                isEditing={editingTransaction?._id === v._id}
                editingTransaction={editingTransaction}
                onUpdate={handleUpdate}
                onCancel={() => setEditingTransaction(null)}
            />
        );
    }
    else if (isError) {
        Transactions = <div>Error</div>;
    }

    return (
        <div className="flex flex-col py-6 gap-3">
            <h1 className="py-2 font-bold text-xl">History</h1>
            {Transactions}
        </div>
    )
}

function Transaction({ category, handler, onEdit, isEditing, editingTransaction, onUpdate, onCancel }) {
    if (!category) return null;
    
    if (isEditing) {
        return (
            <div className="item flex justify-center bg-gray-50 py-2 rounded-r" style={{ borderRight: `8px solid ${category.color ?? '#e5e5e5'}` }}>
                <form onSubmit={onUpdate} className="flex items-center gap-2 w-full">
                    <input 
                        name="name" 
                        defaultValue={editingTransaction.name} 
                        className="px-2 py-1 border rounded flex-1"
                        placeholder="Name"
                    />
                    <select name="type" defaultValue={editingTransaction.type} className="px-2 py-1 border rounded">
                        <option value="Investment">Investment</option>
                        <option value="Expense">Expense</option>
                        <option value="Savings">Savings</option>
                    </select>
                    <input 
                        name="amount" 
                        type="number" 
                        defaultValue={editingTransaction.amount} 
                        className="px-2 py-1 border rounded w-20"
                        placeholder="Amount"
                    />
                    <button type="submit" className="px-2 text-green-600">
                        <box-icon name='check'></box-icon>
                    </button>
                    <button type="button" onClick={onCancel} className="px-2 text-red-600">
                        <box-icon name='x'></box-icon>
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="item flex justify-center bg-gray-50 py-2 rounded-r" style={{ borderRight: `8px solid ${category.color ?? '#e5e5e5'}` }}>
            <button className="px-3" onClick={handler}><box-icon data-id={category._id ?? ''} color={category.color ?? '#e5e5e5'} name='trash'></box-icon></button>
            <button className="px-3" onClick={() => onEdit(category)}><box-icon color={category.color ?? '#e5e5e5'} name='edit'></box-icon></button>
            <span className="block w-full">
                {_.capitalize(category.name)}-
                {category.amount}
            </span>
        </div>
    )
}
