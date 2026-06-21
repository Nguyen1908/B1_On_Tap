import React, { useState } from 'react';
import readingData from '../data/reading_comprehension.json';

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function Reading() {
  const [step, setStep] = useState('setup'); 
  
  const [isRandomQuestions, setIsRandomQuestions] = useState(false);
  const [isRandomOptions, setIsRandomOptions] = useState(false);
  
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [highestReachedPassage, setHighestReachedPassage] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [highestReachedQuestion, setHighestReachedQuestion] = useState(0);

  const [userProgress, setUserProgress] = useState({});
  const [formattedData, setFormattedData] = useState([]);

  const handleStartQuiz = () => {
    if (!readingData || readingData.length === 0) {
      alert("Không có dữ liệu bài đọc!");
      return;
    }

    let formatted = readingData.map(passage => {
      let formattedQuestions = passage.questions.map(q => {
        let opsArray = Object.keys(q.options).map(key => ({
          key: key,      // Key gốc (A, B, C, D) dùng để so sánh kết quả
          text: q.options[key]
        }));
        
        if (isRandomOptions) opsArray = shuffleArray(opsArray);

        return { 
          ...q, 
          global_id: `passage_${passage.passage_id}_q_${q.id}`, 
          optionsArray: opsArray 
        };
      });

      if (isRandomQuestions) {
        formattedQuestions = shuffleArray(formattedQuestions);
      }

      return { ...passage, questions: formattedQuestions };
    });

    setFormattedData(formatted);
    setCurrentPassageIndex(0);
    setCurrentQuestionIndex(0);
    setHighestReachedPassage(0);
    setHighestReachedQuestion(0);
    setUserProgress({});
    setStep('quiz');
  };

  const handleSelectOption = (globalQuestionId, selectedKey, correctKey) => {
    const currentProgress = userProgress[globalQuestionId] || { selectedWrong: [], isSolved: false };
    if (currentProgress.isSolved) return;

    let firstAttempt = currentProgress.firstAttemptResult;
    if (!firstAttempt) {
      firstAttempt = (selectedKey === correctKey) ? 'correct' : 'wrong';
    }

    if (selectedKey === correctKey) {
      setUserProgress({
        ...userProgress,
        [globalQuestionId]: { ...currentProgress, isSolved: true, firstAttemptResult: firstAttempt }
      });
    } else {
      setUserProgress({
        ...userProgress,
        [globalQuestionId]: {
          ...currentProgress,
          selectedWrong: [...currentProgress.selectedWrong, selectedKey],
          firstAttemptResult: firstAttempt
        }
      });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handlePrevPassage = () => {
    if (currentPassageIndex > 0) {
      setCurrentPassageIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleNextAction = () => {
    const currentPassage = formattedData[currentPassageIndex];
    
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      const nextQIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQIndex);
      if (currentPassageIndex === highestReachedPassage) {
        setHighestReachedQuestion(prev => Math.max(prev, nextQIndex));
      }
    } else {
      if (currentPassageIndex < formattedData.length - 1) {
        const nextPIndex = currentPassageIndex + 1;
        setCurrentPassageIndex(nextPIndex);
        setCurrentQuestionIndex(0);
        
        if (nextPIndex > highestReachedPassage) {
          setHighestReachedPassage(nextPIndex);
          setHighestReachedQuestion(0);
        }
      } else {
        setStep('result');
      }
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
      <div className="fade-in" style={{ padding: '40px 20px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>📖 Bài thi Reading Comprehension</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
          Bài thi gồm <strong>{readingData.length}</strong> bài đọc. Gồm bài 3, 10, 12, 14.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
            <input type="checkbox" checked={isRandomQuestions} onChange={e => setIsRandomQuestions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đảo câu hỏi (Bên trong 1 bài đọc)
          </label>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
            <input type="checkbox" checked={isRandomOptions} onChange={e => setIsRandomOptions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đảo đáp án ngẫu nhiên
          </label>
        </div>

        <button className="btn-primary" onClick={handleStartQuiz} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
          🚀 Bắt đầu làm bài
        </button>
        
        <style>{`
          body { background-color: #f1f5f9; font-family: 'Segoe UI', sans-serif; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .btn-primary { background-color: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
          .btn-primary:hover { background-color: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .option-btn { transition: all 0.2s ease; border-radius: 8px; }
          .option-btn:hover:not(:disabled) { transform: translateX(5px); background-color: #e2e8f0; }
          .nav-btn { transition: all 0.2s ease; background-color: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; }
          .nav-btn:hover:not(:disabled) { background-color: #e2e8f0; color: #0f172a; }
          .nav-btn.primary { background-color: #4f46e5; color: white; border: none; }
          .nav-btn.primary:hover:not(:disabled) { background-color: #4338ca; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
      </div>
    );
  }

  // --- RENDER MÀN HÌNH KẾT QUẢ ---
  if (step === 'result') {
    const score = calculateScore();
    let totalQuestions = 0;
    formattedData.forEach(p => totalQuestions += p.questions.length);
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="fade-in" style={{ padding: '40px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0' }}>{percentage >= 80 ? '🎉' : '👏'}</h1>
        <h2 style={{ color: '#1e293b', marginTop: '10px' }}>Hoàn thành phần Reading!</h2>
        <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 10px 0' }}>Kết quả chọn đúng lần đầu:</p>
          <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#4f46e5', margin: '0' }}>{score} / {totalQuestions}</p>
        </div>
        <button className="btn-primary" onClick={() => setStep('setup')} style={{ padding: '12px 30px', fontSize: '16px', fontWeight: 'bold' }}>
          Làm bài khác
        </button>
      </div>
    );
  }

  // --- RENDER MÀN HÌNH QUIZ ---
  const currentPassage = formattedData[currentPassageIndex];
  const currentQ = currentPassage.questions[currentQuestionIndex];
  const qProgress = userProgress[currentQ.global_id] || { selectedWrong: [], isSolved: false };
  
  const isLastQuestionInPassage = currentQuestionIndex === currentPassage.questions.length - 1;
  const isLastPassage = currentPassageIndex === formattedData.length - 1;
  
  let nextButtonText = "Câu tiếp theo →";
  if (isLastQuestionInPassage && !isLastPassage) nextButtonText = "Bài đọc tiếp theo ⏭️";
  if (isLastQuestionInPassage && isLastPassage) nextButtonText = "Hoàn thành bài thi 🎉";

  return (
    <div className="fade-in" style={{ maxWidth: '1500px', margin: '10px auto', padding: '0 10px' }}>
      
      {/* HEADER: TIẾN ĐỘ BÀI ĐỌC */}
      <div style={{ backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>Bài đọc: {currentPassageIndex + 1} / {formattedData.length}</h3>
        <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
          Passage ID: {currentPassage.passage_id}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        
        {/* CỘT TRÁI: NỘI DUNG BÀI ĐỌC */}
        <div className="custom-scrollbar" style={{ flex: '1.2', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '70vh', overflowY: 'auto' }}>
          <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '24px' }}>{currentPassage.title}</h2>
          <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-line', textAlign: 'justify' }}>
            {currentPassage.passage_text}
          </div>
        </div>

        {/* CỘT PHẢI: CÂU HỎI & ĐÁP ÁN */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '70vh' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '2px solid #f1f5f9' }}>
            {currentPassage.questions.map((q, index) => {
              const qState = userProgress[q.global_id];
              const isPassageFullyUnlocked = currentPassageIndex < highestReachedPassage;
              const isLocked = !isPassageFullyUnlocked && index > highestReachedQuestion;
              
              let boxBgColor = '#f1f5f9'; let boxTextColor = '#64748b'; let boxBorder = '2px solid transparent';
              if (qState && qState.firstAttemptResult === 'correct') { boxBgColor = '#d1fae5'; boxTextColor = '#059669'; }
              else if (qState && qState.firstAttemptResult === 'wrong') { boxBgColor = '#ffe4e6'; boxTextColor = '#e11d48'; }

              if (currentQuestionIndex === index) { boxBorder = '2px solid #4f46e5'; boxBgColor = '#e0e7ff'; boxTextColor = '#4f46e5'; }

              return (
                <button
                  key={q.global_id}
                  onClick={() => !isLocked && setCurrentQuestionIndex(index)}
                  disabled={isLocked}
                  style={{
                    width: '38px', height: '38px', borderRadius: '8px',
                    backgroundColor: boxBgColor, color: boxTextColor, border: boxBorder,
                    fontWeight: 'bold', fontSize: '14px', cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.4 : 1, transition: 'all 0.2s'
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="custom-scrollbar" style={{ flex: '1', overflowY: 'auto', paddingRight: '5px' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
              {currentQuestionIndex + 1}. {currentQ.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.optionsArray.map((opt, index) => {
                let bgColor = '#f8fafc'; let textColor = '#334155'; let borderStyle = '2px solid #e2e8f0';

                if (qProgress.isSolved && opt.key === currentQ.correct_answer) {
                  bgColor = '#10b981'; textColor = '#fff'; borderStyle = '2px solid #059669';
                } else if (qProgress.selectedWrong.includes(opt.key)) {
                  bgColor = '#ef4444'; textColor = '#fff'; borderStyle = '2px solid #dc2626';
                }

                // CẬP NHẬT MỚI: Ép nhãn hiển thị luôn là A, B, C, D dựa theo thứ tự index (0->A, 1->B...)
                const displayLabel = String.fromCharCode(65 + index);

                return (
                  <button
                    key={opt.key} className="option-btn"
                    disabled={qProgress.isSolved}
                    // Hàm click vẫn gửi lên opt.key (đáp án thật) để xử lý logic chấm điểm chính xác
                    onClick={() => handleSelectOption(currentQ.global_id, opt.key, currentQ.correct_answer)}
                    style={{
                      padding: '12px', textAlign: 'left', backgroundColor: bgColor,
                      color: textColor, border: borderStyle, fontSize: '15px',
                      cursor: qProgress.isSolved ? 'default' : 'pointer'
                    }}
                  >
                    {/* Render nhãn cố định displayLabel */}
                    <strong style={{ display: 'inline-block', width: '25px' }}>{displayLabel}.</strong> {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="nav-btn"
                onClick={handlePrevPassage} 
                disabled={currentPassageIndex === 0}
                style={{ padding: '5px 12px', cursor: currentPassageIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentPassageIndex === 0 ? 0.5 : 1 }}
                title="Quay lại Bài đọc trước đó"
              >
                ⏮️ Bài đọc trước
              </button>

              <button 
                className="nav-btn"
                onClick={handlePrevQuestion} 
                disabled={currentQuestionIndex === 0}
                style={{ padding: '5px 12px', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                title="Quay lại Câu hỏi trước đó trong bài này"
              >
                ← Câu trước
              </button>
            </div>

            <button 
              className={`nav-btn ${qProgress.isSolved ? 'primary' : ''}`}
              onClick={handleNextAction} 
              disabled={!qProgress.isSolved}
              style={{ padding: '5px 12px', cursor: !qProgress.isSolved ? 'not-allowed' : 'pointer', opacity: !qProgress.isSolved ? 0.5 : 1 }}
            >
              {nextButtonText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}