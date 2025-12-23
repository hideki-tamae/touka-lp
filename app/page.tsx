"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Shield } from 'lucide-react';

export default function Page() {
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

  const testimonials = [
    {
      text: "冬の孤独が、美しい時間に変わりました。最先端の音楽技術とアーティストの感性が融合した、心に響く音色です。深夜に一人で聴くと、自分だけの特別な世界に包まれる感覚があります。",
      author: "M.K.",
      location: "30代・東京"
    },
    {
      text: "プレゼントとして購入しましたが、自分用にもリピート購入しました。表題曲『冬空の灯』は何度聴いても飽きない魔法のような曲です。",
      author: "S.T.",
      location: "40代・大阪"
    },
    {
      text: "11曲すべて異なるボーカルという試みが素晴らしい。まるで11人のアーティストによる冬のコンピレーションアルバムのよう。4Kアートワークも部屋に飾っています。",
      author: "R.N.",
      location: "20代・福岡"
    }
  ];

  const faqs = [
    {
      q: "各曲でボーカルが異なるとのことですが、品質は大丈夫ですか？",
      a: "はい。各曲には異なるボーカリストの個性が反映されていますが、全てアーティストの厳格な監修のもと、何度も調整を重ねた高品質な作品です。むしろ、単一のボーカルでは表現できない多様な感情表現を実現しています。"
    },
    {
      q: "購入後、どのように音源を受け取れますか？",
      a: "決済完了後、アルバム本編（全11曲のMP3＋4Kアートワークパック）は、即座にダウンロードリンクが表示されます（メールでもリンクが送信されます）。期間限定の特典（Bonus Track Pack / Behind the Keys / 各種ボーナス）は、準備が整い次第、ご購入から14日以内にダウンロードURLを購入時メールアドレス宛に順次お送りします。なお、先行視聴権・クーポンは2026年新作リリース時にメールでご案内します。"
    },
    {
      q: "ストリーミングサービスでも聴けますか？",
      a: "TuneCore Japanを通じて主要ストリーミングサービスで配信予定ですが、公式ストア限定トラック「Whispers on the Keys」は、こちらでのみ入手可能です。"
    },
    {
      q: "返金保証はありますか？",
      a: "購入後にダウンロードしたファイルに技術的な不具合（ファイル破損、再生不可等）があった場合は、まずファイルの再送付で対応いたします。それでも解決しない場合に限り、返金対応いたします。購入後7日以内にサポートまでご連絡ください。なお、お客様の環境（インターネット接続、デバイス互換性等）に起因する問題は対象外となります。"
    },
    {
      q: "プレゼント用に購入できますか？",
      a: "もちろんです。デジタルグリーティングカードも同梱されており、大切な方への贈り物に最適です。購入後、ダウンロードリンクを贈りたい方にお渡しください。"
    }
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

      {/* Nav */}
      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-700 ${isScrolled ? 'bg-[#010308]/90 backdrop-blur-3xl py-6 border-b border-[#B69F66]/10' : 'py-12 bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-12 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-light tracking-[0.6em] text-white uppercase">HIDEKI TAMAE</div>
              <div className="text-[9px] tracking-[0.5em] text-[#B69F66] mt-2 font-sans font-bold uppercase">PREMIUM RELEASE</div>
            </div>
            
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
            <a href="#voices" className="hover:text-[#B69F66] transition-colors">Voices</a>
          </div>
        </div>
      </nav>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-[#010308]/95 backdrop-blur-3xl border-t border-[#B69F66]/30 z-[2000] py-5">
        <div className="max-w-[1600px] mx-auto px-12 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.4em] text-[#B69F66] font-black uppercase mb-1 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" 
                      stroke="#B69F66" 
                      strokeWidth="1.5" 
                      fill="rgba(182, 159, 102, 0.1)"/>
              </svg>
              Christmas Limited Edition
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
            <span className="text-[8px] tracking-[0.25em] opacity-75 italic font-normal">¥5,980 / Early Believer</span>
          </button>
        </div>
      </div>

      {/* Hero */}
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

      {/* 緊急告知バナー */}
      <section className="py-8 bg-[#B69F66]/10 backdrop-blur-md relative z-10 border-y border-[#B69F66]/30">
        <div className="max-w-[1000px] mx-auto px-12 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" 
                      stroke="#B69F66" 
                      strokeWidth="1.5" 
                      fill="rgba(182, 159, 102, 0.2)"/>
              </svg>
              <span className="text-[#B69F66] text-sm font-black tracking-[0.3em] uppercase">
                Christmas Final Hours
              </span>
            </div>
            <div className="text-white/70 text-sm tracking-wider">
              Early Believer称号は<span className="text-[#B69F66] font-bold">本日23:59</span>で永久終了
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-16 bg-black/20 backdrop-blur-md relative z-10 border-y border-[#B69F66]/10">
        <div className="max-w-[1200px] mx-auto px-12 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-20">
          <div className="text-center">
            <div className="text-5xl font-light text-[#B69F66] mb-2">500+</div>
            <div className="text-xs text-white/40 tracking-widest uppercase">Early Supporters</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-light text-[#B69F66] mb-2 flex items-center justify-center gap-3">
              4.8
              <div className="w-7 h-7 rounded-full border-2 border-[#B69F66] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#B69F66]"></div>
              </div>
            </div>
            <div className="text-xs text-white/40 tracking-widest uppercase">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-light text-[#B69F66] mb-2">94%</div>
            <div className="text-xs text-white/40 tracking-widest uppercase">Recommend Rate</div>
          </div>
        </div>
      </section>

      {/* Concept */}
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
        
        <div className="max-w-[900px] mx-auto mt-32 px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">11</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Unique Tracks</div>
          </div>
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">4K</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Premium Artwork</div>
          </div>
          <div className="border border-[#B69F66]/10 p-8 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
            <div className="text-[3rem] font-light text-[#B69F66] mb-2">1</div>
            <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase">Exclusive Track</div>
          </div>
        </div>
      </section>

      {/* Story Behind */}
      <section className="py-48 relative z-10 bg-black/10">
        <div className="max-w-[900px] mx-auto px-12">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light text-white mb-16 text-center leading-tight">
            なぜ、この冬、<br />
            <span className="text-[#B69F66] italic">あなたの心に寄り添う唯一の灯火</span><br />
            になるのか？
          </h2>
          
          <div className="space-y-10 text-white/60 leading-loose text-lg">
            <p>
              2025年の冬、東京の夜、一人のアーティストが
              最先端の技術と共に紡いだ11の物語。
            </p>
            <p>
              それは、見慣れた街の風景を、
              聖夜の傑作へと変える魔法でした。
            </p>
            <p>
              忙しい日々に疲れたあなたへ。<br />
              孤独を感じる夜に寄り添う音楽を。<br />
              誰にも邪魔されない、あなただけの特別な時間を。
            </p>
            <p className="text-[#B69F66] italic text-2xl text-center mt-16">
              「この音楽は、今夜のあなただけのために」
            </p>
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

      {/* What You'll Get */}
      <section className="py-48 relative z-10">
        <div className="max-w-[1000px] mx-auto px-12 text-center">
          <h3 className="text-[clamp(2.5rem,5vw,4rem)] font-light text-white mb-20">
            購入後、あなたが手にするもの
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
            <div className="p-10 border border-[#B69F66]/10 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
              <div className="w-16 h-16 mb-6 mx-auto border border-[#B69F66]/20 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="#B69F66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="text-white text-xl mb-4 font-light">心の安らぎ</h4>
              <p className="text-white/50 text-sm leading-relaxed">
                忙しい日々の中で、自分だけの特別な時間を持てるようになります。深夜の静寂の中、ピアノの音色があなたを包み込みます。
              </p>
            </div>
            
            <div className="p-10 border border-[#B69F66]/10 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
              <div className="w-16 h-16 mb-6 mx-auto border border-[#B69F66]/20 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7h-4V4c0-.6-.4-1-1-1h-5c-.6 0-1 .4-1 1v3H5c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h15c.6 0 1-.4 1-1V8c0-.6-.4-1-1-1zM11 5h3v2h-3V5zm9 14H5V9h15v10z" fill="#B69F66"/>
                  <circle cx="12" cy="14" r="2" stroke="#B69F66" strokeWidth="1.5"/>
                </svg>
              </div>
              <h4 className="text-white text-xl mb-4 font-light">特別な贈り物</h4>
              <p className="text-white/50 text-sm leading-relaxed">
                大切な人へのクリスマスプレゼントとして。デジタルグリーティングカード付きで、心のこもった贈り物になります。
              </p>
            </div>
            
            <div className="p-10 border border-[#B69F66]/10 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
              <div className="w-16 h-16 mb-6 mx-auto border border-[#B69F66]/20 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#B69F66" strokeWidth="1.5"/>
                  <path d="M3 9h18M9 3v18" stroke="#B69F66" strokeWidth="1.5"/>
                  <circle cx="15" cy="15" r="2" fill="#B69F66"/>
                </svg>
              </div>
              <h4 className="text-white text-xl mb-4 font-light">プレミアム体験</h4>
              <p className="text-white/50 text-sm leading-relaxed">
                4K高解像度のアートワーク、ロゴ、壁紙セット。音楽だけでなく、視覚的な美しさもあなたの日常を彩ります。
              </p>
            </div>
            
            <div className="p-10 border border-[#B69F66]/10 bg-white/[0.02] transition-all hover:border-[#B69F66]/30">
              <div className="w-16 h-16 mb-6 mx-auto border border-[#B69F66]/20 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#B69F66" strokeWidth="1.5"/>
                  <path d="M12 11V7M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="#B69F66" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="#B69F66"/>
                </svg>
              </div>
              <h4 className="text-white text-xl mb-4 font-light">限定所有権</h4>
              <p className="text-white/50 text-sm leading-relaxed">
                公式ストア購入者のみが所有できる限定トラック「Whispers on the Keys」。他では手に入らない特別な音源です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="voices" className="py-48 relative z-10 bg-black/20">
        <div className="max-w-[1200px] mx-auto px-12">
          <div className="text-center mb-20">
            <h3 className="text-[10px] tracking-[1em] text-[#B69F66] uppercase mb-8 font-black">Voices from Listeners</h3>
            <p className="text-[clamp(2rem,4vw,3rem)] font-light text-white">購入者の声</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="border border-[#B69F66]/10 p-10 bg-white/[0.02] transition-all hover:border-[#B69F66]/30 hover:bg-[#B69F66]/[0.03]">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                            fill="#B69F66"/>
                    </svg>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-8 italic">
                  「{testimonial.text}」
                </p>
                <div className="border-t border-[#B69F66]/10 pt-6">
                  <p className="text-[#B69F66]/80 text-xs tracking-wider font-bold">
                    {testimonial.author}
                  </p>
                  <p className="text-white/30 text-xs tracking-wider mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-48 relative z-10">
        <div className="max-w-[900px] mx-auto px-12">
          <h3 className="text-[clamp(2.5rem,5vw,4rem)] font-light text-white mb-20 text-center">
            よくあるご質問
          </h3>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <details key={i} className="border border-[#B69F66]/10 p-8 bg-white/[0.02] transition-all hover:border-[#B69F66]/30 group">
                <summary className="text-white font-light text-lg cursor-pointer list-none flex justify-between items-center">
                  <span>{faq.q}</span>
                  <span className="text-[#B69F66] text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-white/60 mt-6 leading-relaxed text-[15px]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="py-48 relative z-10 bg-black/10">
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
              <li className="flex items-center"><span className="text-[#B69F66] mr-4">•</span>Digital Greeting Card for Gift</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BONUS Section - 特典セクション（新規追加） */}
      <section className="py-32 relative z-10 bg-gradient-to-b from-black/10 to-black/30">
        <div className="max-w-[1200px] mx-auto px-12">
          
          {/* セクションヘッダー */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-2 border border-[#B69F66]/50 rounded-full mb-8 bg-[#B69F66]/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" 
                      stroke="#B69F66" 
                      strokeWidth="1.5" 
                      fill="rgba(182, 159, 102, 0.2)"/>
              </svg>
              <span className="text-[#B69F66] text-sm font-black tracking-[0.3em] uppercase">
                Limited Time Bonuses
              </span>
            </div>
            
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white mb-6">
              今だけの<span className="text-[#B69F66] italic">特別特典</span>
            </h2>
            
            <p className="text-white/50 text-lg tracking-wider">
              本日23:59までの購入者限定 - 参考価格<span className="text-[#B69F66] font-bold">¥17,400相当</span>を無料進呈
            </p>
          </div>

          {/* 特典グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 特典1: Bonus Track Pack */}
            <div className="relative border border-[#B69F66]/20 bg-white/[0.02] p-10 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03] group">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#B69F66] text-black text-[9px] font-black tracking-widest uppercase rounded-full">
                New
              </div>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#B69F66]/30 to-[#B69F66]/10 border border-[#B69F66]/40 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#B69F66" strokeWidth="1.5"/>
                    <path d="M10 8l6 4-6 4V8z" fill="#B69F66"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-light mb-3 tracking-tight">
                    Bonus Track Pack #1
                  </h3>
                  <p className="text-[#B69F66] text-sm font-bold mb-4 tracking-widest">
                    Extended Midnight + Silent Echoes
                  </p>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>「冬空の灯」拡張版 - 7分超のロングバージョン</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>未収録の追加ピアノソロセクション収録</span>
                    </li>
                    {/* ★追加：改行 + Silent echoes（モバイル崩れ防止） */}
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>
                        冬の余韻を深めるボーナストラック
                        <span className="block mt-1 text-[#B69F66] font-bold tracking-widest">
                          Silent echoes
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>本日購入者のみ永久取得（非売品）</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-[#B69F66]/10 pt-4 flex justify-between items-center">
                <span className="text-white/40 text-xs tracking-wider">参考価格</span>
                <span className="text-[#B69F66] text-xl font-['Italiana']">¥2,980</span>
              </div>
            </div>

            {/* 特典2: Behind the Keys（PDF + Audio） */}
            <div className="relative border border-[#B69F66]/20 bg-white/[0.02] p-10 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03] group">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#B69F66] text-black text-[9px] font-black tracking-widest uppercase rounded-full">
                Exclusive
              </div>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#B69F66]/30 to-[#B69F66]/10 border border-[#B69F66]/40 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h10" stroke="#B69F66" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="2" y="3" width="20" height="18" rx="2" stroke="#B69F66" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-light mb-3 tracking-tight">
                    Bonus Book #2
                  </h3>
                  <p className="text-[#B69F66] text-sm font-bold mb-4 tracking-widest">
                    「Behind the Keys」セルフライナーノーツ完全版
                  </p>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>全11曲：制作背景・聴きどころ・意図（PDF 18〜24p）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>「なぜこの音なのか」意思決定の記録（コンセプト／構造）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>このアルバムの“正しい聴き方”ガイド（夜・順番・余韻）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>購入者限定：音声解説（10〜15分 / mp3）</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-[#B69F66]/10 pt-4 flex justify-between items-center">
                <span className="text-white/40 text-xs tracking-wider">参考価格</span>
                <span className="text-[#B69F66] text-xl font-['Italiana']">¥3,980</span>
              </div>
            </div>

            {/* 特典3: ビジュアルパック */}
            <div className="relative border border-[#B69F66]/20 bg-white/[0.02] p-10 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03] group">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#B69F66]/20 text-[#B69F66] text-[9px] font-black tracking-widest uppercase rounded-full border border-[#B69F66]/50">
                Digital
              </div>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#B69F66]/30 to-[#B69F66]/10 border border-[#B69F66]/40 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" stroke="#B69F66" strokeWidth="1.5" fill="rgba(182, 159, 102, 0.2)"/>
                    <rect x="14" y="3" width="7" height="7" stroke="#B69F66" strokeWidth="1.5" fill="rgba(182, 159, 102, 0.1)"/>
                    <rect x="3" y="14" width="7" height="7" stroke="#B69F66" strokeWidth="1.5" fill="rgba(182, 159, 102, 0.15)"/>
                    <rect x="14" y="14" width="7" height="7" stroke="#B69F66" strokeWidth="1.5" fill="rgba(182, 159, 102, 0.25)"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-light mb-3 tracking-tight">
                    Bonus Assets #3
                  </h3>
                  <p className="text-[#B69F66] text-sm font-bold mb-4 tracking-widest">
                    プレミアム・ビジュアルパック完全版
                  </p>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>全11曲の個別アートワーク（4K解像度）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>デスクトップ壁紙 5種 + モバイル壁紙 10種</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>SNS投稿用テンプレート（Instagram/X対応）</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-[#B69F66]/10 pt-4 flex justify-between items-center">
                <span className="text-white/40 text-xs tracking-wider">参考価格</span>
                <span className="text-[#B69F66] text-xl font-['Italiana']">¥3,980</span>
              </div>
            </div>

            {/* 特典4: VIPアクセス */}
            <div className="relative border border-[#B69F66]/20 bg-white/[0.02] p-10 transition-all hover:border-[#B69F66] hover:bg-[#B69F66]/[0.03] group">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#B69F66] to-[#D4AF37] text-black text-[9px] font-black tracking-widest uppercase rounded-full">
                VIP
              </div>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#B69F66]/30 to-[#B69F66]/10 border border-[#B69F66]/40 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" 
                          stroke="#B69F66" 
                          strokeWidth="1.5" 
                          fill="rgba(182, 159, 102, 0.2)"/>
                    <circle cx="12" cy="12" r="3" fill="#B69F66"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-light mb-3 tracking-tight">
                    Bonus Access #4
                  </h3>
                  <p className="text-[#B69F66] text-sm font-bold mb-4 tracking-widest">
                    2026年新作の先行視聴権 + 20% OFF
                  </p>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>次回アルバム発売の1週間前に先行視聴</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>購入時に使える20%OFFクーポン進呈</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B69F66] mt-1">•</span>
                      <span>Early Believer限定の永久特権</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-[#B69F66]/10 pt-4 flex justify-between items-center">
                <span className="text-white/40 text-xs tracking-wider">参考価格</span>
                <span className="text-[#B69F66] text-xl font-['Italiana']">¥6,460</span>
              </div>
            </div>

          </div>

          {/* 合計価値の強調 */}
          <div className="mt-16 p-12 border-2 border-[#B69F66]/30 bg-gradient-to-br from-[#B69F66]/5 to-transparent rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-white/60 text-sm tracking-wider mb-2">特典総額（4つ合計 / 参考価格）</p>
                <p className="text-white/40 text-3xl line-through font-['Italiana'] mb-1">¥17,400</p>
                <p className="text-[#B69F66] text-lg tracking-widest font-bold">
                  → 本日限定で<span className="text-4xl mx-2">完全無料</span>
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="px-6 py-3 bg-[#B69F66]/10 border border-[#B69F66]/50 rounded-full">
                  <p className="text-[#B69F66] text-sm font-black tracking-[0.3em] uppercase">
                    23:59で消滅
                  </p>
                </div>
                <p className="text-white/50 text-xs tracking-wider italic">
                  明日以降は一切入手不可
                </p>
              </div>
            </div>

            {/* 送付注記（BASE向け） */}
            <div className="mt-10 border-t border-[#B69F66]/15 pt-8">
              <div className="text-[11px] text-white/45 tracking-wider leading-loose">
                <span className="text-[#B69F66] font-bold tracking-[0.25em]">【特典の送付について】</span><br />
                特典はデジタルコンテンツです。準備が整い次第、<span className="text-[#B69F66] font-bold">ご購入から14日以内</span>にダウンロードURLを購入時メールアドレス宛に順次お送りします。<br />
                Bonus Access（先行視聴権・クーポン）は、2026年新作リリース時にメールでご案内します。迷惑メールフォルダもご確認ください。
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Purchase - Final CTA */}
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

            {/* アンカー価格表示 */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="text-[2rem] text-white/30 line-through font-['Italiana'] tracking-wider">¥23,380</div>
                <div className="px-4 py-1.5 bg-[#B69F66]/15 border border-[#B69F66]/50 rounded-full">
                  <span className="text-[#B69F66] text-sm font-black tracking-wider">74% OFF</span>
                </div>
              </div>
              <div className="text-[10px] text-white/40 tracking-wider">本体＋特典の総額（¥5,980 + ¥17,400 / 参考価格）</div>
            </div>

            <div className="text-[clamp(6rem,10vw,11rem)] text-[#F0ECE4] font-['Italiana'] leading-none my-2 drop-shadow-[0_0_16px_rgba(182,159,102,0.08)]">¥5,980</div>
            <span className="text-[15px] text-[#B69F66]/80 tracking-[0.2em] uppercase block font-sans mt-4 font-bold">Early Believer Special Price</span>
            <span className="text-[11px] text-white/50 tracking-wider block mt-2">12月24日より¥7,980に値上げ</span>

            <div className="mt-10 flex flex-col items-center gap-5 w-full">
              <ul className="w-full max-w-[620px] space-y-3 text-left p-0 list-none">
                {[
                  '本編10曲＋公式ストア限定 Premium Track 1曲（計11 Tracks）',
                  '購入後すぐにダウンロード（ZIP）＋ 4K Artwork Pack 同梱',
                  'デジタルグリーティングカード付き - 贈り物に最適',
                  '【本日限定】4つの特別特典（参考価格¥17,400相当）を完全無料で進呈',
                  '特典は購入後14日以内にメールで順次送付（先行視聴権・クーポンは2026年に案内）',
                  '公式ストア限定・Secure Checkout（決済画面へ進みます）'
                ].map((item, i) => (
                  <li key={i} className={`text-white/55 text-xs tracking-widest flex gap-3 leading-relaxed ${i === 3 ? 'text-[#B69F66] font-bold' : ''}`}>
                    <span className="text-[#B69F66] mt-1 opacity-95">•</span>{item}
                  </li>
                ))}
              </ul>

              <button className="w-full max-w-[520px] py-4 px-6 border border-[#B69F66]/75 bg-gradient-to-b from-[#B69F66]/10 to-[#B69F66]/[0.02] text-[#F0ECE4] font-sans text-xs tracking-[0.45em] font-extrabold uppercase text-center transition-all duration-350 hover:bg-[#B69F66]/18 hover:shadow-[0_0_32px_rgba(182,159,102,0.18)] hover:-translate-y-px">
                Get Instant Access Now
              </button>

              {/* ファイル品質保証 */}
              <div className="mt-6 flex items-center justify-center gap-3 text-[#B69F66]/80 text-sm tracking-wider">
                <Shield size={18} strokeWidth={1.5} />
                <span>ファイル品質保証 - 不具合時は再送付またはご返金対応いたします</span>
              </div>

              <div className="text-[10px] text-white/35 tracking-wider italic leading-loose mt-4">
                ※クリック後、決済画面へ移動します。<br />
                本編の音源・画像は購入後すぐ取得できます。期間限定特典は購入後14日以内にメールで順次送付します。
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
