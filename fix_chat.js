const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app', '[locale]', '(dashboard)', 'report', 'chat', '[reportId]', 'page.tsx'),
  path.join(__dirname, 'app', '[locale]', '(dashboard)', 'peer-consultant', 'chat', '[reportId]', 'page.tsx')
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add Missing Imports: X, FileText
  if (!content.includes('FileText')) {
    content = content.replace(/import \{([^}]+)\} from "lucide-react";/g, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('X')) imports.push('X');
      if (!imports.includes('FileText')) imports.push('FileText');
      return `import {\n  ${imports.join(', ')}\n} from "lucide-react";`;
    });
  }

  // 2. Add pending state variables
  if (!content.includes('pendingFileUrl')) {
    content = content.replace(/const \[isAITyping.*\n/g, (match) => {
      return match + `  const [pendingFile, setPendingFile] = useState<File | null>(null);\n  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);\n  const [pendingFileType, setPendingFileType] = useState<string | null>(null);\n  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);\n  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);\n`;
    });
    // For peer-consultant which might not have isAITyping
    if (filePath.includes('peer-consultant') && !content.includes('pendingFileUrl')) {
        content = content.replace(/const \[isSending.*\n/g, (match) => {
            return match + `  const [pendingFile, setPendingFile] = useState<File | null>(null);\n  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);\n  const [pendingFileType, setPendingFileType] = useState<string | null>(null);\n  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);\n  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);\n`;
        });
    }
  }

  // Add cleanup for object URL
  if (!content.includes('revokeObjectURL')) {
    content = content.replace(/useEffect\(\(\) => \{[\s\S]*?fetchInitialData\(\);[\s\S]*?\}, \[reportId, router, supabase\]\);/g, (match) => {
      return match + `\n\n  useEffect(() => {\n    return () => {\n      if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);\n      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);\n    };\n  }, [pendingFileUrl, pendingAudioUrl]);\n`;
    });
  }

  // 3. Fix Message Interface to include video
  content = content.replace(/message_type: 'text'\|'audio'\|'image'\|'file';/g, "message_type: 'text'|'audio'|'image'|'file'|'video';");

  // 4. Update bubble rendering
  content = content.replace(/\{msg\.message_type === 'image'[\s\S]*?(?=<p(?: className="whitespace-pre-wrap")?>\{msg\.content)/, `                  {msg.message_type === 'image' && msg.attachment_url && (
                    <div className="relative w-48 h-36 rounded-xl overflow-hidden cursor-pointer mt-2" onClick={() => window.open(msg.attachment_url, '_blank')}>
                      <Image src={msg.attachment_url} alt="attachment" fill className="object-cover hover:opacity-90 transition" />
                    </div>
                  )}
                  {msg.message_type === 'audio' && msg.attachment_url && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-xl p-2 mt-2 min-w-[200px]">
                      <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <audio controls src={msg.attachment_url} className="flex-1 h-8" style={{ minWidth: '150px' }} />
                    </div>
                  )}
                  {msg.message_type === 'file' && msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 rounded-xl p-3 mt-2 hover:bg-white/30 transition">
                      <FileText className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{msg.attachment_name || 'File'}</p>
                        <p className="text-xs opacity-70">Tap untuk buka</p>
                      </div>
                    </a>
                  )}
                  {msg.message_type === 'video' && msg.attachment_url && (
                    <video controls src={msg.attachment_url} className="w-48 rounded-xl mt-2 max-h-36 object-cover" />
                  )}
                  `);

  // 5. Update input area rendering
  const isReport = filePath.includes('report');
  
  const startInputMarker = isReport ? 
    '{/* Input Area */}\n      <div className="bg-white border-t border-[#E7E9EB] p-4 shrink-0">' : 
    '{/* Input Area */}\n            <div className="bg-white border-t border-[#E7E9EB] p-4">';
    
  const endInputMarker = isReport ? 
    '      {/* Emergency Modal */}' : 
    '      {/* Modals */}';

  const startIndex = content.indexOf(startInputMarker);
  const endIndex = content.indexOf(endInputMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    // Find the end of the div that contains the input area
    const inputAreaSection = content.substring(startIndex, endIndex);
    
    // For report, it's just </div> before Emergency Modal
    // For peer-consultant, it's </div> </> } </div> before Modals
    
    const newInputAreaStr = (isReport ? `      {/* Input Area */}
      <div className="bg-white border-t border-[#E7E9EB] p-4 shrink-0">` : `            {/* Input Area */}
            <div className="bg-white border-t border-[#E7E9EB] p-4">`) + `
        {(pendingFile || pendingAudio) && (
          <div className="px-4 py-3 border-t bg-gray-50 mb-2 rounded-xl">
            {pendingFile && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                {pendingFileType?.startsWith('image/') && pendingFileUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={pendingFileUrl} alt="preview" fill className="object-cover" />
                  </div>
                )}
                {!pendingFileType?.startsWith('image/') && (
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-teal-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
                  <p className="text-xs text-gray-500">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => {
                  setPendingFile(null)
                  setPendingFileUrl(null)
                  setPendingFileType(null)
                }} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            {pendingAudio && pendingAudioUrl && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <audio controls src={pendingAudioUrl} className="w-full h-8" />
                  <p className="text-xs text-gray-500 mt-1">Voice note</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setPendingAudio(null)
                    setPendingAudioUrl(null)
                  }} className="text-xs text-gray-500 hover:text-red-500">
                    Rekam ulang
                  </button>
                  <button onClick={() => {
                    setPendingAudio(null)
                    setPendingAudioUrl(null)
                  }} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-2 relative">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center p-1 focus-within:border-[#1B4F72] transition-colors shadow-sm">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#1B4F72] hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip size={20} />
            </button>
            
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] px-2 py-2.5 text-[16px]"
              rows={1}
            />
            
            {(!inputMessage.trim() && !pendingFile && !pendingAudio) ? (
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={\`p-2 rounded-full transition-colors \${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#1B4F72] hover:bg-gray-100'}\`}
              >
                {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
              </button>
            ) : (
              <button onClick={handleSendMessage} disabled={isSending} className="p-2 bg-[#1B4F72] text-white rounded-full hover:bg-[#123650] transition-colors disabled:opacity-50 mx-1">
                <Send size={18} className="ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
` + (isReport ? '' : `          </>\n        )}\n      </div>\n\n`);

    content = content.replace(inputAreaSection, newInputAreaStr);
  }

  // 6. Update handlers
  const handlersRegex = /const handleSendMessage[\s\S]*?(?=const formatTimestamp)/;
  
  const callAIAgentPart = filePath.includes('peer-consultant') ? '' : `\n      if (!report?.assigned_consultant_id && !audioToUpload && !fileToUpload) {\n        callAIAgent(messageContent);\n      }`;

  const newHandlers = `const handleSendMessage = async () => {
    if (!currentUser) return;
    if ((!inputMessage.trim() && !pendingFile && !pendingAudio) || isSending) return;
    setIsSending(true);

    try {
      let attachmentUrl: string | null = null;
      let attachmentType: string | null = null;
      let attachmentName: string | null = null;
      let messageType = "text";
      
      if (pendingFile) {
        if (pendingFileType?.startsWith('image/')) messageType = 'image';
        else if (pendingFileType?.startsWith('audio/')) messageType = 'audio';
        else if (pendingFileType?.startsWith('video/')) messageType = 'video';
        else messageType = 'file';
      } else if (pendingAudio) {
        messageType = 'audio';
      }
      
      const messageContent = inputMessage || (pendingAudio ? "Voice Note" : pendingFile ? pendingFile.name : "");

      const msgId = crypto.randomUUID();
      const optimisticMsg: Message = {
        id: msgId,
        report_id: reportId,
        sender_id: currentUser.id,
        content: messageContent,
        message_type: messageType as any,
        attachment_url: pendingFileUrl || pendingAudioUrl || undefined,
        attachment_name: pendingFile?.name,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, optimisticMsg]);
      setInputMessage("");
      
      const fileToUpload = pendingFile;
      const audioToUpload = pendingAudio;
      
      setPendingFile(null);
      setPendingFileUrl(null);
      setPendingFileType(null);
      setPendingAudio(null);
      setPendingAudioUrl(null);

      if (audioToUpload) {
        const fileName = \`chat/\${reportId}/\${Date.now()}_audio.webm\`;
        const { error } = await supabase.storage.from("chat-media").upload(fileName, audioToUpload);
        if (!error) {
          const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);
          attachmentUrl = data.publicUrl;
          attachmentType = "audio/webm";
          attachmentName = "Voice Note";
        }
      } else if (fileToUpload) {
        const fileName = \`chat/\${reportId}/\${Date.now()}_\${fileToUpload.name}\`;
        const { error } = await supabase.storage.from("chat-media").upload(fileName, fileToUpload);
        if (!error) {
          const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);
          attachmentUrl = data.publicUrl;
          attachmentType = fileToUpload.type;
          attachmentName = fileToUpload.name;
        }
      }

      if (attachmentUrl) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, attachment_url: attachmentUrl as string, attachment_type: attachmentType as string, attachment_name: attachmentName as string } : m));
      }

      await supabase.from("messages").insert({
        id: msgId,
        report_id: reportId,
        sender_id: currentUser.id,
        content: messageContent,
        message_type: messageType,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      });${callAIAgentPart}
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert("File terlalu besar (Max 50MB)");
    
    if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
    setPendingFile(file);
    setPendingFileUrl(URL.createObjectURL(file));
    setPendingFileType(file.type);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
        setPendingAudio(blob);
        setPendingAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("Gagal mengakses mikrofon");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  `;

  content = content.replace(handlersRegex, newHandlers);

  fs.writeFileSync(filePath, content, 'utf8');
}
