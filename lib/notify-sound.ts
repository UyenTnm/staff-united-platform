// lib/notify-sound.ts
//
// Trình duyệt CHẶN AudioContext phát tự động nếu chưa có tương tác
// người dùng nào (click/gõ phím) trong tab đó — đây là lý do âm
// thanh "không phát" dù code không lỗi gì. Giải pháp: tạo 1
// AudioContext DUY NHẤT (persistent), "mở khóa" ngay lần tương tác
// đầu tiên (bất kỳ click/keydown nào trên trang), dùng lại cho mọi
// lần phát sau.

let sharedCtx: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    sharedCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return sharedCtx;
}

export function unlockAudio() {
  if (unlocked) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  unlocked = true;
}

// Gọi hàm này 1 lần khi component mount — tự động gắn listener bắt
// tương tác ĐẦU TIÊN của người dùng để mở khóa âm thanh.
export function setupAudioUnlock() {
  if (typeof window === "undefined") return;
  const handler = () => {
    unlockAudio();
    window.removeEventListener("click", handler);
    window.removeEventListener("keydown", handler);
  };
  window.addEventListener("click", handler);
  window.addEventListener("keydown", handler);
}

export function playNotifySound() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.error("Failed to play sound:", err);
  }
}
