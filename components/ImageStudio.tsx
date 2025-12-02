import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { geminiService } from '../services/gemini';

export const ImageStudio: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;
    
    setLoading(true);
    try {
      const result = await geminiService.editImage(originalImage, prompt);
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-950">
      <div className="mb-8 border-b border-stone-800 pb-6">
        <h2 className="text-3xl font-light tracking-tight text-white mb-2 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-bronze-500" />
          <span className="bg-gradient-to-r from-bronze-200 to-bronze-500 bg-clip-text text-transparent font-medium">
            Creative Studio
          </span>
        </h2>
        <p className="text-stone-400 font-light">Use Gemini 2.5 Vision to analyze and modify your assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Left: Input Area */}
        <div className="flex flex-col gap-4">
          <div 
            className={`flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
              originalImage ? 'border-stone-700 bg-stone-900' : 'border-stone-700 hover:border-bronze-500 hover:bg-stone-900/50'
            }`}
          >
            {originalImage ? (
              <>
                <img src={originalImage} alt="Original" className="w-full h-full object-contain p-4" />
                <button 
                  onClick={() => {
                    setOriginalImage(null);
                    setGeneratedImage(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-stone-900/80 text-white rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors backdrop-blur-sm border border-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center cursor-pointer p-8 w-full h-full flex flex-col items-center justify-center group"
              >
                <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-stone-800 group-hover:border-bronze-500/50">
                  <Upload className="w-8 h-8 text-stone-500 group-hover:text-bronze-400 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-stone-200">Upload Source Image</h3>
                <p className="text-sm text-stone-500 mt-2">Supports PNG, JPG, WebP</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl">
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze-500 mb-3">Generation Prompt</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the changes (e.g., 'Make it look like a sketch')"
                className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 focus:ring-1 focus:ring-bronze-500 focus:border-bronze-500 outline-none placeholder-stone-600 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={!originalImage || !prompt || loading}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg ${
                  !originalImage || !prompt || loading
                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    : 'bg-gradient-to-br from-bronze-500 to-bronze-700 hover:from-bronze-400 hover:to-bronze-600 text-white shadow-bronze-900/20'
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output Area */}
        <div className="flex flex-col gap-4">
           <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain p-4 animate-in fade-in duration-700" />
                 <a 
                  href={generatedImage} 
                  download="gemini-edit.png"
                  className="absolute bottom-6 right-6 px-5 py-2.5 bg-stone-900/90 text-bronze-400 border border-bronze-500/30 rounded-lg flex items-center gap-2 hover:bg-bronze-500 hover:text-white transition-all backdrop-blur-md shadow-xl"
                >
                  <Download className="w-4 h-4" /> Export Asset
                </a>
              </>
            ) : (
              <div className="text-center text-stone-600 p-8">
                <div className="w-20 h-20 bg-stone-800/50 rounded-full flex items-center justify-center mb-4 mx-auto border border-stone-800">
                  <ImageIcon className="w-8 h-8 text-stone-700" />
                </div>
                <p className="font-light">Generated results will render here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};