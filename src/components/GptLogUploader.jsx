// GptLogUploader.jsx - 최종 버전

import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ApiKeyModal from './ApiKeyModal'; 
import OpenAI from 'openai'; 

// Bookmarklet Code (유지)
const BOOKMARKLET_CODE = `javascript:(function(){try{const container=document.querySelector('main')||document.body;const text=container.innerText;const result={source:"ChatGPT Share Page",captured_at:(new Date).toISOString(),conversation:text.split("\\n").filter(Boolean)};const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="chat-data.json";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);}catch(err){alert("Conversation extraction failed! (DOM structure change or private link)");console.error(err);}})();`;

// --- Styled Components ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px; 
  padding: 72px;
  background-color: #f9fafb;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  min-height: 100vh;
`;

const Section = styled.div`
  width: 800px;
  max-width: 90%;
  background: #ffffff;
  padding: 30px; 
  border-radius: 12px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb; 
`;

const SectionTitle = styled.h2`
  color: #0ea5e9;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-size: 1.8em;
`;

const StepList = styled.ul`
  margin-top: 20px;
  list-style: none;
  padding-left: 0;
`;

const StepItem = styled.li`
  margin-bottom: 15px;
  font-size: 17px;
  line-height: 1.6;
  padding-left: 10px;
  border-left: 2px solid #0ea5e9;
  text-align: left;
`;

const StepSubTitle = styled.h3`
  color: #1f2937;
  margin-top: 5px;
  margin-bottom: 8px;
  font-size: 1.1em;
`;

const Key = styled.span`
  display: inline-block;
  background: #e5e7eb;
  color: #374151;
  padding: 2px 4px;
  border-radius: 6px;
  margin: 0 4px;
  font-family: monospace;
  font-weight: bold;
  border-bottom: 3px solid #d1d5db;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  vertical-align: middle;
  font-size: 12px;
`;

const CopyButton = styled.button`
  width: 100%;
  background-color: #0ea5e9;
  color: #ffffff;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease, transform 0.1s;
  
  &:hover {
    background-color: #0c95d8;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const HiddenCodeBlock = styled.div`
  display: none; 
`;

const FileInputWrapper = styled.label`
  display: block;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  
  text-align: center;
  padding: 25px 20px; 
  margin-top: 15px;
  border: 2px dashed #0ea5e9; 
  border-radius: 8px;
  background-color: #f3f4f6; 
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #0c95d8;
    background-color: #e5e7eb; 
  }
`;

const HiddenFileInput = styled.input.attrs({ type: 'file' })`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const AnalyzeButton = styled(CopyButton)`
  width: 300px; 
  background-color: #f59e0b;
  color: #ffffff;
  margin-top: 32px;
  
  &:hover {
    background-color: #d97706;
  }
  
  &:active {
    background-color: #b45309;
  }
  
  ${props => props.disabled && `
    background-color: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    &:hover {
        background-color: #d1d5db;
    }
  `}
`;

const StatusMessage = styled.p`
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  background-color: ${props => props.$isError ? '#fee2e2' : '#f3f4f6'};
  border: 1px solid ${props => props.$isError ? '#f87171' : '#e5e7eb'};
  color: ${props => props.$isError ? '#b91c1c' : '#374151'};
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 15px;
  width: 100%;
`;

const FileListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const FileName = styled.span`
  color: #16a34a;
  font-family: monospace;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 5px;
  
  &:hover {
    color: #dc2626;
  }
`;

const AnalysisPanel = styled(Section)`
  text-align: center;
  margin-top: 20px;
  background-color: #fefce8;
  border-color: #f59e0b;

  h3 {
    color: #f59e0b;
  }
`;

const AnalysisBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  flex-direction: column;
  color: #111827;
  text-align: center;
`;

const AnalysisModalContent = styled.div`
  background: #ffffff;
  padding: 40px 60px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 600px;
  max-width: 90%;
  border: 2px solid #f59e0b;
  animation: ${fadeIn} 0.5s ease-out;
