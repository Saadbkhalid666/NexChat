import { useEffect, useRef, useState } from "react";
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from "react-native-webrtc";
import { getSocket } from "./socket.js";
    
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useCall = () => {
  const pc = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle"); // idle | calling | incoming | ongoing

  const getLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
    setLocalStream(stream);
    return stream;
  };

  const startCall = async (toUserId) => {
    const s = getSocket();
    const stream = await getLocalStream();

    pc.current = new RTCPeerConnection(config);
    stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));

    pc.current.ontrack = (e) => setRemoteStream(e.streams[0]);

    pc.current.onicecandidate = ({ candidate }) => {
      if (candidate) s.emit("ice:candidate", { to: toUserId, candidate });
    };

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    s.emit("call:initiate", { to: toUserId, offer });
    setCallState("calling");
  };

  const acceptCall = async (fromUserId, offer) => {
    const s = getSocket();
    const stream = await getLocalStream();

    pc.current = new RTCPeerConnection(config);
    stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));

    pc.current.ontrack = (e) => setRemoteStream(e.streams[0]);

    pc.current.onicecandidate = ({ candidate }) => {
      if (candidate) s.emit("ice:candidate", { to: fromUserId, candidate });
    };

    await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    s.emit("call:accepted", { to: fromUserId, answer });
    setCallState("ongoing");
  };

  const endCall = (toUserId) => {
    const s = getSocket();
    s.emit("call:end", { to: toUserId });
    pc.current?.close();
    pc.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
  };

  return { startCall, acceptCall, endCall, callState, setCallState, localStream, remoteStream };
};