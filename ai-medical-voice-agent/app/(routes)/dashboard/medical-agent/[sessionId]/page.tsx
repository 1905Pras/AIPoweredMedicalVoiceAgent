"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router=useRouter();

  // ✅ Fetch session details
  useEffect(() => {
    if (sessionId) GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      setSessionDetail(result.data);
    } catch (error) {
      console.error("❌ Failed to fetch session details:", error);
      alert("Unable to load session details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Start Call Function
  const StartCall = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;

    // Validate env and session
    if (!apiKey) {
      alert("Vapi API key missing. Check your .env.local → NEXT_PUBLIC_VAPI_API_KEY");
      console.error("Missing NEXT_PUBLIC_VAPI_API_KEY");
      return;
    }

    if (!sessionDetail) {
      alert("Session not loaded yet. Please wait a moment and retry.");
      return;
    }

    console.log("✅ Starting Vapi call...");
    const vapi = new Vapi(apiKey);
    setVapiInstance(vapi);

    // Error handler
    vapi.on("error", (error: any) => {
      const errMsg = error?.message || JSON.stringify(error) || "Unknown Vapi error";
      console.error("🔥 Vapi Error:", errMsg);
      alert("An error occurred while connecting to Vapi:\n" + errMsg);
      setCallStarted(false);
    });

    // ✅ Voice validation
    const validVoices = [
      "Elliot", "Kylie", "Rohan", "Lily", "Savannah",
      "Hana", "Neha", "Cole", "Harry", "Paige", "Spencer"
    ];
    const selectedVoice =
      sessionDetail.selectedDoctor?.voiceId && validVoices.includes(sessionDetail.selectedDoctor.voiceId)
        ? sessionDetail.selectedDoctor.voiceId
        : "Elliot";

    // ✅ Correct Vapi configuration
    const VapiAgentConfig = {
      name: "AI Medical Doctor Voice Agent",
      firstMessage: "Hi there! I'm your AI Medical Assistant. How can I help you today?",
      transcriber: {
        provider: "assembly-ai",
        language: "en",
      },
      voice: {
        provider: "vapi",
        voiceId: selectedVoice,
      },
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: sessionDetail.selectedDoctor?.agentPrompt || "",
          },
        ],
      },
    };

    try {
      vapi.start(VapiAgentConfig as any);

      // Event listeners
      vapi.on("call-start", () => {
        console.log("📞 Call started successfully");
        setCallStarted(true);
      });

      vapi.on("call-end", () => {
        console.log("📴 Call ended");
        setCallStarted(false);
      });

      vapi.on("message", (message: any) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          console.log(`${role}: ${transcript}`);

          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            setMessages((prev) => [...prev, { role, text: transcript }]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });

      vapi.on("speech-start", () => {
        console.log("🗣️ Assistant speaking");
        setCurrentRole("assistant");
      });

      vapi.on("speech-end", () => {
        console.log("🤫 Assistant stopped");
        setCurrentRole("user");
      });
    } catch (error: any) {
      const errMsg = error?.message || JSON.stringify(error);
      console.error("❌ Failed to start Vapi call:", errMsg);
      alert("Failed to start Vapi call: " + errMsg);
      setCallStarted(false);
    }
  }, [sessionDetail]);

  // ✅ End Call Function
  const EndCall = useCallback(async() => {
    if (!vapiInstance) return;

    try {
      setLoading(true);
      vapiInstance.stop();
      vapiInstance.removeAllListeners();

      setCallStarted(false);
      setVapiInstance(null);
      router.replace('/dashboard');
      setCurrentRole(null);
      setLiveTranscript("");
      const result=await GenerateReport();

      setLoading(false);
    } catch (error) {
      console.error("Error ending Vapi call:", error);
    }
  }, [vapiInstance]);

  const GenerateReport=async ()=>{
    const result=await axios.post('/api/medical-report',{
      messages:messages,
      sessionDetail:sessionDetail,
      sessionId:sessionId
    })
    console.log(result.data);
    return result.data;
  }

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle
            className={`w-4 h-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected..." : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>

      {loading && (
        <p className="mt-10 text-center text-gray-400">Loading session...</p>
      )}

      {sessionDetail && (
        <div className="flex flex-col items-center mt-10">
          <Image
            src={sessionDetail.selectedDoctor?.image}
            alt={sessionDetail.selectedDoctor?.specialist || "Doctor"}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg">
            {sessionDetail.selectedDoctor?.specialist}
          </h2>
          <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72 max-h-[300px]">
            {messages.slice(-4).map((msg, index) => (
              <h2 className="text-gray-400 p-2" key={index}>
                {msg.role}: {msg.text}
              </h2>
            ))}

            {liveTranscript && (
              <h2 className="text-lg font-medium text-gray-200">
                {currentRole}: {liveTranscript}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall}>
              {loading? <Loader className='animate-spin'/>:<PhoneCall />} Start Call
            </Button>
          ) : (
            <Button variant="destructive" className="mt-20" onClick={EndCall}>
              {loading? <Loader className='animate-spin'/>:<PhoneOff />} End Call
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
