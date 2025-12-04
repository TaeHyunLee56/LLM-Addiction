// Dashboard.jsx - 분석 결과를 표시할 컴포넌트

import React, { useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell, ScatterChart, Scatter } from 'recharts';

const DashboardContainer = styled.div`
  width: 100vw;
  color: #111827;
  padding: 72px;
  background-color: #f9fafb;
`;

const Header = styled.div`
  border-bottom: 2px solid #f59e0b;
  padding-bottom: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: #f59e0b;
  font-size: 2.2em;
  margin: 0;
`;

const ResetButton = styled.button`
  background-color: #e5e7eb;
  color: #374151;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d1d5db;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const EmphasisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  border-left: 5px solid ${props => props.color || '#3b82f6'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const EmphasisCard = styled(StatCard)`
  padding: 32px;
  text-align: center;
    border-radius: 10px;
    border: none;
`;

const CardTitle = styled.p`
  color: ${props => props.color || '#3b82f6'};
  font-size: 1.1em;
  margin: 0 0 5px 0;
  font-weight: 500;
`;

const EmphasisCardTitle = styled(CardTitle)`
  font-size: 1.4em;
  margin-bottom: 15px;
`;

const CardValue = styled.h3`
  font-size: 2.5em;
  margin: 0;
  color: #111827;
`;

const EmphasisCardValue = styled(CardValue)`
  font-size: 3.8em;
  margin-bottom: 10px;
`;

const SessionContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;

`;

const ConversationPreview = styled.div`
  max-height: 200px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(transparent, #ffffff);
    pointer-events: none;
  }
`;

const SessionList = styled.div`
    flex: 1;
`;

const SessionDetail = styled.div`
    flex: 1;
    box-sizing: border-box;
  background: #ffffff;
  border-radius: 10px;
  border: 2px solid #f59e0b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-height: 400px;
`;

const ConversationDetail = styled.div`
  flex: 1;
  background: #ffffff;
  border-radius: 10px;
  border: 2px solid #16a34a;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-height: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const MoreButton = styled.button`
  background-color: #f59e0b;
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #d97706;
  }
