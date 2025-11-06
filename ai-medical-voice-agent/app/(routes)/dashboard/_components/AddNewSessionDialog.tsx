"use client"
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { SessionDetail } from '../medical-agent/[sessionId]/page'


function AddNewSessionDialog(){
    const [note,setNote]=useState<string>();
    const [loading,setLoading]=useState(false);
    const [suggestedDoctors,setSuggestedDoctors]=useState<doctorAgent[]>();
    const [selectedDoctor,setSelectedDoctor]=useState<doctorAgent>();
    const router=useRouter();
    const { user } = useUser()
    const [historyList,setHistoryList]=useState<SessionDetail[]>([]);
    const {has}=useAuth();
    //@ts-ignore
    const paidUser=has&&has({plan:'pro'})
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

    const OnClickNext=async ()=>{
    setLoading(true)
    const result=await axios.post('/api/suggest-doctors',{
        notes:note
    });

    console.log("API Response Data:", result.data); // Inspect the full response structure!
    
    let doctorsArray: doctorAgent[] | undefined = undefined;

    if (Array.isArray(result.data)) {
        // Case 1: The response is already the array (ideal scenario)
        doctorsArray = result.data;
    } else if (result.data && typeof result.data === 'object') {
        // Case 2: The response is an object, check for common array keys
        // Assuming common keys are 'doctors', 'suggestedDoctors', or 'list'
        doctorsArray = result.data.doctors || result.data.suggestedDoctors || result.data.list;
        
        // Ensure the extracted value is indeed an array
        if (!Array.isArray(doctorsArray)) {
            doctorsArray = undefined; // Set back to undefined if extraction failed
        }
    }

    if (doctorsArray && doctorsArray.length > 0) {
        setSuggestedDoctors(doctorsArray);
    } else {
        // This is the error message you are currently seeing
        console.error("API response does not contain a valid array of doctors or the array is empty.");
        // Optionally, set suggestedDoctors to an empty array to render the doctor list view with no results
        setSuggestedDoctors([]); 
    }

    setLoading(false);
    }
    const onStartConsultation=async()=>{
        setLoading(true);
        //Save all info to database
        const result=await axios.post('/api/session-chat',{
            notes:note,
            selectedDoctor:selectedDoctor
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
        <Dialog>
            <DialogTrigger asChild>
                <Button size='sm' className='mt-2' disabled={!paidUser&&historyList?.length>=1}>Start Consultation<IconArrowRight/></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Basic Details</DialogTitle>
                        <DialogDescription asChild>
                            {!suggestedDoctors? <div>
                                <h2>Add Symptoms or Any Other Details</h2>
                                <Textarea placeholder='Add Detail here...' 
                                className='h-[200px] mt-1'
                                onChange={(e)=>setNote(e.target.value)}
                                />
                            </div>:
                            <div>
                                <h2>Select a Doctor</h2>
                            <div className='grid grid-cols-3 gap-5'>
                                {/* //Suggested Doctors */}
                                {suggestedDoctors.map((doctor,index)=>(
                                    <SuggestedDoctorCard doctorAgent={doctor} key={index}
                                    setSelectedDoctor={()=>setSelectedDoctor(doctor)}
                                    //@ts-ignore
                                    selectedDoctor={selectedDoctor}/>
                                ))}
                            </div>
                            </div>}
                        </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancel</Button>
                    </DialogClose>
                    {!suggestedDoctors? <Button disabled={!note||loading} onClick={OnClickNext}>
                        Next {loading? <Loader2 className='animate-spin'/>:<ArrowRight/>}</Button>
                        :<Button disabled={loading||!selectedDoctor} onClick={()=>onStartConsultation()}>Start Consultation
                        {loading? <Loader2 className='animate-spin'/>:<ArrowRight/>}</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewSessionDialog
