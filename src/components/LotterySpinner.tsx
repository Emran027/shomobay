'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Trophy, Loader2, Sparkles, PartyPopper, RotateCcw } from 'lucide-react';

const WHEEL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#a855f7', '#14b8a6', '#d946ef',
];

export default function LotterySpinner() {
  const { user, members, fetchMembers, lotteryResults, fetchLotteryResults } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState('');
  const [currentRotation, setCurrentRotation] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef(0);

  const canSpin = !!user?.canSpinLottery || user?.role === 'superadmin';

  // Get eligible members
  const eligibleMembers = members.filter(m => m.isEligibleForLottery);

  useEffect(() => {
    fetchMembers();
    fetchLotteryResults();
  }, [fetchMembers, fetchLotteryResults]);

  // Draw the wheel
  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || eligibleMembers.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const numSlices = eligibleMembers.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Draw outer ring glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fillStyle = color;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slice text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.max(11, Math.min(16, 120 / numSlices))}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;

      const name = eligibleMembers[i].user.name;
      const displayName = name.length > 10 ? name.substring(0, 9) + '…' : name;
      ctx.fillText(displayName, radius * 0.6, 0);
      ctx.restore();
    }

    // Inner circle (hub)
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(center, center, 5, center, center, 28);
    hubGrad.addColorStop(0, '#818cf8');
    hubGrad.addColorStop(1, '#4338ca');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hub text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', center, center);
  }, [eligibleMembers]);

  // Initial draw and redraw on changes
  useEffect(() => {
    drawWheel(currentRotation);
  }, [drawWheel, currentRotation]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const size = Math.min(container.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      drawWheel(rotationRef.current);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawWheel]);

  function spinWheel() {
    if (spinning || eligibleMembers.length === 0) return;

    setSpinning(true);
    setWinner(null);
    setWinnerName('');
    setError('');
    setShowConfetti(false);

    const numSlices = eligibleMembers.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Random winner index
    const winnerIndex = Math.floor(Math.random() * numSlices);

    // Calculate target rotation (spin several full rotations + land on winner)
    // The pointer is at top (3π/2 or -π/2), we need the winner slice center to align with top
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const fullSpins = (5 + Math.random() * 3) * 2 * Math.PI; // 5-8 full spins
    const targetRotation = fullSpins + (2 * Math.PI - targetSliceCenter) + (3 * Math.PI / 2);

    const startRotation = rotationRef.current;
    const totalRotation = targetRotation;
    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function - cubic ease out
      const eased = 1 - Math.pow(1 - progress, 4);

      const rot = startRotation + totalRotation * eased;
      rotationRef.current = rot;
      setCurrentRotation(rot);
      drawWheel(rot);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Spin complete
        setSpinning(false);
        const selectedMember = eligibleMembers[winnerIndex];
        setWinner(selectedMember.user.id);
        setWinnerName(selectedMember.user.name);
        setShowConfetti(true);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }

  async function saveResult() {
    if (!winner) return;
    setSaving(true);
    setError('');

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId: winner, month }),
      });
      const data = await res.json();

      if (data.success) {
        fetchMembers();
        fetchLotteryResults();
        setWinner(null);
        setWinnerName('');
        setShowConfetti(false);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to save result');
    } finally {
      setSaving(false);
    }
  }

  function resetWheel() {
    setWinner(null);
    setWinnerName('');
    setError('');
    setShowConfetti(false);
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy size={24} style={{ color: '#fbbf24' }} />
          Lottery Spinner
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Spin the wheel to select this month&apos;s lucky winner — Prize: ৳10,000
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wheel Section */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            {/* Pointer */}
            <div className="relative flex justify-center">
              {/* The pointer triangle at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: '-2px' }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '28px solid #fbbf24',
                  filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.5))',
                }} />
              </div>

              {/* Canvas */}
              <div className="w-full max-w-[400px] aspect-square pt-4">
                <canvas
                  ref={canvasRef}
                  id="lottery-wheel"
                  className="w-full h-full cursor-pointer"
                  onClick={() => !spinning && spinWheel()}
                />
              </div>
            </div>

            {/* Spin Button - available to everyone for fun */}
            <div className="flex justify-center mt-4 gap-3">
                <button
                  onClick={spinWheel}
                  disabled={spinning || eligibleMembers.length < 2}
                  className="btn-primary px-8 py-3 text-base"
                  id="spin-button"
                  style={{
                    background: spinning
                      ? 'linear-gradient(135deg, #4b5563, #374151)'
                      : 'var(--gradient-primary)',
                  }}
                >
                  {spinning ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Spinning...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} /> Spin the Wheel!
                    </>
                  )}
                </button>
                {winner && (
                  <button onClick={resetWheel} className="btn-secondary" id="reset-button">
                    <RotateCcw size={16} /> Reset
                  </button>
                )}
              </div>

            {eligibleMembers.length < 2 && (
              <p className="text-center mt-3 text-sm" style={{ color: 'var(--warning)' }}>
                Need at least 2 eligible members to run the lottery
              </p>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl text-sm text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Winner Announcement */}
          {winner && showConfetti && (
            <div className="glass-card p-6 text-center pulse-glow fade-in-up"
              style={{
                background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.08))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <PartyPopper size={48} className="mx-auto mb-3" style={{ color: '#fbbf24' }} />
              <h3 className="text-xl font-bold text-white mb-1">🎉 We Have a Winner!</h3>
              <p className="text-3xl font-black mb-2" style={{ color: '#fbbf24' }}>
                {winnerName}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Wins the ৳10,000 prize pool!
              </p>

              {canSpin && (
                <button
                  onClick={saveResult}
                  disabled={saving}
                  className="btn-success px-6 py-2.5"
                  id="save-result-button"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Trophy size={16} /> Confirm & Save Result
                    </>
                  )}
                </button>
              )}
              {!canSpin && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Note: You are spinning for fun. Only the Authorized Spinner can save the official result.
                </p>
              )}
            </div>
          )}

          {/* Eligible Members */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} />
              Eligible Members ({eligibleMembers.length})
            </h3>
            <div className="space-y-2.5">
              {eligibleMembers.map((m, i) => (
                <div key={m.user.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                  style={{
                    background: winner === m.user.id
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(99, 102, 241, 0.05)',
                    border: winner === m.user.id
                      ? '1px solid rgba(245, 158, 11, 0.25)'
                      : '1px solid transparent',
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: WHEEL_COLORS[i % WHEEL_COLORS.length] }}>
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{m.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Contributed: ৳{m.totalContributed.toLocaleString()}
                    </p>
                  </div>
                  {winner === m.user.id && (
                    <Trophy size={16} style={{ color: '#fbbf24' }} />
                  )}
                </div>
              ))}
              {eligibleMembers.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No eligible members
                </p>
              )}
            </div>
          </div>

          {/* Ineligible Members */}
          {members.filter(m => !m.isEligibleForLottery).length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-base font-bold text-white mb-3">
                Ineligible (Have Debt)
              </h3>
              <div className="space-y-2">
                {members.filter(m => !m.isEligibleForLottery).map(m => (
                  <div key={m.user.id} className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: 'rgba(239, 68, 68, 0.06)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white opacity-50"
                        style={{ background: m.user.avatarColor }}>
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white opacity-60">{m.user.name}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#f87171' }}>
                      ৳{m.totalDebt.toLocaleString()} debt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lottery History */}
      {lotteryResults.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-white mb-4">Past Results</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Winner</th>
                  <th>Prize</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {lotteryResults.slice().reverse().map(r => (
                  <tr key={r.id}>
                    <td data-label="Month">
                      <span className="font-semibold text-white">{r.month}</span>
                    </td>
                    <td data-label="Winner">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} style={{ color: '#fbbf24' }} />
                        <span className="font-semibold text-white">{r.winnerName}</span>
                      </div>
                    </td>
                    <td data-label="Prize">
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        ৳{r.prizeAmount.toLocaleString()}
                      </span>
                    </td>
                    <td data-label="Date">
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.drawnAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
