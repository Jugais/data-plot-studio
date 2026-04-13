import { UploadCloud } from "lucide-react";
import React, { useRef } from "react";

interface ButtonProps {
  onUpload: (text: string) => void;
  children: string;
}

export const ImportButton = ({onUpload, children}: ButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Input changed! File found:", file?.name);
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const text = event.target?.result;
      console.log("File loaded!");
      if (typeof text === "string") onUpload(text);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    })
    reader.readAsText(file);
  }
  return (
    <>
      <button 
        onClick={() => {fileInputRef.current?.click()}}
        className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-indigo-800 text-white px-4 py-1.5 rounded-full transition-colors shadow-sm"
      >
        <UploadCloud size={16}/>
        {children}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv" 
        className="hidden"
      />
    </>
  )
}