`;

const BackButton = styled(MoreButton)`
`;
const ClickableStatCard = styled(StatCard)`

  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 5px solid ${props => props.selected ? '#f59e0b' : (props.color || '#3b82f6')};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CustomTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75em;
  white-space: nowrap;
  max-width: 250px;
  white-space: normal;
  text-align: center;
  z-index: 1000;
  margin-top: 5px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: #1f2937;
  }
  
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: opacity 0.2s, visibility 0.2s;
`;


/**
 * 분석 결과를 시각화하는 대시보드 컴포넌트
 * @param {object} data - GptLogUploader에서 전달받은 분석 JSON 데이터
 * @param {function} onReset - App 컴포넌트의 상태를 리셋하여 업로더 화면으로 돌아가는 콜백
 */
const Dashboard = ({ data, onReset }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showConversation, setShowConversation] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  
  if (!data) return <p style={{color: '#111827'}}>Loading analysis data...</p>;

  // Purpose 데이터 집계 함수
  const getPurposeData = (sessionIndex) => {
    if (sessionIndex === null) return [];
    
    const session = data.sessions[sessionIndex];
    const purposeCounts = {};
    
    // 각 turn의 purpose를 집계
    session.turns.forEach(turn => {
      const purpose = turn.purpose || 'Unknown';
      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
    });
    
    // 차트 데이터 형식으로 변환
    return Object.entries(purposeCounts).map(([purpose, count]) => ({
      name: purpose,
      value: count,
      percentage: ((count / session.turns.length) * 100).toFixed(1),
      fill: PURPOSE_COLORS[purpose] || PURPOSE_COLORS['Unknown']
    }));
  };

  // Issue Type 데이터 집계 함수
  const getIssueTypeData = (sessionIndex) => {
    if (sessionIndex === null) return [];
    
    const session = data.sessions[sessionIndex];
    const issueTypeCounts = {};
    
    // 각 turn의 issue_type을 집계
    session.turns.forEach(turn => {
      let issueType = turn.issue_type || 'unknown';
      
      // "none"인 경우 "No Issues"로 표시
      if (issueType === 'none') {
        issueType = 'No Issues';
      }
      
      issueTypeCounts[issueType] = (issueTypeCounts[issueType] || 0) + 1;
    });
    
    // 차트 데이터 형식으로 변환
    return Object.entries(issueTypeCounts).map(([issueType, count]) => ({
      name: issueType,
      value: count,
      percentage: ((count / session.turns.length) * 100).toFixed(1),
      fill: ISSUE_COLORS[issueType] || ISSUE_COLORS['unknown']
    }));
  };

  // 차트 색상 배열
  const PURPOSE_COLORS = {
    'Information Seeking': '#0ea5e9',
    'Content Generation': '#f59e0b', 
    'Language Refinement': '#16a34a',
    'Meta-cognitive Engagement': '#8b5cf6',
    'Conversational Repair': '#f97316',
    'Unknown': '#9ca3af'
  };
  
  const ISSUE_COLORS = {
    'No Issues': '#16a34a',
    'factual_error': '#ef4444',
    'misalignment': '#f59e0b',
    'api_call_error': '#6b7280',
    'api_key_missing': '#9ca3af',
    'unknown': '#d1d5db'
  };

  // 산점도 데이터 생성 함수
  const getScatterData = (sessionIndex) => {
    if (sessionIndex === null) return [];
    
    const session = data.sessions[sessionIndex];
    return session.turns.map((turn, index) => ({
      x: index + 1, // 턴 번호
      y: turn.hallucination_score || 0, // 할루시네이션 점수
      purpose: turn.purpose || 'Unknown',
      fill: PURPOSE_COLORS[turn.purpose] || PURPOSE_COLORS['Unknown'],
      turnNumber: turn.turn || index + 1,
      issueType: turn.issue_type || 'unknown'
    }));
  };

  // 메시지 축약/확장 토글 함수
  const toggleMessage = (messageId) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  // 텍스트 축약 함수
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 전체 Purpose 비율 계산 함수
  const getOverallPurposeDistribution = () => {
    const allPurposes = {};
    let totalTurns = 0;
    
    data.sessions.forEach(session => {
      session.turns.forEach(turn => {
        const purpose = turn.purpose || 'Unknown';
        allPurposes[purpose] = (allPurposes[purpose] || 0) + 1;
        totalTurns++;
      });
    });
    
    return Object.entries(allPurposes)
      .map(([purpose, count]) => ({
        purpose,
        count,
        percentage: ((count / totalTurns) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count); // 많은 순으로 정렬
  };

  // 데이터 요약 계산
  const totalTurns = data.totalTurns;
  const totalFiles = data.totalFiles;
  
  // 평균 턴 수 계산
  const avgTurns = (totalTurns / totalFiles).toFixed(1);
  
  // 모든 세션의 Over-reliance Score 평균 계산
  const avgOverReliance = (
    data.sessions.reduce((sum, s) => sum + s.over_reliance_score, 0) / data.totalFiles
  ).toFixed(1);

  // 모든 세션의 모든 턴의 Hallucination Score 평균 계산
  const avgHallucination = (() => {
    let totalHallucinationScore = 0;
    let totalTurnCount = 0;
    
    data.sessions.forEach(session => {
      session.turns.forEach(turn => {
        totalHallucinationScore += (turn.hallucination_score || 0);
        totalTurnCount++;
      });
    });
    
    return totalTurnCount > 0 ? (totalHallucinationScore / totalTurnCount).toFixed(1) : '0.0';
  })();

  return (
    <DashboardContainer>
      <Header>
        <Title>AI Interaction Analysis Report</Title>
        <ResetButton onClick={onReset}>Reset & Upload New Data</ResetButton>
      </Header>
      
      <p style={{ color: '#6b7280', marginBottom: '40px' }}>
        Analysis generated on: {data.generatedDate} Results are based on {totalFiles} uploaded sessions.
      </p>

      <StatGrid>
        <StatCard color="#3b82f6">
          <CardTitle color="#3b82f6">Total Sessions Analyzed</CardTitle>
          <CardValue>{totalFiles}</CardValue>
        </StatCard>
        
        <StatCard color="#16a34a">
          <CardTitle color="#16a34a">Total Conversation Turns</CardTitle>
          <CardValue>{totalTurns}</CardValue>
        </StatCard>
      </StatGrid>

      <h3 style={{ color: '#f59e0b', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
        Key Analysis Metrics
      </h3>

      <EmphasisGrid>
        <EmphasisCard color="#facc15">
          <EmphasisCardTitle color="#ca8a04">Average Hallucination Score</EmphasisCardTitle>
          <EmphasisCardValue>{avgHallucination} <span style={{fontSize: '0.5em'}}>/ 5</span></EmphasisCardValue>
          <p style={{ fontSize: '0.9em', color: '#6b7280' }}>
            (Higher score indicates more frequent hallucinations.)
          </p>
        </EmphasisCard>

        <EmphasisCard color="#f59e0b">
          <EmphasisCardTitle color="#b45309">Average Over-reliance Score</EmphasisCardTitle>
          <EmphasisCardValue>{avgOverReliance} <span style={{fontSize: '0.5em'}}>/ 5</span></EmphasisCardValue>
          <p style={{ fontSize: '0.9em', color: '#6b7280' }}>
            (Higher score indicates greater user dependency on the LLM.)
          </p>
        </EmphasisCard>

        <EmphasisCard color="#8b5cf6">
          <EmphasisCardTitle color="#7c3aed">Average Turns per Session</EmphasisCardTitle>
          <EmphasisCardValue>{avgTurns} <span style={{fontSize: '0.6em'}}>turns</span></EmphasisCardValue>
          <p style={{ fontSize: '0.9em', color: '#6b7280' }}>
            (Average conversation length across all sessions.)
          </p>
        </EmphasisCard>

        <EmphasisCard color="#16a34a">
          <EmphasisCardTitle color="#15803d">Most Common Purpose</EmphasisCardTitle>
          <EmphasisCardValue style={{ fontSize: '2.5em' }}>
            {getOverallPurposeDistribution()[0]?.purpose || 'N/A'}
          </EmphasisCardValue>
          <p style={{ fontSize: '0.9em', color: '#6b7280' }}>
            ({getOverallPurposeDistribution()[0]?.percentage || 0}% of all turns)
          </p>
        </EmphasisCard>
      </EmphasisGrid>
      
      <h3 style={{ color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
        Session Details
      </h3>
      
      <SessionContainer>
        {!showConversation && (
          <SessionList>
            {data.sessions.map((session, index) => (
              <ClickableStatCard 
                key={index} 
                color="#9ca3af" 
                selected={selectedSession === index}
                style={{ marginBottom: '15px' }}
                onClick={() => {
                  setSelectedSession(selectedSession === index ? null : index);
                  setShowConversation(false);
                }}
              >
                <CardTitle color="#6b7280">File: {session.fileName}</CardTitle>
                <p><strong>Over-reliance Score:</strong> {session.over_reliance_score} / 5</p>
                <p><strong>Turns:</strong> {session.turnCount}</p>
              </ClickableStatCard>
            ))}
          </SessionList>
        )}
        
        {selectedSession !== null && !showConversation && (
          <SessionDetail>
            <div style={{padding: '32px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ color: '#f59e0b', marginTop: 0, marginBottom: 0, fontSize: '1.3em' }}>
                    Session Analysis: {data.sessions[selectedSession].fileName}
                  </h4>
                  <MoreButton onClick={() => {
                    setShowConversation(true);
                    setExpandedMessages(new Set());
                  }}>
                    More →
                  </MoreButton>
                </div>
                
            <div style={{ marginBottom: '25px' }}>
              <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Overview</h5>
              <p><strong>Total Turns:</strong> {data.sessions[selectedSession].turnCount}</p>
            <p><strong>Average Hallucination Score:</strong> {
                (data.sessions[selectedSession].turns.reduce((sum, turn) => 
                  sum + (turn.hallucination_score || 0), 0) / data.sessions[selectedSession].turnCount
                ).toFixed(1)
              } / 5</p>
              <p><strong>Over-reliance Score:</strong> {data.sessions[selectedSession].over_reliance_score} / 5</p>
              {data.sessions[selectedSession].over_reliance_advice && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '12px',
                  margin: '10px 0',
                  fontSize: '0.95em'
                }}>
                  <strong>Advice:</strong> {data.sessions[selectedSession].over_reliance_advice}
                </div>
              )}

            </div>                {data.sessions[selectedSession].analysis && (
                <div style={{ marginBottom: '25px' }}>
                    <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Detailed Analysis</h5>
                    <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '15px', 
                    borderRadius: '8px',
                    fontSize: '0.95em',
                    lineHeight: '1.6'
                    }}>
                    {typeof data.sessions[selectedSession].analysis === 'object' ? 
                        JSON.stringify(data.sessions[selectedSession].analysis, null, 2) :
                        data.sessions[selectedSession].analysis
                    }
                    </div>
                </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* Purpose Distribution */}
                  <div>
                    <h5 style={{ color: '#1f2937', marginBottom: '15px' }}>Purpose Distribution</h5>
                    <div style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '20px', 
                      borderRadius: '8px',
                      minHeight: '300px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', width: '100%', gap: '20px', alignItems: 'flex-start' }}>
                        <ResponsiveContainer width="80%" height={250}>
                          <BarChart data={getPurposeData(selectedSession)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              height={40}
                              fontSize={11}
                            />
                            <YAxis fontSize={11} />
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value} turns (${((value / data.sessions[selectedSession].turnCount) * 100).toFixed(1)}%)`, 
                                'Turns'
                              ]}
                            />
                            <Bar dataKey="value">
                              {getPurposeData(selectedSession).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div style={{ width: '20%', paddingTop: '20px' }}>
                          <div style={{ fontSize: '0.9em', color: '#6b7280' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Legend</div>
                            {getPurposeData(selectedSession).map((entry, index) => (
                              <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: entry.fill,
                                  marginRight: '10px',
                                  borderRadius: '3px'
                                }}></div>
                                <span style={{ fontSize: '0.85em' }}>{entry.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '15px', 
                        fontSize: '0.9em', 
                        color: '#6b7280',
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '15px',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        <strong>Total Turns:</strong> {data.sessions[selectedSession].turnCount}
                      </div>
                    </div>
                  </div>

                  {/* Issue Type Distribution */}
                  <div>
                    <h5 style={{ color: '#1f2937', marginBottom: '15px' }}>Hallucination Issue Types</h5>
                    <div style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '20px', 
                      borderRadius: '8px',
                      minHeight: '300px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', width: '100%', gap: '20px', alignItems: 'flex-start' }}>
                        <ResponsiveContainer width="80%" height={250}>
                          <BarChart data={getIssueTypeData(selectedSession)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              height={40}
                              fontSize={11}
                            />
                            <YAxis fontSize={11} />
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value} turns (${((value / data.sessions[selectedSession].turnCount) * 100).toFixed(1)}%)`, 
                                'Turns'
                              ]}
                            />
                            <Bar dataKey="value">
                              {getIssueTypeData(selectedSession).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div style={{ width: '20%', paddingTop: '20px' }}>
                          <div style={{ fontSize: '0.9em', color: '#6b7280' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Legend</div>
                            {getIssueTypeData(selectedSession).map((entry, index) => (
                              <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: entry.fill,
                                  marginRight: '10px',
                                  borderRadius: '3px'
                                }}></div>
                                <span style={{ fontSize: '0.85em' }}>{entry.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '15px', 
                        fontSize: '0.9em', 
                        color: '#6b7280',
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '15px',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        <strong>Avg Hallucination Score:</strong> {
                          (data.sessions[selectedSession].turns.reduce((sum, turn) => 
                            sum + (turn.hallucination_score || 0), 0) / data.sessions[selectedSession].turnCount
                          ).toFixed(1)
                        } / 5
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turn-by-Turn Scatter Plot */}
                <div style={{ marginTop: '25px' }}>
                  <h5 style={{ color: '#1f2937', marginBottom: '15px' }}>Turn-by-Turn Analysis</h5>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Turn" 
                          domain={['dataMin', 'dataMax']}
                          tickFormatter={(value) => `Turn ${value}`}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Hallucination Score"
                          domain={[0, 5]}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div style={{
                                  backgroundColor: '#ffffff',
                                  padding: '10px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                  <p style={{ margin: 0, fontWeight: 'bold' }}>{`Turn ${data.turnNumber}`}</p>
                                  <p style={{ margin: 0, color: data.fill }}>{`Purpose: ${data.purpose}`}</p>
                                  <p style={{ margin: 0 }}>{`Hallucination Score: ${data.y} / 5`}</p>
                                  <p style={{ margin: 0, fontSize: '0.9em', color: '#6b7280' }}>{`Issue Type: ${data.issueType}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter data={getScatterData(selectedSession)}>
                          {getScatterData(selectedSession).map((entry, index) => (
                            <Cell key={`scatter-${index}`} fill={entry.fill} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div style={{ 
                      marginTop: '15px', 
                      fontSize: '0.9em', 
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '15px',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      <strong>X-axis:</strong> Turn Number | <strong>Y-axis:</strong> Hallucination Score | <strong>Color:</strong> Purpose Category
                    </div>
                  </div>
                </div>
            </div>

          </SessionDetail>
        )}
        
        {selectedSession !== null && showConversation && (
          <>
            <SessionDetail>
              <div style={{padding: '32px'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ color: '#f59e0b', marginTop: 0, marginBottom: 0, fontSize: '1.3em' }}>
                      Session Analysis: {data.sessions[selectedSession].fileName}
                    </h4>
                    <BackButton onClick={() => {
                      setShowConversation(false);
                      setExpandedMessages(new Set());
                    }}>
                      ← Back
                    </BackButton>
                  </div>
                  
              <div style={{ marginBottom: '25px' }}>
                <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Overview</h5>
                <p><strong>Total Turns:</strong> {data.sessions[selectedSession].turnCount}</p>
              <p><strong>Average Hallucination Score:</strong> {
                  (data.sessions[selectedSession].turns.reduce((sum, turn) => 
                    sum + (turn.hallucination_score || 0), 0) / data.sessions[selectedSession].turnCount
                  ).toFixed(1)
                } / 5</p>
                <p><strong>Over-reliance Score:</strong> {data.sessions[selectedSession].over_reliance_score} / 5</p>
                {data.sessions[selectedSession].over_reliance_advice && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    padding: '12px',
                    margin: '10px 0',
                    fontSize: '0.95em'
                  }}>
                    <strong>Advice:</strong> {data.sessions[selectedSession].over_reliance_advice}
                  </div>
                )}
              </div>
              </div>
            </SessionDetail>
            
            <ConversationDetail>
              <div style={{ padding: '32px' }}>
                <h4 style={{ color: '#16a34a', marginTop: 0, marginBottom: '20px', fontSize: '1.3em' }}>
                  Conversation: {data.sessions[selectedSession].fileName}
                </h4>
                
                <div style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
                  {data.sessions[selectedSession].turns.map((turn, index) => {
                    const userMessageId = `user-${selectedSession}-${index}`;
                    const assistantMessageId = `assistant-${selectedSession}-${index}`;
                    const isUserExpanded = expandedMessages.has(userMessageId);
                    const isAssistantExpanded = expandedMessages.has(assistantMessageId);
                    
                    return (
                      <div key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
                        <div style={{ marginBottom: '10px' }}>
                          <div 
                            style={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #dbeafe',
                              borderRadius: '6px',
                              padding: '12px',
                              marginBottom: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => toggleMessage(userMessageId)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ color: '#1e40af', fontSize: '0.9em' }}>👤 User (Turn {turn.turn || index + 1})</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  backgroundColor: PURPOSE_COLORS[turn.purpose] || '#9ca3af',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  fontSize: '0.7em',
                                  fontWeight: '500'
                                }}>
                                  {turn.purpose || 'Unknown'}
                                </span>
                                <span style={{ fontSize: '0.8em', color: '#6b7280' }}>
                                  {isUserExpanded ? '△' : '▽'}
                                </span>
                              </div>
                            </div>
                            <p style={{ 
                              margin: 0, 
                              lineHeight: '1.4', 
                              fontSize: '0.85em',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {isUserExpanded ? turn.user : truncateText(turn.user, 100)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <div 
                            style={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #dcfce7',
                              borderRadius: '6px',
                              padding: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => toggleMessage(assistantMessageId)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <TooltipContainer
                                onMouseEnter={() => {
                                  if (turn.hallucination_reason && turn.hallucination_score > 0) {
                                    setExpandedMessages(prev => new Set(prev).add(`tooltip-${selectedSession}-${index}`));
                                  }
                                }}
                                onMouseLeave={() => {
                                  setExpandedMessages(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(`tooltip-${selectedSession}-${index}`);
                                    return newSet;
                                  });
                                }}
                              >
                                <strong style={{ 
                                  color: '#16a34a', 
                                  fontSize: '0.9em',
                                  cursor: turn.hallucination_reason && turn.hallucination_score > 0 ? 'help' : 'default'
                                }}>
                                  🤖 Assistant
                                </strong>
                                {turn.hallucination_reason && turn.hallucination_score > 0 && (
                                  <CustomTooltip show={expandedMessages.has(`tooltip-${selectedSession}-${index}`)}>
                                    <strong>Hallucination Reason:</strong><br />
                                    {turn.hallucination_reason}
                                  </CustomTooltip>
                                )}
                              </TooltipContainer>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ 
                                  backgroundColor: turn.hallucination_score >= 3 ? '#ef4444' : turn.hallucination_score >= 2 ? '#f59e0b' : '#16a34a',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  fontSize: '0.7em',
                                  fontWeight: '500'
                                }}>
                                  hallucination {turn.hallucination_score || 0}/5
                                </span>
                                {turn.issue_type !== 'none' && turn.issue_type !== 'unknown' && (
                                  <span style={{ 
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '0.7em',
                                    fontWeight: '500'
                                  }}>
                                    {turn.issue_type}
                                  </span>
                                )}
                                <span style={{ fontSize: '0.8em', color: '#6b7280' }}>
                                  {isAssistantExpanded ? '△' : '▽'}
                                </span>
                              </div>
                            </div>
                            <p style={{ 
                              margin: 0, 
                              lineHeight: '1.4', 
                              fontSize: '0.85em',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {isAssistantExpanded ? turn.assistant : truncateText(turn.assistant, 150)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ConversationDetail>
          </>
        )}
      </SessionContainer>

    </DashboardContainer>
  );
};

export default Dashboard;