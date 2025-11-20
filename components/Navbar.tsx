import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { AnalysisStage } from '../types';

interface NavbarProps {
  currentStage: AnalysisStage;
  setStage: (stage: AnalysisStage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStage, setStage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 no-print transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setStage(AnalysisStage.LANDING)}>
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl mr-3 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-gray-900">
                Infinite<span className="text-primary">ATS</span>
              </span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {[
              { label: 'Dashboard', value: AnalysisStage.DASHBOARD },
              { label: 'New Analysis', value: AnalysisStage.UPLOAD },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setStage(item.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentStage === item.value 
                    ? 'text-primary bg-blue-50 ring-1 ring-blue-100' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-4 flex items-center border-l border-gray-200 pl-6">
              <button className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:shadow-lg transition-all">
                  JD
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-blue-50 focus:outline-none transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in shadow-2xl absolute w-full left-0">
          <div className="px-4 pt-2 pb-4 space-y-2">
             <button 
              onClick={() => { setStage(AnalysisStage.DASHBOARD); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setStage(AnalysisStage.UPLOAD); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};