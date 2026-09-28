// src/components/Timer.jsx
import { useEffect, useRef, useState } from 'react';
import { AlarmClock } from 'lucide-react';

// Controlled by an absolute deadline (not a simple decrementing counter) so
// it stays accurate even if the tab is backgrounded/throttled.
export default function Timer({ deadline, onExpire }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
  const expiredRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const secs = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 60;
  const isCritical = remaining <= 15;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors ${
        isCritical ? 'bg-rose-50 text-rose-600 animate-pulse' : isLow ? 'bg-amber-50 text-amber-600' : 'bg-primary-50 text-primary-700'
      }`}
    >
      <AlarmClock size={18} />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
