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
  //     const text = event.target?.result;
      
  //     if (typeof text === "string") onUpload(text);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   })
  //   reader.readAsText(file);
  // }
        const result = event.target?.result;
        if (!(result instanceof ArrayBuffer)) return;

        const uint8Array = new Uint8Array(result);

        // 1. まずは UTF-8 としてデコードを試みる
        // fatal: true を設定すると、文字化け（不正なバイト）がある場合にエラーを投げてくれる
        const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
        let text;
        
        try {
          text = utf8Decoder.decode(uint8Array);
          console.log("Success: Decoded as UTF-8");
        } catch (e) {
          const sjisDecoder = new TextDecoder('shift-jis');
          text = sjisDecoder.decode(uint8Array);
          console.log("Fallback: Decoded as Shift-JIS (CP932)");
        }

        if (typeof text === "string") onUpload(text);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      reader.readAsArrayBuffer(file);
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


