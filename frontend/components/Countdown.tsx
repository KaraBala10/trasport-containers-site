'use client';

import { useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface CountdownProps {
  language: Language;
  targetDate: Date;
}

export default function Countdown({ language, targetDate }: CountdownProps) {
  // Use a fixed initial value to match SSR and CSR
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const totalSeconds = Math.floor(difference / 1000);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;
        
        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately after mount
    calculateTimeLeft();
    
    // Use requestAnimationFrame for better performance
    let rafId: number;
    let lastUpdate = Date.now();
    
    const updateCountdown = () => {
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        calculateTimeLeft();
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(updateCountdown);
    };
    
    rafId = requestAnimationFrame(updateCountdown);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [targetDate]);

  const translations = {
    ar: { days: 'يوم', hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية' },
    en: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
  };

  const t = translations[language];

  // Render placeholder during SSR to match structure
  if (!isMounted) {
    return (
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
          <div className="text-4xl font-bold text-white">0</div>
          <div className="text-sm text-white opacity-90">{t.days}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
          <div className="text-4xl font-bold text-white">0</div>
          <div className="text-sm text-white opacity-90">{t.hours}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
          <div className="text-4xl font-bold text-white">0</div>
          <div className="text-sm text-white opacity-90">{t.minutes}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
          <div className="text-4xl font-bold text-white">0</div>
          <div className="text-sm text-white opacity-90">{t.seconds}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
        <div className="text-4xl font-bold text-white">{String(timeLeft.days)}</div>
        <div className="text-sm text-white opacity-90">{t.days}</div>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
        <div className="text-4xl font-bold text-white">{String(timeLeft.hours)}</div>
        <div className="text-sm text-white opacity-90">{t.hours}</div>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
        <div className="text-4xl font-bold text-white">{String(timeLeft.minutes)}</div>
        <div className="text-sm text-white opacity-90">{t.minutes}</div>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 text-center min-w-[100px]">
        <div className="text-4xl font-bold text-white">{String(timeLeft.seconds)}</div>
        <div className="text-sm text-white opacity-90">{t.seconds}</div>
      </div>
    </div>
  );
}
