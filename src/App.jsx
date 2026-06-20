import React, { useState } from 'react';
import './App.css'; // Import file CSS đã tạo ở trên
import VocabularyGrammar from './components/VocabularyGrammar';
import Reading from './components/Reading';
import Signs from './components/Signs';
import Listening from './components/Listening';
import ClozeText from './components/ClozeText';
import Writing from './components/Writing';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  const renderBackButton = () => (
    <button 
      className="back-button"
      onClick={() => setCurrentScreen('menu')}
    >
      <span>←</span> Quay lại Menu chính
    </button>
  );

  return (
    <div className="app-container">
      <div className="content-wrapper">
        
        {/* MÀN HÌNH MENU CHÍNH */}
        {currentScreen === 'menu' && (
          <div>
            <h1 className="header-title">Hệ Thống Luyện Thi B1</h1>
            <p className="header-subtitle">Vui lòng chọn phần kỹ năng bạn muốn luyện tập hôm nay</p>

            <div className="menu-grid">
              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('grammar')}
              >
                <div className="card-icon">📝</div>
                <h2 className="card-title">Vocabulary & Grammar</h2>
              </div>
              
              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('reading')}
              >
                <div className="card-icon">📖</div>
                <h2 className="card-title">Reading Comprehension</h2>
              </div>

              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('signs')}
              >
                <div className="card-icon">🚸</div>
                <h2 className="card-title">Signs</h2>
              </div>

              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('listening')}
              >
                <div className="card-icon">🎧</div>
                <h2 className="card-title">Listening</h2>
              </div>

              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('clozetext')}
              >
                <div className="card-icon">📝</div>
                <h2 className="card-title">Cloze Text</h2>
              </div>

              <div 
                className="menu-card"
                onClick={() => setCurrentScreen('writing')}
              >
                <div className="card-icon">✍️</div>
                <h2 className="card-title">Writing</h2>
              </div>
            </div>
          </div>
        )}

        {/* CÁC MÀN HÌNH CHỨC NĂNG */}
        {currentScreen === 'grammar' && (
          <div>
            {renderBackButton()}
            <VocabularyGrammar />
          </div>
        )}

        {currentScreen === 'reading' && (
          <div>
            {renderBackButton()}
            <Reading />
          </div>
        )}

        {currentScreen === 'signs' && (
          <div>
            {renderBackButton()}
            <Signs />
          </div>
        )}

        {currentScreen === 'listening' && (
          <div>
            {renderBackButton()}
            <Listening />
          </div>
        )}

        {currentScreen === 'clozetext' && (
          <div>
            {renderBackButton()}
            <ClozeText />
          </div>
        )}

        {currentScreen === 'writing' && (
          <div>
            {renderBackButton()}
            <Writing />
          </div>
        )}

      </div>
    </div>
  );
}