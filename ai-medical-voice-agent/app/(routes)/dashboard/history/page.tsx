"use client"

import React from 'react'
import HistoryList from '../_components/HistoryList'

function History() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Consultation History</h1>
            <HistoryList />
        </div>
    )
}

export default History