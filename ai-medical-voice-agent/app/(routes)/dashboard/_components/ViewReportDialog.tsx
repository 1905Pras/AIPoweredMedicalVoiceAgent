import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { SessionDetail } from '../medical-agent/[sessionId]/page'

interface Report {
    chiefComplaint?: string;
    summary?: string;
    symptoms?: string[];
    duration?: string;
    severity?: string;
    medicationsMentioned?: string[];
    recommendations?: string[];
}

type props = {
    record: SessionDetail & {
        report?: Report;
    }
}

// ...existing code...

function ViewReportDialog({record}: props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'link'} size={'sm'}>View Report</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] max-h-[80vh]">
                <DialogHeader className="sticky top-0 bg-white pb-4 z-10">
                    <DialogTitle>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">Medical AI Voice Agent Report</h2>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 space-y-4 max-h-[calc(80vh-100px)]">
                    {/* Session Info Section */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-blue-600 font-semibold text-sm mb-2">Session Info</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p><span className="font-semibold">Doctor:</span> {record.selectedDoctor?.specialist}</p>
                                <p><span className="font-semibold">User:</span> Anonymous</p>
                            </div>
                            <div>
                                <p><span className="font-semibold">Agent:</span> {record.selectedDoctor?.specialist}</p>
                                <p><span className="font-semibold">Consulted On:</span> {formatDate(record.createdOn)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Chief Complaint Section */}
                    <div className="space-y-1">
                        <h3 className="text-blue-600 font-semibold text-sm">Chief Complaint</h3>
                        <p className="text-sm">{record.report?.chiefComplaint || 'Not specified'}</p>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-1">
                        <h3 className="text-blue-600 font-semibold text-sm">Summary</h3>
                        <p className="text-sm">{record.report?.summary || 'Not specified'}</p>
                    </div>

                    {/* Symptoms Section */}
                    <div className="space-y-1">
                        <h3 className="text-blue-600 font-semibold text-sm">Symptoms</h3>
                        <ul className="list-disc pl-5 text-sm">
                            {record.report?.symptoms?.map((symptom: string, index: number) => (
                                <li key={index}>{symptom}</li>
                            )) || <li>No symptoms recorded</li>}
                        </ul>
                    </div>

                    {/* Duration & Severity Section */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                        <div>
                            <h3 className="text-blue-600 font-semibold text-sm mb-1">Duration</h3>
                            <p className="text-sm">{record.report?.duration || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="text-blue-600 font-semibold text-sm mb-1">Severity</h3>
                            <p className="text-sm">{record.report?.severity || 'Not specified'}</p>
                        </div>
                    </div>

                    {/* Medications Section */}
                    <div className="space-y-1">
                        <h3 className="text-blue-600 font-semibold text-sm">Medications Mentioned</h3>
                        <ul className="list-disc pl-5 text-sm">
                            {record.report?.medicationsMentioned?.map((med: string, index: number) => (
                                <li key={index}>{med}</li>
                            )) || <li>No medications mentioned</li>}
                        </ul>
                    </div>

                    {/* Recommendations Section */}
                    <div className="space-y-1">
                        <h3 className="text-blue-600 font-semibold text-sm">Recommendations</h3>
                        <ul className="list-disc pl-5 text-sm">
                            {record.report?.recommendations?.map((rec: string, index: number) => (
                                <li key={index}>{rec}</li>
                            )) || <li>No recommendations provided</li>}
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        This report was generated by an AI Medical Assistant for informational purposes only.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ...existing code...

export default ViewReportDialog