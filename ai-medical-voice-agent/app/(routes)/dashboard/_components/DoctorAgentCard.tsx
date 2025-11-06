"use client"
import React, { useState } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import AddNewSessionDialog from './AddNewSessionDialog';
import { Badge, Loader2Icon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import router, { useRouter } from 'next/navigation';

export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId?:string,
    subscriptionRequired:boolean
}
type props={
    doctorAgent:doctorAgent
}

function DoctorAgentCard({doctorAgent}:props){
    const [loading,setLoading]=useState(false);
    const router=useRouter();

    const {has}=useAuth();
    //@ts-ignore
    const paidUser=has&&has({plan:'pro'})

    const onStartConsultation=async()=>{
        setLoading(true);
        //Save all info to database
        const result=await axios.post('/api/session-chat',{
            notes:'New Query',
            selectedDoctor:doctorAgent
        });
        console.log(result.data)
        if(result.data?.sessionId){
            console.log(result.data.sessionId);
            //Route new conversation screen
            router.push('/dashboard/medical-agent/'+result.data.sessionId);
        }
        setLoading(false);
    }

    return(
        <div className='relative'>
            {doctorAgent.subscriptionRequired&&<Badge className='absolute'>
                Premium
            </Badge>}
            <Image src={doctorAgent.image} 
                alt={doctorAgent.specialist}
                width={200}
                height={300}
                className='w-full h-[250px] object-cover rounded-xl'
            />
            <h2 className='font-bold mt-1'>{doctorAgent.specialist}</h2>
            <p className='line-clamp-2 test-sm test-gray-500'>{doctorAgent.description}</p>
            <Button className='w-full mt-2' 
            onClick={onStartConsultation}
            disabled={!paidUser&&doctorAgent.subscriptionRequired}>
                Start Consultation {loading?<Loader2Icon className='animate-spin'/>:<IconArrowRight/>}</Button>
        </div>
    )
}

export default DoctorAgentCard