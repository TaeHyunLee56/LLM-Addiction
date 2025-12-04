import { useState, useRef } from 'react'
import styled from "styled-components";

import GptLogUploader from './components/GptLogUploader.jsx';
import Dashboard from './components/Dashboard.jsx';

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const IntroContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #222;
  position: relative;
`;

const Title = styled.h1`
  font-size: 80px;
  font-weight: 900;
  color:rgb(236, 62, 62);
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.16);
  padding-bottom: 12px;
  border-bottom: 2px solid #fff;
  margin-bottom: 60px;
  text-align: center;
  animation: colorShift 4s ease-in-out infinite;
  letter-spacing: -2px;
  
  @keyframes colorShift {
    0% { color: rgb(236, 62, 62); }
    20% { color: #ffffff; }
    80% { color: #ffffff; }
    100% { color: rgb(236, 62, 62); }
  }
`;
const SubTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #9ca3af;
  opacity: 0.8;
  padding-bottom: 12px;
  margin-bottom: 24px;
  text-align: center;
`;
const ScrollBtn = styled.p`
  display: inline-block;
  font-size: 16px;
  font-weight: 400;
  color: #999;
  border-bottom: 1px solid #999;
  position: absolute;
  bottom: 40px;
  cursor: pointer;
`;




function App() {
  const inputRef = useRef(null);
  // 💡 분석 결과를 저장할 상태 (null이면 업로더, 데이터가 있으면 대시보드 표시)
  const [analyzedData, setAnalyzedData] = useState(null); 

  const handleScroll = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 💡 GptLogUploader가 분석을 완료했을 때 호출할 콜백 함수
  const handleAnalysisComplete = (data) => {
    setAnalyzedData(data);
  };

  return (
    <>
    {analyzedData ? (
        <Dashboard data={analyzedData} onReset={() => setAnalyzedData(null)} />
    ):(
      <Container>
        <IntroContainer>
          <Title>Are you addicted to LLMs?</Title>
          <SubTitle>Curious how trustworthy your LLM really is? <br></br> Quantify its hallucination rate and reveal critical user over-reliance.</SubTitle>
          <ScrollBtn onClick={handleScroll}>more</ScrollBtn>
        </IntroContainer>
        <GptLogUploader 
          ref={inputRef} 
          onAnalysisComplete={handleAnalysisComplete} 
        />
      </Container>
    )}
    </>
  )
}

export default App