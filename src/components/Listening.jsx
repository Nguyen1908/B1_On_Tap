import React, { useState } from 'react';
import listeningData from '../data/listening.json';

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function Listening() {
  const [step, setStep] = useState('setup'); 
  
  // Các tùy chọn thiết lập
  const [isRandomTasks, setIsRandomTasks] = useState(false);
  const [isRandomOptions, setIsRandomOptions] = useState(false);
  
  // Tùy chọn chủ đề (4 loại bài)
  const [selectedTypes, setSelectedTypes] = useState({
    cloze_text_truefalse: true,
    cloze_text: true,
    question: true,
    truefalse: true
  });

  const [formattedData, setFormattedData] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [highestReachedTask, setHighestReachedTask] = useState(0);

  // userProgress lưu đáp án trắc nghiệm (nhấn nút)
  const [userProgress, setUserProgress] = useState({});
  
  // typingProgress lưu đáp án gõ chữ cho dạng cloze_text
  // Cấu trúc: { taskId: { blankId: "text gõ" } }
  const [typingProgress, setTypingProgress] = useState({});
  // Trạng thái đã bấm kiểm tra bài cloze_text chưa: { taskId: true/false }
  const [submittedTasks, setSubmittedTasks] = useState({});

  const handleStartQuiz = () => {
    // 1. Lọc theo dạng bài được tick chọn
    const activeTypes = Object.keys(selectedTypes).filter(k => selectedTypes[k]);
    let filtered = listeningData.filter(d => activeTypes.includes(d.type.toLowerCase()));

    if (filtered.length === 0) {
      alert("Vui lòng chọn ít nhất một dạng bài để bắt đầu!");
      return;
    }

    // 2. Format dữ liệu và xáo trộn đáp án trắc nghiệm
    let formatted = filtered.map(task => {
      let processedTask = { ...task };
      
      // Xử lý mảng questions chung (nếu có)
      if (processedTask.questions) {
        processedTask.questions = processedTask.questions.map(q => {
          let opsArray = Object.keys(q.options).map(key => ({ key, text: q.options[key] }));
          if (isRandomOptions) opsArray = shuffleArray(opsArray);
          return { ...q, global_id: `task_${task.id}_q_${q.id}`, optionsArray: opsArray };
        });
      }

      // Xử lý riêng phần truefalse của loại bài trộn (nếu có)
      if (processedTask.truefalse) {
        processedTask.truefalse = processedTask.truefalse.map(tf => {
          return { ...tf, global_id: `task_${task.id}_tf_${tf.id}` };
        });
      }

      return processedTask;
    });

    // 3. Xáo trộn thứ tự các Bài nghe (Tasks)
    if (isRandomTasks) {
      formatted = shuffleArray(formatted);
    }

    setFormattedData(formatted);
    setCurrentTaskIndex(0);
    setHighestReachedTask(0);
    setUserProgress({});
    setTypingProgress({});
    setSubmittedTasks({});
    setStep('quiz');
  };

  const handleTypeSelection = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // --- XỬ LÝ NÚT BẤM (TRẮC NGHIỆM & TRUE/FALSE) ---
  const handleSelectOption = (globalId, selectedKey, correctKey) => {
    const currentProg = userProgress[globalId] || { selectedWrong: [], isSolved: false };
    if (currentProg.isSolved) return;

    const isCorrect = (selectedKey.toLowerCase() === correctKey.toLowerCase());
    let firstAttempt = currentProg.firstAttemptResult;
    if (!firstAttempt) firstAttempt = isCorrect ? 'correct' : 'wrong';

    if (isCorrect) {
      setUserProgress({
        ...userProgress,
        [globalId]: { isSolved: true, firstAttemptResult: firstAttempt }
      });
    } else {
      setUserProgress({
        ...userProgress,
        [globalId]: {
          ...currentProg,
          selectedWrong: [...(currentProg.selectedWrong || []), selectedKey],
          firstAttemptResult: firstAttempt
        }
      });
    }
  };

  // --- XỬ LÝ GÕ CHỮ (CLOZE TEXT) ---
  const handleTypingChange = (taskId, blankId, text) => {
    if (submittedTasks[taskId]) return; // Đã chấm điểm thì khóa ô nhập
    setTypingProgress(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [blankId]: text
      }
    }));
  };

  const handleCheckTypingTask = (taskId, answersArray) => {
    // Cập nhật trạng thái đã nộp
    setSubmittedTasks(prev => ({ ...prev, [taskId]: true }));
    
    // Đánh giá từng ô
    const taskTyping = typingProgress[taskId] || {};
    let newProgress = { ...userProgress };
    
    answersArray.forEach(ans => {
      const globalId = `task_${taskId}_blank_${ans.id}`;
      const userText = (taskTyping[ans.id] || "").trim().toLowerCase();
      const correctText = ans.text.trim().toLowerCase();
      const isCorrect = userText === correctText;
      
      newProgress[globalId] = {
        isSolved: true,
        firstAttemptResult: isCorrect ? 'correct' : 'wrong',
        userText: taskTyping[ans.id] || "",
        correctText: ans.text
      };
    });
    
    setUserProgress(newProgress);
  };

  // --- ĐIỀU HƯỚNG ---
  const handleNextTask = () => {
    if (currentTaskIndex < formattedData.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      setHighestReachedTask(prev => Math.max(prev, nextIndex));
    } else {
      setStep('setup'); // thay vì setStep('result')
    }
  };

  const calculateScore = () => {
    let correctFirstTry = 0;
    Object.values(userProgress).forEach(prog => {
      if (prog.firstAttemptResult === 'correct') correctFirstTry++;
    });
    return correctFirstTry;
  };

  // --- RENDER MÀN HÌNH SETUP ---
  if (step === 'setup') {
    return (
      <div className="fade-in" style={{ padding: '40px 20px', maxWidth: '600px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>🎧 Thiết lập bài thi Listening</h2>
        
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#475569', marginBottom: '10px' }}>1. Chọn dạng bài muốn làm:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {Object.keys(selectedTypes).map(typeKey => (
              <label key={typeKey} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" checked={selectedTypes[typeKey]} onChange={() => handleTypeSelection(typeKey)} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontWeight: '600', color: '#334155' }}>
                  {typeKey === 'cloze_text_truefalse' && 'Cloze Text + T/F'}
                  {typeKey === 'cloze_text' && 'Điền từ (Cloze)'}
                  {typeKey === 'question' && 'Trắc nghiệm (MCQ)'}
                  {typeKey === 'truefalse' && 'Đúng/Sai (T/F)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#475569', marginBottom: '10px' }}>2. Cấu hình trộn đề:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
              <input type="checkbox" checked={isRandomTasks} onChange={e => setIsRandomTasks(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Đảo ngẫu nhiên thứ tự các Bài nghe (Tasks)
            </label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
              <input type="checkbox" checked={isRandomOptions} onChange={e => setIsRandomOptions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Đảo ngẫu nhiên đáp án trắc nghiệm (A, B, C)
            </label>
          </div>
        </div>

        <button className="btn-primary" onClick={handleStartQuiz} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
          🚀 Bắt đầu làm bài
        </button>

        <style>{`
          body { background-color: #f1f5f9; font-family: 'Segoe UI', sans-serif; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .btn-primary { background-color: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
          .btn-primary:hover:not(:disabled) { background-color: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .btn-primary:disabled { background-color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
          .option-btn { transition: all 0.2s ease; border-radius: 8px; font-size: 15px; }
          .option-btn:hover:not(:disabled) { transform: translateX(5px); background-color: #e2e8f0; }
          .nav-btn { transition: all 0.2s ease; background-color: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; }
          .nav-btn:hover:not(:disabled) { background-color: #e2e8f0; color: #0f172a; }
          .nav-btn.primary { background-color: #4f46e5; color: white; border: none; }
          .nav-btn.primary:hover:not(:disabled) { background-color: #4338ca; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
          .writing-input { border: 2px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 16px; outline: none; width: 100%; transition: all 0.2s; font-weight: bold; }
          .writing-input:focus { border-color: #4f46e5; }
          .writing-input:disabled { background-color: #f1f5f9; color: #475569; }
        `}</style>
      </div>
    );
  }

  // --- RENDER MÀN HÌNH KẾT QUẢ ---
  if (step === 'result') {
    setStep('setup');
    return null;
  }

  // --- RENDER MÀN HÌNH QUIZ CHÍNH ---
  const currentTask = formattedData[currentTaskIndex];
  const type = currentTask.type.toLowerCase();
  
  // Xác định Task này đã hoàn thành toàn bộ chưa để mở khóa nút Next
  // Nếu là trắc nghiệm -> Check xem có câu nào chưa isSolved không
  // Nếu là gõ chữ -> Check xem submittedTasks có true không
  let isTaskFullyCompleted = false;
  if (type === 'cloze_text') {
    isTaskFullyCompleted = submittedTasks[currentTask.id] || false;
  } else {
    // Trắc nghiệm tổng hợp
    let allIds = [];
    if (currentTask.questions) currentTask.questions.forEach(q => allIds.push(q.global_id));
    if (currentTask.truefalse) currentTask.truefalse.forEach(tf => allIds.push(tf.global_id));
    
    if (allIds.length > 0) {
      isTaskFullyCompleted = allIds.every(id => userProgress[id] && userProgress[id].isSolved);
    } else {
      isTaskFullyCompleted = true; // Phòng hờ lỗi dữ liệu rỗng
    }
  }

  // Helper render câu hỏi trắc nghiệm chung (cho MCQ và Cloze MCQ)
  const renderMCQOptions = (q, showLabel = true) => {
    const qProg = userProgress[q.global_id] || {};
    return (
      <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '15px' }}>
          {q.id}. {q.question || `Khoảng trống số (${q.id})`}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {q.optionsArray.map((opt, idx) => {
            let bgColor = '#f8fafc'; let textColor = '#334155'; let borderStyle = '1px solid #e2e8f0';
            if (qProg.isSolved && opt.key === q.correct_answer) {
              bgColor = '#10b981'; textColor = '#fff'; borderStyle = '1px solid #059669';
            } else if ((qProg.selectedWrong || []).includes(opt.key)) {
              bgColor = '#ef4444'; textColor = '#fff'; borderStyle = '1px solid #dc2626';
            }
            const displayLabel = showLabel ? String.fromCharCode(65 + idx) : opt.key;

            return (
              <button
                key={opt.key} className="option-btn"
                disabled={qProg.isSolved}
                onClick={() => handleSelectOption(q.global_id, opt.key, q.correct_answer)}
                style={{ padding: '12px', textAlign: 'left', backgroundColor: bgColor, color: textColor, border: borderStyle, cursor: qProg.isSolved ? 'default' : 'pointer' }}
              >
                <strong style={{ display: 'inline-block', width: '25px' }}>{displayLabel}.</strong> {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      
      {/* HEADER ĐIỀU HƯỚNG LISTENING */}
      <div style={{ backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Bài nghe: {currentTaskIndex + 1} / {formattedData.length}</h3>
          <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {type.replace(/_/g, ' ')}
          </span>
        </div>
        
        {/* Nút thanh điều hướng */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="nav-btn"
            onClick={() => setCurrentTaskIndex(prev => prev - 1)} 
            disabled={currentTaskIndex === 0}
            style={{ padding: '8px 15px', cursor: currentTaskIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentTaskIndex === 0 ? 0.5 : 1 }}
          >
            ← Bài trước
          </button>
          <button 
            className={`nav-btn ${isTaskFullyCompleted ? 'primary' : ''}`}
            onClick={handleNextTask} 
            disabled={!isTaskFullyCompleted}
            style={{ padding: '8px 15px', cursor: !isTaskFullyCompleted ? 'not-allowed' : 'pointer', opacity: !isTaskFullyCompleted ? 0.5 : 1 }}
          >
            {currentTaskIndex === formattedData.length - 1 ? 'Kết thúc 🎉' : 'Bài tiếp theo →'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        
        {/* CỘT TRÁI: PLAYER ÂM THANH & ĐOẠN VĂN MẪU */}
        <div className="custom-scrollbar" style={{ flex: '1.2', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '75vh', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#475569' }}>🎧 Trình phát Audio</h4>
            {currentTask.audio ? (
              <audio controls src={currentTask.audio} style={{ width: '100%', outline: 'none' }}>
                Trình duyệt của bạn không hỗ trợ thẻ audio.
              </audio>
            ) : (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Bài này không có file âm thanh đính kèm.</p>
            )}
          </div>

          {/* Hiển thị đoạn văn nếu có */}
          {currentTask.passage_text && (
            <div>
              <h4 style={{ color: '#0f172a', marginBottom: '15px' }}>Đoạn văn tham khảo:</h4>
              <div style={{ color: '#334155', fontSize: '17px', lineHeight: '2.0', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                {currentTask.passage_text}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: KHU VỰC CÂU HỎI */}
        <div className="custom-scrollbar" style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '75vh', overflowY: 'auto' }}>
          
          {/* LOẠI 1: QUESTION (3 đáp án) */}
          {type === 'question' && currentTask.questions && (
            <div>
              <h4 style={{ marginBottom: '20px', color: '#4f46e5' }}>Chọn đáp án đúng (A, B, C):</h4>
              {currentTask.questions.map(q => renderMCQOptions(q, true))}
            </div>
          )}

          {/* LOẠI 2: TRUE/FALSE (2 đáp án) */}
          {type === 'truefalse' && currentTask.questions && (
            <div>
              <h4 style={{ marginBottom: '20px', color: '#4f46e5' }}>Chọn True (Đúng) hoặc False (Sai):</h4>
              {currentTask.questions.map(q => renderMCQOptions(q, false))}
            </div>
          )}

          {/* LOẠI 3: CLOZE TEXT (Gõ chữ điền vào chỗ trống) */}
          {type === 'cloze_text' && currentTask.answers && (
            <div>
              <h4 style={{ marginBottom: '20px', color: '#4f46e5' }}>Điền từ nghe được vào chỗ trống:</h4>
              
              {currentTask.answers.map((ans, idx) => {
                const globalId = `task_${currentTask.id}_blank_${ans.id}`;
                const qProg = userProgress[globalId];
                const typedVal = (typingProgress[currentTask.id] || {})[ans.id] || "";
                
                let borderColor = '#cbd5e1';
                if (qProg) {
                  borderColor = qProg.firstAttemptResult === 'correct' ? '#10b981' : '#ef4444';
                }

                return (
                  <div key={ans.id} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                      Chỗ trống ({ans.id}):
                    </label>
                    <input 
                      type="text" 
                      className="writing-input"
                      value={typedVal}
                      onChange={(e) => handleTypingChange(currentTask.id, ans.id, e.target.value)}
                      disabled={submittedTasks[currentTask.id]}
                      placeholder="Gõ đáp án..."
                      style={{fontSize: '20px', color: '#000000',borderColor: borderColor, backgroundColor: submittedTasks[currentTask.id] ? '#ffffff' : '#fcfcfc' }}
                    />
                    
                    {/* Hiển thị đáp án đúng nếu gõ sai */}
                    {qProg && qProg.firstAttemptResult === 'wrong' && (
                      <p style={{ margin: '8px 0 0 0', color: '#dc2626', fontSize: '14px' }}>
                        ❌ Đáp án đúng: <strong style={{ color: '#0f172a' }}>{qProg.correctText}</strong>
                      </p>
                    )}
                    {qProg && qProg.firstAttemptResult === 'correct' && (
                      <p style={{ margin: '8px 0 0 0', color: '#059669', fontSize: '14px', fontWeight: 'bold' }}>✅ Chính xác</p>
                    )}
                  </div>
                );
              })}

              {!submittedTasks[currentTask.id] && (
                <button 
                  className="btn-primary" 
                  // Khóa nút nếu chưa điền đủ tất cả chỗ trống
                  disabled={Object.keys(typingProgress[currentTask.id] || {}).length < currentTask.answers.length || Object.values(typingProgress[currentTask.id]).some(val => val.trim() === "")}
                  onClick={() => handleCheckTypingTask(currentTask.id, currentTask.answers)}
                  style={{ width: '100%', padding: '12px', marginTop: '15px', fontWeight: 'bold' }}
                >
                  Kiểm tra toàn bộ đáp án điền từ
                </button>
              )}
            </div>
          )}

          {/* LOẠI 4: CLOZE TEXT + TRUE/FALSE (Hỗn hợp) */}
          {type === 'cloze_text_truefalse' && (
            <div>
              {currentTask.truefalse && currentTask.truefalse.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <h4 style={{ marginBottom: '20px', color: '#4f46e5', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>PHẦN 1: True / False</h4>
                  {currentTask.truefalse.map(tf => {
                    const qProg = userProgress[tf.global_id] || {};
                    return (
                      <div key={tf.id} style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>{tf.id}. {tf.question}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {['True', 'False'].map(opt => {
                            let bgColor = '#f8fafc'; let textColor = '#334155'; let borderStyle = '1px solid #cbd5e1';
                            if (qProg.isSolved && opt === tf.answer) {
                              bgColor = '#10b981'; textColor = '#fff'; borderStyle = '1px solid #059669';
                            } else if ((qProg.selectedWrong || []).includes(opt)) {
                              bgColor = '#ef4444'; textColor = '#fff'; borderStyle = '1px solid #dc2626';
                            }
                            return (
                              <button key={opt} className="option-btn" disabled={qProg.isSolved} onClick={() => handleSelectOption(tf.global_id, opt, tf.answer)} style={{ flex: '1', padding: '10px', backgroundColor: bgColor, color: textColor, border: borderStyle, fontWeight: 'bold' }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentTask.questions && currentTask.questions.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '20px', color: '#4f46e5', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>PHẦN 2: Điền vào chỗ trống</h4>
                  {currentTask.questions.map(q => renderMCQOptions(q, true))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}