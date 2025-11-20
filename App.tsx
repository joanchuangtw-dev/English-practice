import React from 'react';
import { SCENARIOS } from './constants';
import { useLiveSession } from './hooks/useLiveSession';
import { ConnectionState } from './types';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const { status, connect, disconnect, volume, error, activeScenario } = useLiveSession();

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      connect(scenario);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <h1 className="text-xl font-bold text-slate-800">SpeakFluency</h1>
          </div>
          <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded">
             Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Introduction */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">英文口說練習 AI 導師</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            選擇一個情境，與 Gemini AI 進行即時語音對話。就像與真人練習一樣，提升您的流利度與自信心。
          </p>
        </div>

        {/* Active Session View */}
        {(status === ConnectionState.CONNECTED || status === ConnectionState.CONNECTING) && activeScenario ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8 transition-all duration-500 ease-in-out">
            <div className="p-6 md:p-8 text-center">
              <div className="inline-block text-6xl mb-4 animate-bounce">
                {activeScenario.emoji}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {activeScenario.title}
              </h3>
              <p className="text-slate-500 mb-8">
                {status === ConnectionState.CONNECTING ? '正在連線中...' : '正在聆聽... 請開始說話'}
              </p>

              {/* Status Indicator */}
              <div className="flex justify-center mb-6">
                <div className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 
                  ${status === ConnectionState.CONNECTED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  <span className={`block w-2 h-2 rounded-full ${status === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                  {status === ConnectionState.CONNECTED ? '已連線 (Live)' : '連線中...'}
                </div>
              </div>

              {/* Audio Visualizer */}
              <div className="mb-8">
                <Visualizer isActive={status === ConnectionState.CONNECTED} volume={volume} />
              </div>

              {/* Controls */}
              <button
                onClick={disconnect}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 px-8 rounded-full transition-colors flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                結束對話
              </button>
            </div>
          </div>
        ) : (
          /* Scenario Selection Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario.id)}
                disabled={status === ConnectionState.CONNECTING}
                className="group text-left bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl">{scenario.emoji}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded 
                    ${scenario.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                      scenario.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 
                      'bg-purple-100 text-purple-700'}`}>
                    {scenario.difficulty === 'Beginner' ? '初級' : 
                     scenario.difficulty === 'Intermediate' ? '中級' : '高級'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {scenario.description}
                </p>
                
                <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  開始練習 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{error}</p>
          </div>
        )}

        {/* Instructions / Tips */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">使用提示</h4>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              請在安靜的環境下使用，以獲得最佳辨識效果。
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              對話隨時可以打斷，AI 會自然地回應您的插話。
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              請確保瀏覽器已允許使用麥克風權限。
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
};

export default App;