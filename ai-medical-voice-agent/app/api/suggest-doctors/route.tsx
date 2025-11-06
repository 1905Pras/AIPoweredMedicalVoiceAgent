import { NextRequest, NextResponse } from "next/server";
import {openai} from "@/config/OpenAIModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req:NextRequest){
    const {notes}=await req.json();
    try{
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-safeguard-20b",
            messages: [
                {role:'system',content:JSON.stringify(AIDoctorAgents)},
                {role: "user", content: "User Notes/Symptoms:"+notes+", Depends on user notes and symptoms, Please suggest list of doctors. The response MUST be a JSON array of doctor objects. DO NOT wrap the array in a top-level object." }
            ],
        });

        const rawResp=completion.choices[0].message;
        //@ts-ignore
        const Resp=rawResp.content.trim().replace('```json','').replace('```','')
        const JSONResp=JSON.parse(Resp);
        return NextResponse.json(JSONResp);
    }catch(e)
    {
        return NextResponse.json(e);
    }
}

