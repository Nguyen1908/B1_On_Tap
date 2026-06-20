import React, { useState, useEffect } from 'react';
import writingData from '../data/writing.json';

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function Writing() {
  const [step, setStep] = useState('setup'); 
  const [startId, setStartId] = useState(36); // Mặc định từ câu 36
  const [endId, setEndId] = useState(60);     // Mặc định đến câu 60
  const [isRandomQuestions, setIsRandomQuestions] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highestReachedIndex, setHighestReachedIndex] = useState(0);
  const [userProgress, setUserProgress] = useState({});
  
  const [inputText, setInputText] = useState("");

  const handleStartQuiz = () => {
    // 1. Lọc dữ liệu theo khoảng ID
    let filtered = writingData.filter(q => q.id >= startId && q.id <= endId);

    if (filtered.length === 0) {
      alert("Không tìm thấy câu hỏi nào trong khoảng này! Vui lòng chọn khoảng khác.");
      return;
    }

    let formatted = [...filtered];
    
    // 2. Xáo trộn nếu có yêu cầu
    if (isRandomQuestions) {
      formatted = shuffleArray(formatted);
    }

    setQuizQuestions(formatted);
    setCurrentIndex(0);
    setHighestReachedIndex(0);
    setUserProgress({});
    setStep('quiz');
  };

  useEffect(() => {
    if (quizQuestions.length > 0) {
      const currentQ = quizQuestions[currentIndex];
      const savedProgress = userProgress[currentQ.id];
      setInputText(savedProgress?.typedText || "");
    }
  }, [currentIndex, quizQuestions, userProgress]);

  const handleCheckAnswer = () => {
    if (!inputText.trim()) return; 

    const currentQ = quizQuestions[currentIndex];
    
    // Loại bỏ khoảng trắng thừa, dấu chấm cuối câu và đưa về in thường
    const userAnswer = inputText.trim().replace(/\.$/, "").toLowerCase();
    const correctAnswer = currentQ.correct_answer.trim().replace(/\.$/, "").toLowerCase();
    
    const isCorrect = (userAnswer === correctAnswer);

    setUserProgress({
      ...userProgress,
      [currentQ.id]: { 
        isSolved: true, 
        firstAttemptResult: isCorrect ? 'correct' : 'wrong',
        typedText: inputText.trim() 
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex === quizQuestions.length - 1) {
      setStep('result');
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setHighestReachedIndex(prev => Math.max(prev, nextIndex));
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
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '30px' }}>✍️ Thiết lập bài thi Writing</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
          Bài thi chỉ có từ câu 36 đến câu 60.
        </p>
        {/* THÊM PHẦN CHỌN PHẠM VI CÂU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Phạm vi câu:</label>
          <input type="number" value={startId} onChange={e => setStartId(Number(e.target.value))} style={inputStyle} />
          <span style={{ color: '#94a3b8' }}>đến</span>
          <input type="number" value={endId} onChange={e => setEndId(Number(e.target.value))} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <input type="checkbox" checked={isRandomQuestions} onChange={e => setIsRandomQuestions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đảo ngẫu nhiên thứ tự câu hỏi
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
          .btn-primary:hover:not(:disabled) { background-color: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .btn-primary:disabled { background-color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
          .nav-btn { transition: all 0.2s ease; background-color: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; }
          .nav-btn:hover:not(:disabled) { background-color: #e2e8f0; color: #0f172a; }
          .nav-btn.primary { background-color: #4f46e5; color: white; border: none; }
          .nav-btn.primary:hover:not(:disabled) { background-color: #4338ca; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          
          .writing-input { 
            border: 2px solid #cbd5e1; 
            border-radius: 6px; 
            padding: 8px 12px; 
            font-size: 18px; 
            outline: none; 
            transition: all 0.2s; 
            font-weight: bold; 
            margin: 0 10px;
            min-width: 250px;
            width: 40%;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          }
          .writing-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
        `}</style>
      </div>
    );
  }

  // --- RENDER MÀN HÌNH KẾT QUẢ ---
  if (step === 'result') {
    const score = calculateScore();
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="fade-in" style={{ padding: '40px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0' }}>{percentage >= 80 ? '🎉' : '👏'}</h1>
        <h2 style={{ color: '#1e293b', marginTop: '10px' }}>Hoàn thành phần Writing!</h2>
        
        <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 10px 0' }}>Số câu gõ đúng:</p>
          <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#4f46e5', margin: '0' }}>{score} / {total}</p>
          <p style={{ fontSize: '16px', color: '#10b981', fontWeight: 'bold', marginTop: '10px' }}>Chính xác: {percentage}%</p>
        </div>

        <button className="btn-primary" onClick={() => setStep('setup')} style={{ padding: '12px 30px', fontSize: '16px', fontWeight: 'bold' }}>
          Làm bài khác
        </button>
      </div>
    );
  }

  // --- RENDER MÀN HÌNH QUIZ ---
  const currentQ = quizQuestions[currentIndex];
  const qProgress = userProgress[currentQ.id] || { selectedWrong: [], isSolved: false };
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  let inputBorderColor = '#cbd5e1'; 
  let inputTextColor = '#0f172a';
  if (qProgress.isSolved) {
    if (qProgress.firstAttemptResult === 'correct') {
      inputBorderColor = '#10b981'; 
      inputTextColor = '#059669';
    } else {
      inputBorderColor = '#ef4444'; 
      inputTextColor = '#dc2626';
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '30px', maxWidth: '1100px', margin: '40px auto', padding: '0 20px', alignItems: 'flex-start' }}>
      
      {/* CỘT TRÁI: DANH SÁCH CÂU HỎI */}
      <div style={{ flex: '1', minWidth: '160px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxHeight: '80vh', overflowY: 'auto' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#334155', fontWeight: 'bold' }}>Tiến độ làm bài</h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {quizQuestions.map((q, index) => {
            const qState = userProgress[q.id];
            const isLocked = index > highestReachedIndex;
            
            let boxBgColor = '#f1f5f9'; let boxTextColor = '#64748b'; let boxBorder = '2px solid transparent';

            if (qState && qState.firstAttemptResult === 'correct') {
              boxBgColor = '#d1fae5'; boxTextColor = '#059669';
            } else if (qState && qState.firstAttemptResult === 'wrong') {
              boxBgColor = '#ffe4e6'; boxTextColor = '#e11d48';
            }

            if (currentIndex === index) {
              boxBorder = '2px solid #4f46e5'; boxBgColor = '#e0e7ff'; boxTextColor = '#4f46e5';
            }

            return (
              <button
                key={q.id}
                onClick={() => !isLocked && setCurrentIndex(index)}
                disabled={isLocked}
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  backgroundColor: boxBgColor, color: boxTextColor, border: boxBorder,
                  fontWeight: 'bold', fontSize: '14px', cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', boxShadow: currentIndex === index ? '0 4px 10px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CÂU HỎI */}
      <div style={{ flex: '3', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#475569' }}>Writing {currentIndex + 1} <span style={{ color: '#94a3b8', fontSize: '16px' }}>/ {quizQuestions.length}</span></h3>
          <span style={{ backgroundColor: '#f1f5f9', padding: '5px 12px', borderRadius: '20px', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>ID: {currentQ.id}</span>
        </div>
        
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#64748b', marginBottom: '10px' }}>
          Hoàn thành câu dưới đây sao cho cùng nghĩa với câu gốc:
        </p>

        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.6', marginBottom: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #4f46e5' }}>
          {currentQ.question}
        </p>

        {/* KHU VỰC ĐIỀN ĐÁP ÁN */}
        <div style={{ fontSize: '20px', color: '#334155', marginBottom: '30px', lineHeight: '2.4' }}>
          {currentQ.hint.prefix && <span>{currentQ.hint.prefix}</span>}
          
          <input 
            type="text" 
            className="writing-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={qProgress.isSolved} 
            placeholder="Nhập đáp án..."
            style={{ 
              fontSize: '20px',
              borderColor: inputBorderColor, 
              color: inputTextColor,
              backgroundColor: qProgress.isSolved ? '#f1f5f9' : '#ffffff' 
            }}
          />
          
          {currentQ.hint.suffix && <span>{currentQ.hint.suffix}</span>}
        </div>

        {/* NÚT KIỂM TRA */}
        {!qProgress.isSolved && (
          <button 
            className="btn-primary" 
            onClick={handleCheckAnswer}
            disabled={inputText.trim() === ""}
            style={{ padding: '12px 25px', fontSize: '16px', fontWeight: 'bold' }}
          >
            Kiểm tra đáp án
          </button>
        )}

        {/* HIỂN THỊ KẾT QUẢ */}
        {qProgress.isSolved && (
          <div style={{ marginTop: '20px', padding: '20px', borderRadius: '10px', backgroundColor: qProgress.firstAttemptResult === 'correct' ? '#d1fae5' : '#ffe4e6', border: `1px solid ${qProgress.firstAttemptResult === 'correct' ? '#34d399' : '#fda4af'}` }}>
            {qProgress.firstAttemptResult === 'correct' ? (
              <p style={{ margin: 0, color: '#059669', fontSize: '18px', fontWeight: 'bold' }}>✅ Tuyệt vời! Bạn đã gõ chính xác.</p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', color: '#e11d48', fontSize: '18px', fontWeight: 'bold' }}>❌ Chưa chính xác.</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '16px' }}>Đáp án đúng là: <strong style={{ color: '#0f172a', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px' }}>{currentQ.correct_answer}</strong></p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
          <button 
            className="nav-btn"
            onClick={() => setCurrentIndex(prev => prev - 1)} 
            disabled={currentIndex === 0}
            style={{ padding: '12px 24px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            ← Quay lại
          </button>

          <button 
            className={`nav-btn ${qProgress.isSolved ? 'primary' : ''}`}
            onClick={handleNextQuestion} 
            disabled={!qProgress.isSolved}
            style={{ padding: '12px 30px', cursor: !qProgress.isSolved ? 'not-allowed' : 'pointer', opacity: !qProgress.isSolved ? 0.5 : 1 }}
          >
            {isLastQuestion ? 'Hoàn thành bài thi 🎉' : 'Câu tiếp theo →'}
          </button>
        </div>
      </div>
      
    </div>
  );
}

// Inline style cho input số lượng
const inputStyle = {
  width: '70px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '16px', textAlign: 'center', outline: 'none'
};