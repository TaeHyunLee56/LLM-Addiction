// ApiKeyModal.jsx

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 💡 애니메이션
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 450px;
  max-width: 90%;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid #f59e0b;
`;

const Title = styled.h3`
  color: #f59e0b;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  margin-bottom: 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #111827;
  box-sizing: border-box;
  font-family: monospace;
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #0ea5e9;
  color: #ffffff;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0c95d8;
  }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.9em;
  margin-bottom: 15px;
  text-align: center;
`;

/**
 * OpenAI API Key 입력을 위한 모달 컴포넌트
 */
const ApiKeyModal = ({ isVisible, onClose, onSubmit }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  if (!isVisible) return null;

  const handleSubmit = () => {
    // 간단한 유효성 검사
    if (!key.trim().startsWith('sk-') || key.trim().length < 20) { 
      setError('Please enter a valid OpenAI API Key (starts with "sk-").');
      return;
    }
    setError('');
    onSubmit(key.trim());
    setKey(''); 
  };

  return (
    <Backdrop onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Enter OpenAI API Key</Title>
        <p style={{ color: '#6b7280', fontSize: '0.9em' }}>
          Your Key is required for LLM analysis. It will not be stored permanently.
        </p>
        
        <Input 
          type="text" 
          placeholder="Enter your OPENAI_API_KEY here (e.g., sk-xxxx...)" 
          value={key} 
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error && <ErrorText>{error}</ErrorText>}
        
        <SubmitButton onClick={handleSubmit}>
          Start Analysis
        </SubmitButton>
      </ModalContent>
    </Backdrop>
  );
};

export default ApiKeyModal;