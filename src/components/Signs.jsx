import React, { useState } from 'react';
// Import file JSON chứa dữ liệu biển báo của bạn
import signsData from '../data/signs.json';

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function Signs() {
  const [step, setStep] = useState('setup'); // 'setup', 'quiz', 'result'
  const [isRandomQuestions, setIsRandomQuestions] = useState(false);
  const [isRandomOptions, setIsRandomOptions] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highestReachedIndex, setHighestReachedIndex] = useState(0);
  const [userProgress, setUserProgress] = useState({});

  const handleStartQuiz = () => {
    if (!signsData || signsData.length === 0) {
      alert("Không có dữ liệu câu hỏi!");
      return;
    }

    // Không cần filter startId/endId nữa, lấy toàn bộ dữ liệu
    let formatted = signsData.map(q => {
      let opsArray = Object.keys(q.options).map(key => ({
        key: key,
        text: q.options[key]
      }));
      if (isRandomOptions) opsArray = shuffleArray(opsArray);
      return { ...q, optionsArray: opsArray };
    });

    if (isRandomQuestions) formatted = shuffleArray(formatted);

    setQuizQuestions(formatted);
    setCurrentIndex(0);
    setHighestReachedIndex(0);
    setUserProgress({});
    setStep('quiz');
  };

  const handleSelectOption = (questionId, selectedKey, correctKey) => {
    const currentProgress = userProgress[questionId] || { selectedWrong: [], isSolved: false };
    if (currentProgress.isSolved) return;

    let firstAttempt = currentProgress.firstAttemptResult;
    if (!firstAttempt) {
      firstAttempt = (selectedKey === correctKey) ? 'correct' : 'wrong';
    }

    if (selectedKey === correctKey) {
      setUserProgress({
        ...userProgress,
        [questionId]: { ...currentProgress, isSolved: true, firstAttemptResult: firstAttempt }
      });
    } else {
      setUserProgress({
        ...userProgress,
        [questionId]: {
          ...currentProgress,
          selectedWrong: [...currentProgress.selectedWrong, selectedKey],
          firstAttemptResult: firstAttempt
        }
      });
    }
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
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '30px' }}>🛑 Thiết lập bài thi Signs</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '10px' }}>
            Bài thi này bao gồm toàn bộ <strong>{signsData.length}</strong> câu hỏi biển báo.
          </p>

          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
            <input type="checkbox" checked={isRandomQuestions} onChange={e => setIsRandomQuestions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đảo ngẫu nhiên thứ tự câu hỏi
          </label>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
            <input type="checkbox" checked={isRandomOptions} onChange={e => setIsRandomOptions(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đảo ngẫu nhiên đáp án (A, B, C, D)
          </label>
        </div>

        <button className="btn-primary" onClick={handleStartQuiz} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
          🚀 Bắt đầu làm bài
        </button>

        <style>{`
          body { background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .btn-primary { background-color: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
          .btn-primary:hover { background-color: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .option-btn { transition: all 0.2s ease; border-radius: 10px; }
          .option-btn:hover:not(:disabled) { transform: translateX(5px); background-color: #e2e8f0; }
          .nav-btn { transition: all 0.2s ease; background-color: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; }
          .nav-btn:hover:not(:disabled) { background-color: #e2e8f0; color: #0f172a; }
          .nav-btn.primary { background-color: #4f46e5; color: white; border: none; }
          .nav-btn.primary:hover:not(:disabled) { background-color: #4338ca; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          .sign-image { max-width: 100%; max-height: 250px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px; object-fit: contain; background-color: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; }
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
        <h2 style={{ color: '#1e293b', marginTop: '10px' }}>Hoàn thành bài thi Signs!</h2>
        
        <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 10px 0' }}>Kết quả lần chọn đầu tiên:</p>
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

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '30px', maxWidth: '1100px', margin: '40px auto', padding: '0 20px', alignItems: 'flex-start' }}>
      
      {/* CỘT TRÁI: DANH SÁCH CÂU HỎI */}
      <div style={{ flex: '1', minWidth: '220px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxHeight: '80vh', overflowY: 'auto' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#334155', fontWeight: 'bold' }}>Tiến độ làm bài</h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {quizQuestions.map((q, index) => {
            const qState = userProgress[q.id];
            const isLocked = index > highestReachedIndex;
            
            let boxBgColor = '#f1f5f9'; 
            let boxTextColor = '#64748b';
            let boxBorder = '2px solid transparent';

            if (qState && qState.firstAttemptResult === 'correct') {
              boxBgColor = '#d1fae5';
              boxTextColor = '#059669';
            } else if (qState && qState.firstAttemptResult === 'wrong') {
              boxBgColor = '#ffe4e6';
              boxTextColor = '#e11d48';
            }

            if (currentIndex === index) {
              boxBorder = '2px solid #4f46e5';
              boxBgColor = '#e0e7ff';
              boxTextColor = '#4f46e5';
            }

            return (
              <button
                key={q.id}
                onClick={() => !isLocked && setCurrentIndex(index)}
                disabled={isLocked}
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  backgroundColor: boxBgColor, color: boxTextColor, border: boxBorder,
                  fontWeight: 'bold', fontSize: '14px',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: currentIndex === index ? '0 4px 10px rgba(79, 70, 229, 0.2)' : 'none'
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
          <h3 style={{ margin: 0, color: '#475569' }}>Sign {currentIndex + 1} <span style={{ color: '#94a3b8', fontSize: '16px' }}>/ {quizQuestions.length}</span></h3>
          <span style={{ backgroundColor: '#f1f5f9', padding: '5px 12px', borderRadius: '20px', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}></span>
        </div>
        
        {/* HIỂN THỊ HÌNH ẢNH BIỂN BÁO */}
        <div style={{ textAlign: 'center' }}>
          <img 
            src={`${import.meta.env.BASE_URL}${currentQ.image_url}`}
            alt="Traffic Sign" 
            className="sign-image"
            // Xử lý lỗi nếu không tải được ảnh
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/250x250?text=Image+Not+Found";
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          {/* CẬP NHẬT Ở ĐÂY: Thêm tham số index vào hàm map */}
          {currentQ.optionsArray.map((opt, index) => {
            let bgColor = '#f8fafc';
            let textColor = '#334155';
            let borderStyle = '2px solid #e2e8f0';

            if (qProgress.isSolved && opt.key === currentQ.correct_answer) {
              bgColor = '#10b981';
              textColor = '#fff';
              borderStyle = '2px solid #059669';
            } else if (qProgress.selectedWrong.includes(opt.key)) {
              bgColor = '#ef4444';
              textColor = '#fff';
              borderStyle = '2px solid #dc2626';
            }

            // Tính toán nhãn A, B, C, D từ index (0 -> A, 1 -> B, ...)
            const displayLabel = String.fromCharCode(65 + index);

            return (
              <button
                key={opt.key}
                className="option-btn"
                disabled={qProgress.isSolved}
                onClick={() => handleSelectOption(currentQ.id, opt.key, currentQ.correct_answer)}
                style={{
                  padding: '16px 20px', textAlign: 'left', backgroundColor: bgColor,
                  color: textColor, border: borderStyle,
                  fontSize: '16px', cursor: qProgress.isSolved ? 'default' : 'pointer'
                }}
              >
                {/* Thay {opt.key} bằng {displayLabel} */}
                <strong style={{ display: 'inline-block', width: '30px' }}>{displayLabel}.</strong> {opt.text}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
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