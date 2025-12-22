"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Sparkles } from 'lucide-react';

export default function App() {
  const snowCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [isOfferEnded, setIsOfferEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const checkoutUrl = 'https://aces.shopselect.net/items/128935995';
  const audioSrc = 'touka-no-akari-preview.mp3';

  // オーディオ初期化
  useEffect(() => {
    const audio = new Audio();
    audio.src = audioSrc;
    audio.preload = "auto";
    
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.error("Audio Load Error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  };

  // 雪のエフェクト
  useEffect(() => {
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    class NaturalSnow {
      x: number = 0;
      y: number = 0;
      depth: number = 0;
      size: number = 0;
      speedY: number = 0;
      opacity: number = 0;
      stepSize: number = 0;
      step: number = 0;

      constructor() {
        this.init();
        this.y = Math.random() * window.innerHeight;
      }

      init() {
        this.x = Math.random() * window.innerWidth;
        this.y = -20;
        this.depth = Math.random();
        this.size = (this.depth * 3) + 0.5;
        this.speedY = (this.depth * 1.2) + 0.6;
        this.opacity = (this.depth * 0.4) + 0.1;
        this.stepSize = Math.random() * 0.02;
        this.step = Math.random() * Math.PI * 2;
      }

      update() {
        this.step += this.stepSize;
        this.x += Math.sin(this.step) * (this.depth * 0.8);
        this.y += this.speedY;
        if (this.y > window.innerHeight + 10) this.init();
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initSnow = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 150 }, () => new NaturalSnow());
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(loop);
    };

    initSnow();
    loop();
    window.addEventListener('resize', initSnow);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initSnow);
    };
  }, []);

  // スクロール & カウントダウン
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const deadline = new Date('2025-12-25T23:59:59+09:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = deadline - now;
      if (diff > 0) {
        setTimeLeft({
          d: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
          h: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
          m: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0'),
          s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
        });
      } else {
        setIsOfferEnded(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const handlePurchase = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) overlay.style.display = 'flex';
    setTimeout(() => { window.location.href = checkoutUrl; }, 1200);
  };

  const tracks = [
    { id: "1", title: "Unbroken -指輪の誓い-", duration: "4:20", desc: "至高のピアノバラード" },
    { id: "2", title: "冬空", duration: "3:45", desc: "冬の代表作" },
    { id: "3", title: "灯 -Akari-", duration: "4:12", desc: "孤独を包む光" },
    { id: "4", title: "冬空の灯 -Touka no Akari-", duration: "4:50", desc: "アルバムの核心をなす表題曲", canPreview: true },
    { id: "5", title: "誰も知らない時間 — My Time (B-Voice)", duration: "3:55", desc: "独りだけの温かな休息" },
    { id: "6", title: "粉雪の足跡 (Interlude)", duration: "1:45", desc: "静寂への誘い" },
    { id: "7", title: "I'm Here for You", duration: "4:10", desc: "寄り添うためのメッセージ" },
    { id: "8", title: "I'm Here for You (Dual Vocals Version)", duration: "4:10", desc: "重なり合う旋律의 深層" },
    { id: "9", title: "I'm Here for You (Slow Jam Remix)", duration: "5:05", desc: "真夜中のためのリワーク" },
    { id: "10", title: "灯の余韻 -Afterglow-", duration: "3:30", desc: "物語の最後を見届ける調べ" },
    { id: "EX", title: "Whispers on the Keys", duration: "4:15", desc: "【限定】公式ストア独占トラック", isExclusive: true },
  ];

  return (
    <main className="relative bg-[#010308] text-[#D4D4D8] min-h-screen font-serif antialiased overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400;700;900&family=Inter:wght@100;400;700;900&family=Italiana&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes audioWave { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .font-luxury-jp { font-family: "Hiragino Mincho ProN", "MS PMincho", serif; }
        .animate-fadeInUp { animation: fadeInUp 3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        html { scroll-behavior: smooth; }
      `}} />

      {/* Checkout Overlay */}
      <div id="checkoutOverlay" className="fixed inset-0 bg-[#010308] hidden items-center justify-center z-[9999]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#B69F66] border-t-transparent rounded-full animate-[spin_1s_linear_infinite] mx-auto"></div>
          <p className="text-[#B69F66] text-2xl tracking-[0.4em] font-light mt-8">Secure Checkout...</p>
        </div>
      </div>

      {/* Fixed Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545048702-793eec75f20c?auto=format&fit=crop&q=80&w=2500')] bg-cover bg-center opacity-25 grayscale mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#010308_100%)]"></div>
        <canvas ref={snowCanvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[5]" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-[#B69F66]/[0.05] blur-[120px] rounded-full"></div>
      </div>

      {/* Nav - 戦略的配置 */}
      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-700 ${isScrolled ? 'bg-[#010308]/90 backdrop-blur-3xl py-6 border-b border-[#B69F66]/10' : 'py-12 bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-12 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-light tracking-[0.6em] text-white uppercase">HIDEKI TAMAE</div>
              <div className="text-[9px] tracking-[0.5em] text-[#B69F66] mt-2 font-sans font-bold uppercase">PREMIUM RELEASE</div>
            </div>
            
            {/* ジョン・ベンソン流：最適な位置での「体験への即時アクセス」 */}
            <button 
              onClick={togglePlay}
              className="group flex items-center gap-3 px-4 py-2 border border-[#B69F66]/25 rounded-full transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/5 hover:shadow-[0_0_20px_rgba(182,159,102,0.15)]"
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isPlaying ? (
                  <Pause size={14} className="text-[#B69F66]" />
                ) : (
                  <Play size={14} className="text-[#B69F66] ml-0.5" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] text-[#B69F66] tracking-[0.3em] uppercase font-sans leading-none">
                  {isPlaying ? 'Playing' : 'Preview'}
                </span>
                <span className="text-[10px] text-white/60 font-light tracking-wider leading-none mt-0.5">
                  冬空の灯
                </span>
              </div>
              {isPlaying && (
                <div className="flex gap-0.5 items-center h-4 ml-1">
                  {[0.6, 1, 0.8, 1, 0.7].map((scale, i) => (
                    <div 
                      key={i}
                      className="w-[2px] bg-[#B69F66] rounded-full"
                      style={{
                        height: '100%',
                        animation: `audioWave 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          </div>
          
          <div className="hidden lg:flex gap-16 text-[9px] tracking-[0.6em] uppercase font-sans text-white/40 italic">
            <a href="#concept" className="hover:text-[#B69F66] transition-colors">Story</a>
            <a href="#tracks" className="hover:text-[#B69F66] transition-colors">Collection</a>
            <a href="#assets" className="hover:text-[#B69F66] transition-colors">Exclusives</a>
          </div>
        </div>
      </nav>

      {/* Sticky Footer - ジェイソン・フォレスト流：緊急性の強化 */}
      <div className="fixed bottom-0 left-0 w-full bg-[#010308]/95 backdrop-blur-3xl border-t border-[#B69F66]/30 z-[2000] py-5">
        <div className="max-w-[1600px] mx-auto px-12 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.4em] text-[#B69F66] font-black uppercase mb-1 flex items-center gap-2">
              <Sparkles size={12} className="animate-pulse" />
              Limited Time Offer
            </span>
            <span className="text-[11px] text-white/40 italic tracking-wider">{isOfferEnded ? 'Offer ended' : 'Ends: Dec 25, 2025 (23:59)'}</span>
          </div>
          <div className="flex gap-8 items-center">
            {[ 
              {v: timeLeft.d, l: 'Days'}, {v: timeLeft.h, l: 'Hrs'}, {v: timeLeft.m, l: 'Min'}, {v: timeLeft.s, l: 'Sec'}
            ].map((unit, i) => (
              <div key={i} className="text-center">
                <span className="font-sans text-2xl font-light text-white block leading-none">{unit.v}</span>
                <span className="text-[8px] text-[#B69F66] tracking-widest uppercase">{unit.l}</span>
              </div>
            ))}
          </div>
          <button onClick={handlePurchase} className="px-10 py-3 border border-[#B69F66] text-[#B69F66] font-bold text-[11px] tracking-[0.4em] uppercase hover:bg-[#B69F66] hover:text-black transition-all group flex flex-col items-center gap-1.5">
            Get Access Now
            <span className="text-[8px] tracking-[0.25em] opacity-75 italic font-normal">¥2,440 / Limited</span>
          </button>
        </div>
      </div>

      {/* Hero - ピーター・クレイズ流：視覚的インパクト */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-20 text-center px-6 w-full max-w-[1200px]">
          <div className="w-[120px] h-[16px] mx-auto mb-10 opacity-0 animate-fadeInUp">
            <svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="8" x2="50" y2="8" stroke="#B69F66" strokeWidth="1" strokeLinecap="round" opacity="0.85"/>
              <line x1="70" y1="8" x2="108" y2="8" stroke="#B69F66" strokeWidth="1" strokeLinecap="round" opacity="0.85"/>
              <circle cx="60" cy="8" r="2" fill="#B69F66" opacity="0.9"/>
              <circle cx="56" cy="6" r="1" fill="#B69F66" opacity="0.65"/>
              <circle cx="64" cy="10" r="1" fill="#B69F66" opacity="0.65"/>
            </svg>
          </div>
          <p className="text-[#B69F66] tracking-[1.8em] text-[10px] uppercase font-sans mb-16 opacity-0 animate-fadeInUp [animation-delay:0.3s]">TOKYO WINTER MIDNIGHT COLLECTION</p>
          <h1 className="text-[clamp(3.5rem,12vw,11rem)] font-light text-white leading-[1.2] mb-24 opacity-0 animate-fadeInUp font-luxury-jp [animation-delay:0.5s]">
            冬空の灯
            <span className="text-[clamp(1rem,2vw,2.2rem)] text-[#B69F66]/60 font-light tracking-[1.5em] uppercase mt-8 block font-serif">TOUKA NO AKARI</span>
          </h1>
          <p className="mt-8 text-[11px] tracking-[0.4em] text-white/30 italic">Christmas Special Edition 2025</p>
        </div>
      </section>

      {/* Concept - ゲーリー・ハルバート流：感情を揺さぶるコピー */}
      <section id="concept" className="py-48 relative z-10">
        <h2 className="text-[clamp(3rem,7vw,7rem)] font-light text-white mb-20 text-center leading-tight">
          見慣れた街を、<br />
          <span className="text-[#B69F66] italic">聖夜の傑作</span>へ。
        </h2>
        <p className="text-[#A1A1AA] text-[clamp(1.1rem,2vw,1.8rem)] leading-[2.5] max-w-[1000px] mx-auto text-center px-12 italic">
          ピアノの音色がダイヤモンドのような輝きで描き出す、<br />
          あなたが主役となる至福の物語。<br /><br />
          公式ストア限定の「音とビジュアルの完全体験」をあなたに。
        </p>
        
        {/* 社会的証明の追加 */}
        <div className="max-w-[900px] mx-auto mt-32 px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02]">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">11</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Unique Tracks</div>
          </div>
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02]">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">4K</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Premium Artwork</div>
          </div>
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02]">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">1</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Exclusive Track</div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="py-32 bg-black/20 backdrop-blur-md relative z-10">
        <div className="max-w-[1400px] mx-auto px-12 pb-16">
          <h3 className="text-[2.5rem] font-light text-white tracking-widest uppercase">Tracks</h3>
        </div>
        <div className="max-w-[1400px] mx-auto px-12">
          {tracks.map((track, i) => (
            <div key={i} className={`flex items-center justify-between py-8 px-12 border-b border-white/5 transition-all hover:bg-[#B69F66]/5 ${track.isExclusive ? 'bg-[#B69F66]/[0.06] border-l-2 border-[#B69F66]' : ''}`}>
              <div className="flex items-center">
                <span className="text-xs text-[#B69F66] mr-8">{track.id}</span>
                {track.isExclusive && <span className="px-2.5 py-1 border border-[#B69F66]/70 text-[#B69F66] font-sans text-[9px] tracking-widest uppercase rounded-full mr-3">Exclusive</span>}
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-[1.6rem] text-white font-light">{track.title}</span>
                    {track.canPreview && (
                      <button onClick={togglePlay} className="p-2 rounded-full border border-[#B69F66]/30 text-[#B69F66] hover:bg-[#B69F66] hover:text-black transition-all">
                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1.5 uppercase tracking-wide">{track.desc}</div>
                </div>
              </div>
              <div className="text-xs text-white/20">{track.duration}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="py-48 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-[10px] tracking-[1.2em] text-[#B69F66] uppercase font-black mb-8">Exclusive Ownership</h2>
          <p className="text-[clamp(2rem,5vw,4rem)] font-light text-white">公式ストア限定・プレミアム特典</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1400px] mx-auto px-12">
          <div className="bg-white/[0.02] border border-[#B69F66]/10 p-16 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03]">
            <span className="text-[#B69F66] text-[10px] tracking-[0.4em] font-black uppercase mb-6 block">Premium Track</span>
            <h3 className="text-[2.5rem] text-white font-light mb-8 tracking-tighter">Whispers on the Keys</h3>
            <p className="text-[#B69F66] text-xs font-bold mb-8 tracking-widest">※TuneCore Japan未収録音源</p>
            <ul className="space-y-4 text-white/50 text-sm tracking-widest">
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>公式ストア購入者のみが所有できる独占トラック</li>
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>アルバム未収録の未発表ピアノソロ音源</li>
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>デジタルリマスタリング済み高音質ファイル</li>
            </ul>
          </div>
          <div className="bg-white/[0.02] border border-[#B69F66]/10 p-16 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03]">
            <span className="text-[#B69F66] text-[10px] tracking-[0.4em] font-black uppercase mb-6 block">Brand Assets</span>
            <h3 className="text-[2.5rem] text-white font-light mb-8 tracking-tighter">Artworks Premium Pack</h3>
            <ul className="space-y-4 text-white/50 text-sm tracking-widest mt-12">
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>High-Res Album Cover (4K Resolution)</li>
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>Official Brand Logo & Signature (.png)</li>
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>Exclusive Wallpaper Set (Desktop / Mobile)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Purchase - ジェイ・エイブラハム流：価値の最大化 */}
      <section id="purchase" className="py-48 bg-black relative z-10">
        <div 
          onClick={handlePurchase}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePurchase()}
          tabIndex={0}
          className="max-w-[880px] mx-auto p-16 lg:p-24 bg-[#010308] border border-[#B69F66]/15 cursor-pointer transition-all duration-1000 hover:border-[#B69F66] hover:shadow-[0_0_100px_rgba(182,159,102,0.1)] outline-none focus-visible:ring-1 focus-visible:ring-[#B69F66]/35"
        >
          <div className="text-center">
            <span className="text-[13px] text-[#B69F66] tracking-[0.5em] uppercase font-black mb-4 block font-sans">Christmas Special Edition</span>
            
            <div className="mb-8 flex flex-col items-center gap-3">
              <button 
                onClick={togglePlay} 
                className="w-16 h-16 flex items-center justify-center rounded-full border border-[#B69F66]/40 hover:bg-[#B69F66]/10 transition-all"
              >
                {isPlaying ? <Pause size={24} className="text-[#B69F66]" /> : <Play size={24} className="text-[#B69F66] ml-1" />}
              </button>
              <span className="text-[9px] text-[#B69F66] tracking-widest uppercase font-bold">Listen Preview</span>
            </div>

            <div className="text-[clamp(1.8rem,3vw,2.5rem)] text-white/35 line-through font-['Italiana'] tracking-widest">¥3,880</div>
            <div className="text-[clamp(6rem,10vw,11rem)] text-[#F0ECE4] font-['Italiana'] leading-none my-2 drop-shadow-[0_0_16px_rgba(182,159,102,0.08)]">¥2,440</div>
            <span className="text-[15px] text-[#B69F66]/80 tracking-[0.2em] uppercase block font-sans mt-4 font-bold">37% OFF - Limited Time Only</span>

            <div className="mt-10 flex flex-col items-center gap-5 w-full">
              <ul className="w-full max-w-[620px] space-y-3 text-left p-0 list-none">
                {[
                  '本編10曲＋公式ストア限定 Premium Track 1曲（計11 Tracks）',
                  '購入後すぐにダウンロード（ZIP）＋ 4K Artwork Pack 同梱',
                  '公式ストア限定・Secure Checkout（決済画面へ進みます）',
                  '12月25日23:59まで限定 - この価格は二度と戻りません'
                ].map((item, i) => (
                  <li key={i} className="text-white/55 text-xs tracking-widest flex gap-3 leading-relaxed">
                    <span className="text-[#B69F66] mt-1 opacity-95">•</span>{item}
                  </li>
                ))}
              </ul>

              <button className="w-full max-w-[520px] py-4 px-6 border border-[#B69F66]/75 bg-gradient-to-b from-[#B69F66]/10 to-[#B69F66]/[0.02] text-[#F0ECE4] font-sans text-xs tracking-[0.45em] font-extrabold uppercase text-center transition-all duration-350 hover:bg-[#B69F66]/18 hover:shadow-[0_0_32px_rgba(182,159,102,0.18)] hover:-translate-y-px">
                Get Instant Access Now
              </button>

              <div className="text-[10px] text-white/35 tracking-wider italic leading-loose">
                ※クリック後、決済画面へ移動します。<br />
                音源・画像は購入後に即時取得できます。
              </div>
            </div>

            <div className="mt-14 border-t border-[#B69F66]/20 pt-10">
              <div className="text-[11px] text-[#B69F66]/85 font-black tracking-[0.6em] uppercase animate-[pulse_3s_infinite]">
                Official Store Exclusive
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 bg-black text-center border-t border-[#B69F66]/10 relative z-10">
        <p className="text-[10px] text-white/20 tracking-[0.6em] leading-[2]">© 2025 THE ETERNAL GOLD / TAMAE'S MUSIC LAB.</p>
      </footer>
    </main>
  );
}
