import { useEffect } from "react";

export default function SmartSummary({ text }) {
  useEffect(() => {
    if (!text) return;

    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  }, [text]);

  return null;
}