`;

// ----------------------------------------------------------------

const GptLogUploader = React.forwardRef(({ onAnalysisComplete }, ref) => {
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [status, setStatus] = useState('Ready to upload files (Max 10).');
  const [isError, setIsError] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Code');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 

  const MAX_FILES = 10;

  // 1. 데이터 정제 로직 (유지)
  const processConversationData = (conversationLines) => {
      const USER_PREFIX = "나의 말:";
      const ASSISTANT_PREFIX = "ChatGPT의 말:";
      const IGNORE_LINES = ["ChatGPT", "로그인", "무료로 회원 가입", "ChatGPT와 익명 간의 대화의 사본입니다.", "대화 신고하기", "첨부", "검색", "학습하기", "음성", "SELECT", "EXPORT", "ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요. 쿠키 기본 설정을 참고하세요."];
      
      let turns = [];
      let currentTurn = { user: '', assistant: '' };
      let currentSpeaker = null;
      let turnCounter = 0;

      const normalizeText = (text) => text.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0 && !IGNORE_LINES.includes(line)).join('\n');

      for (let line of conversationLines) {
          if (line.startsWith(USER_PREFIX)) {
              if (currentSpeaker === ASSISTANT_PREFIX && currentTurn.assistant) {
                  turns.push({
                      turn: ++turnCounter,
                      user: normalizeText(currentTurn.user),
                      assistant: normalizeText(currentTurn.assistant),
                  });
                  currentTurn = { user: '', assistant: '' };
              }
              currentSpeaker = USER_PREFIX;
              currentTurn.user += line.substring(USER_PREFIX.length).trim() + '\n';
              
          } else if (line.startsWith(ASSISTANT_PREFIX)) {
              currentSpeaker = ASSISTANT_PREFIX;
              currentTurn.assistant += line.substring(ASSISTANT_PREFIX.length).trim() + '\n';
              
          } else if (currentSpeaker) {
              if (currentSpeaker === USER_PREFIX) {
                  currentTurn.user += line + '\n';
              } else if (currentSpeaker === ASSISTANT_PREFIX) {
                  currentTurn.assistant += line + '\n';
              }
          }
      }

      if (currentTurn.user || currentTurn.assistant) {
          turns.push({
              turn: ++turnCounter,
              user: normalizeText(currentTurn.user),
              assistant: normalizeText(currentTurn.assistant),
          });
      }
      return turns;
  };

  // 2. 개별 턴 분석 함수 (OpenAI API 사용, 유지)
  const analyzeTurnWithOpenAI = async (turn, history, apiKey) => {
    if (!apiKey) return { ...turn, hallucination_score: 0, issue_type: "api_key_missing", hallucination_reason: "API Key not provided.", purpose: "Error" };
    
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }); 

    const context = history.map(t => `User: ${t.user}\nAssistant: ${t.assistant}`).join('\n');
    
    const systemPrompt = `
        You are an expert conversation analyst. Your task is to analyze the following conversation context and provide a structured JSON analysis.
        
        Rules for JSON keys:
        1.  hallucination_score (1-5): Evaluate the accuracy and relevance of the FINAL ASSISTANT's response. 1=Perfect, 5=Severely inaccurate/irrelevant.
        2.  issue_type (string): - "factual_error": if incorrect, misleading, or fabricated.
            - "misalignment": if it does not directly address the LAST USER's intent.
            - "none": ONLY if hallucination_score is 1.
        3.  hallucination_reason (string): Short justification (≤15 words) for the score. Use "none" if hallucination_score is 1.
        4.  purpose (string): Categorize the intent of the LAST USER's message. Choose one: "Information Seeking", "Content Generation", "Language Refinement", "Meta-cognitive Engagement", "Conversational Repair".
        
        Provide ONLY a single JSON object.
    `;
    
    const userPrompt = `
        Analyze this context. Focus on the FINAL ASSISTANT's response and the LAST USER's intent.

        Conversation Context:
        ---
        ${context}
        ---
        
        Output JSON:
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', 
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" } 
      });

      const analysisText = response.choices[0].message.content.trim();
      const analysis = JSON.parse(analysisText);
      
      return {
        ...turn,
        hallucination_score: analysis.hallucination_score,
        issue_type: analysis.issue_type,
        hallucination_reason: analysis.hallucination_reason,
        purpose: analysis.purpose,
      };
    } catch (error) {
      console.error(`OpenAI analysis failed for turn ${turn.turn}:`, error);
      return { 
        ...turn, 
        hallucination_score: 0, 
        issue_type: "api_call_error", 
        hallucination_reason: `API failed: ${error.message.substring(0, 50)}`, 
        purpose: "Error" 
      };
    }
  };

  // 3. 세션별 Over-reliance Score 분석 함수 (수정된 로직 유지)
  const analyzeOverReliance = async (sessionText, apiKey) => {
    if (!apiKey) return { score: 0, advice: "API key missing for analysis." };
    
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const systemPrompt = "You are an expert in analyzing user dependency on AI models. Based on the provided single conversation session log, you must assign an 'over_reliance_score' from 1 (low dependency/expert use) to 5 (high dependency/beginner use, constantly asking for simple steps or full generation). Also provide sharp, direct advice in 15 words or less about what's problematic and why it shows over-reliance. Provide ONLY a single JSON object.";
    
    const userPrompt = `
        Analyze the user's dependency level in this single session.
        
        Conversation data for analysis:
        ---
        ${sessionText}
        ---
        
        Output JSON: {"over_reliance_score": <integer 1-5>, "advice": "<sharp advice in 15 words max>"}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content.trim());
      return {
        score: result.over_reliance_score || 0,
        advice: result.advice || "No specific advice available."
      };
    } catch (error) {
      console.error("OpenAI over-reliance analysis failed:", error);
      return { score: 0, advice: "Analysis failed due to API error." };
    }
  };


  // 4. 분석 시작 버튼 핸들러 (유지)
  const handleAnalyzeStart = () => {
      if (uploadedFiles.length === 0) {
          // alert 대신 custom modal을 사용해야 하지만, 여기서는 alert으로 대체
          alert("Error: Please upload at least one JSON file.");
          return;
      }
      
      setIsModalVisible(true);
  };
  
  // 5. 모달 제출 핸들러 (유지)
  const handleModalSubmit = async (apiKey) => {
      setIsModalVisible(false);
      await handleAnalyzeClick(apiKey);
  };

  // 6. 핵심 분석 실행 함수 (수정: 완료 시 onAnalysisComplete 호출)
  const handleAnalyzeClick = async (apiKey) => {
    setIsAnalyzing(true);
    setStatus('Starting LLM Analysis... This may take some time.');
    setIsError(false);
    setAnalyzedData(null);

    // 1. 데이터 정제 및 병합
    let allSessions = uploadedFiles.map(fileObj => {
        const refinedTurns = processConversationData(fileObj.data.conversation);
        return {
            fileName: fileObj.name,
            capturedAt: fileObj.data.captured_at,
            turnCount: refinedTurns.length,
            turns: refinedTurns
        };
    });

    const analyzedSessions = [];
    let totalTurnsProcessed = 0;
    let overallTotalTurns = allSessions.reduce((sum, s) => sum + s.turnCount, 0); 
    
    // 2. 세션별 분석 및 Over-reliance Score 계산
    for (let session of allSessions) {
        const analyzedTurns = [];
        const sessionHistory = [];

        // 개별 턴 분석
        for (const turn of session.turns) {
            setStatus(`Analyzing turn ${turn.turn} in file: ${session.fileName} (${totalTurnsProcessed + 1} / ${overallTotalTurns} total turns)`);
            const resultTurn = await analyzeTurnWithOpenAI(turn, sessionHistory, apiKey);
            analyzedTurns.push(resultTurn);
            sessionHistory.push({ user: turn.user, assistant: turn.assistant }); 
            totalTurnsProcessed++;
        }
        
        // 세션 텍스트 준비
        const sessionText = sessionHistory.map(t => `User: ${t.user}\nAssistant: ${t.assistant}`).join('\n---\n');

        // 세션별 Over-reliance Score 계산
        setStatus(`Calculating Over-reliance Score for file: ${session.fileName}...`);
        const overRelianceResult = await analyzeOverReliance(sessionText, apiKey);
        
        analyzedSessions.push({
            ...session,
            turns: analyzedTurns,
            over_reliance_score: overRelianceResult.score,
            over_reliance_advice: overRelianceResult.advice
        });
    }
    
    // 3. 최종 결과 생성
    const finalResult = {
        totalFiles: analyzedSessions.length,
        generatedDate: new Date().toLocaleDateString('ko-KR'),
        totalTurns: overallTotalTurns, 
        sessions: analyzedSessions
    };

    setIsAnalyzing(false);
    setAnalyzedData(finalResult);
    
    console.log("--- FINAL LLM ANALYZED DATA ---");
    console.log(JSON.stringify(finalResult, null, 2));
    console.log("-----------------------------");
    
    setStatus(`✅ Analysis Complete! Total ${analyzedSessions.length} files analyzed.`);
    // 💡 분석이 완료되면 App 컴포넌트에 데이터를 전달하여 화면 전환을 요청합니다.
    if (onAnalysisComplete) {
      onAnalysisComplete(finalResult);
    }
  };
  
  // 7. 기타 핸들러 (유지)
  const copyBookmarkletCode = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE).then(() => {
      setCopyStatus('Code Copied!');
      setTimeout(() => setCopyStatus('Copy Code'), 2000);
    }).catch(() => {
      setCopyStatus('❌ Copy Failed');
      setTimeout(() => setCopyStatus('Copy Code'), 2000);
    });
  };
  
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (selectedFiles.length === 0) return;

    if (uploadedFiles.length + selectedFiles.length > MAX_FILES) {
        alert(`⚠️ You can only upload a maximum of ${MAX_FILES} files.`);
        setStatus(`⚠️ You can only upload a maximum of ${MAX_FILES} files.`);
        setIsError(true);
        return;
    }

    setStatus(`Reading ${selectedFiles.length} file(s)...`);
    setIsError(false);

    const fileReaders = selectedFiles.map(file => {
        return new Promise((resolve, reject) => {
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                reject({ file: file.name, error: 'Not a JSON file' });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data && data.conversation && Array.isArray(data.conversation)) {
                        resolve({ name: file.name, data: data });
                    } else {
                        reject({ file: file.name, error: 'Invalid structure' });
                    }
                } catch (err) {
                    reject({ file: file.name, error: 'JSON parse error' });
                }
            };
            reader.onerror = () => reject({ file: file.name, error: 'Read error' });
            reader.readAsText(file);
        });
    });

    try {
        const results = await Promise.allSettled(fileReaders);
        const successfulUploads = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);
        
        const failedUploads = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason);

        const newFiles = successfulUploads.filter(newFile => 
            !uploadedFiles.some(existing => existing.name === newFile.name)
        );

        setUploadedFiles(prev => [...prev, ...newFiles]);
        
        event.target.value = '';

        if (failedUploads.length > 0) {
            setStatus(`Added ${newFiles.length} files. Failed: ${failedUploads.map(f => f.file).join(', ')}`);
            setIsError(true);
        } else if (newFiles.length === 0 && successfulUploads.length > 0) {
             setStatus(`No new files added (duplicates skipped). Total: ${uploadedFiles.length}`);
        } else {
            setStatus(`Successfully added ${newFiles.length} files. Total: ${uploadedFiles.length + newFiles.length} / ${MAX_FILES}`);
            setIsError(false);
        }

    } catch (err) {
        console.error(err);
        setStatus('An unexpected error occurred.');
        setIsError(true);
    }
  };

  const removeFile = (fileName) => {
      setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
      setStatus(`Removed '${fileName}'.`);
      setAnalyzedData(null); 
  };


  return (
    <Container ref={ref}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5em', color: '#111827' }}>
        ChatGPT Log Extraction & Analysis
      </h1>
      
      {/* Step 1: Extractor */}
      <Section>
        <SectionTitle>Step 1: Create the Conversation Extractor Bookmarklet</SectionTitle>
        <p style={{ marginBottom: '15px', color: '#4b5563' }}>
          Click the button below to copy the Bookmarklet code. This code will save the text from a ChatGPT Page into a JSON file.
        </p>
        <CopyButton onClick={copyBookmarkletCode}>{copyStatus}</CopyButton>
        <HiddenCodeBlock>{BOOKMARKLET_CODE}</HiddenCodeBlock>
        
        <StepList>
          <StepItem>
            <StepSubTitle>1. Open Bookmark Manager</StepSubTitle>
            <div style={{display: 'flex', flexDirection: 'row', gap: '40px'}}>
              <p>Mac: <Key>Option</Key> + <Key>Command</Key> + <Key>B</Key></p>
              <p>Windows/Linux: <Key>Ctrl</Key> + <Key>Shift</Key> + <Key>O</Key></p>
            </div>
          </StepItem>
          <StepItem>
            <StepSubTitle>2. Create a New Bookmark</StepSubTitle>
            <p><strong>Create a new bookmark</strong> in the manager window and name it 'GPT Extractor' or similar.</p>
          </StepItem>
          <StepItem>
            <StepSubTitle>3. Paste the Code</StepSubTitle>
            <p>Paste the code copied from the <strong>'Copy Code'</strong> button** into the <strong>'Address' (URL) field</strong> of the new bookmark using <Key>Ctrl</Key> + <Key>V</Key> and save it.</p>
          </StepItem>
          <StepItem>
            <StepSubTitle>4. Download the File</StepSubTitle>
            <p>Navigate to the ChatGPT Page you want to save, and <strong>click</strong> the bookmark you just created. The <strong>`chat-data.json`</strong> file will download automatically.</p>
          </StepItem>
        </StepList>
      </Section>
      
      {/* Step 2: Upload */}
      <Section>
        <SectionTitle>Step 2: Upload Downloaded Files (Max 10)</SectionTitle>
        <p>You can upload up to <Key>10</Key> JSON files. They will be merged and analyzed by OpenAI.</p>
        
        <FileInputWrapper htmlFor="file-upload">
          <p style={{ margin: '0 0 5px 0', fontSize: '1.1em', color: '#0ea5e9', fontWeight: 'bold', background: 'none' }}>
            Click to Browse Files
          </p>
          <p style={{ fontSize: '0.9em', margin: 0, background: 'none' }}>
            Select multiple <Key>.json</Key> files to upload.
          </p>
          
          <HiddenFileInput 
            id="file-upload" 
            accept=".json" 
            multiple 
            onChange={handleFileUpload} 
          />
        </FileInputWrapper>

        {uploadedFiles.length > 0 && (
            <FileList>
                {uploadedFiles.map(file => (
                    <FileListItem key={file.name}>
                        <FileName>📄 {file.name}</FileName>
                        <RemoveButton onClick={() => removeFile(file.name)} title="Remove file">
                            ✕
                        </RemoveButton>
                    </FileListItem>
                ))}
            </FileList>
        )}

        <StatusMessage $isError={isError}>{status}</StatusMessage>
      </Section>

      {/* Step 3: Analyze 버튼 */}
      <AnalyzeButton 
        onClick={handleAnalyzeStart} 
        disabled={uploadedFiles.length === 0 || isAnalyzing}
      >
        {isAnalyzing ? `Analyzing...` : `Analyze ${uploadedFiles.length > 0 ? `${uploadedFiles.length} Files` : 'Data'} with OpenAI`}
      </AnalyzeButton>

      {/* 분석 결과 표시 (App.jsx로 이동했으므로 이 부분은 주석 처리 또는 제거) */}
      {/* analyzedData && (
        <AnalysisPanel>
            <h3>✅ Analysis Results Ready!</h3>
            <p>The analysis is complete. Check your browser's **Developer Console** for the full **LLM-Enhanced JSON Output**.</p>
            <p style={{marginTop: '15px'}}>Total Files Analyzed: **{analyzedData.totalFiles}**</p>
            <p>Total Turns Analyzed: **{analyzedData.totalTurns}**</p>
        </AnalysisPanel>
      ) */}
      
      {/* API Key 모달 */}
      <ApiKeyModal 
          isVisible={isModalVisible} 
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleModalSubmit}
      />

      {/* 💡 분석 중 UI (전체 화면 모달) */}
      {isAnalyzing && (
          <AnalysisBackdrop>
              <AnalysisModalContent>
                  <h3>LLM Analysis in Progress...</h3>
                  <p style={{ color: '#f59e0b', fontSize: '1.2em', fontWeight: 'bold', margin: '20px 0' }}>
                      {status}
                  </p>
                  <p style={{ marginTop: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '15px', color: '#6b7280' }}>
                      The system is currently calling the OpenAI API to perform:
                  </p>
                  <StepList style={{ border: 'none', padding: '0 50px' }}>
                    <StepItem style={{ borderLeftColor: '#0ea5e9' }}>1. Hallucination Score (Turn-by-turn)</StepItem>
                    <StepItem style={{ borderLeftColor: '#0ea5e9' }}>2. Purpose Classification (Turn-by-turn)</StepItem>
                    <StepItem style={{ borderLeftColor: '#0ea5e9' }}>3. Over-reliance Score (Per Session)</StepItem>
                  </StepList>
              </AnalysisModalContent>
          </AnalysisBackdrop>
      )}
      
    </Container>
  );
});

export default GptLogUploader;