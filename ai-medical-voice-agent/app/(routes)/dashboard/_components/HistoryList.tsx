"use client"

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { Loader } from 'lucide-react'
import HistoryTable from './HistoryTable'
import { SessionDetail } from '../medical-agent/[sessionId]/page'

function HistoryList() {
    const { user } = useUser()
    const [historyList, setHistoryList] = useState<SessionDetail[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            getHistoryList()
        }
    }, [user])

    const getHistoryList = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/session-chat?sessionId=all')
            setHistoryList(response.data)
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {historyList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No consultation history found
                </div>
            ) : (
                <HistoryTable historyList={historyList} />
            )}
        </div>
    )
}

export default HistoryList