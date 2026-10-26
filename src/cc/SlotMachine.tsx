import { useEffect, useRef, useState } from 'react';
import { ccArt, ccExtras } from '@/assets/registry';
import { Button, Chip, HandLabel, PaperCard } from '@/components/primitives';
import { cutoutLabel } from '@/lib/answerDisplay';
import { BETS, REEL_STOPS_MS, ROLL_LENGTH, type Bet } from './config';
import { Reel, type ReelRoll } from './Reel';
import { isJackpot, matchingReels, payoutFor, randomSymbols, spinReels, type Reels } from './slots';

const symbols = Object.keys(ccArt.symbols).sort();

/** A moment after the last reel settles, so its bounce finishes before the result shows. */
const SETTLE_MS = 150;

/** The confetti GIF plays once, in 0.84 seconds; it is removed as it finishes. */
const CONFETTI_MS = 850;

type SlotMachineProps = {
  coins: number;
  /** Called on the pull: the bet is gone the moment the reels start. */
  onBet: (bet: number) => void;
  /** Called when the last reel lands, with whatever the spin won. */
  onWin: (winnings: number) => void;
};

/**
 * Three reels, a bet and a button. The result is decided the moment the button is
 * pressed; the rolling is only for show, and is skipped for anyone who has asked
 * their device for reduced motion.
 */
export function SlotMachine({ coins, onBet, onWin }: SlotMachineProps) {
  const [bet, setBet] = useState<Bet>(BETS[0]);
  const [rolls, setRolls] = useState<ReelRoll[]>(restingRolls);
  const [won, setWon] = useState([false, false, false]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [confetti, setConfetti] = useState(0);
  const timer = useRef(0);
  const confettiTimer = useRef(0);
  /** Counts every burst this visit and never resets, so no two bursts share an address. */
  const bursts = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(confettiTimer.current);
    },
    [],
  );

  if (symbols.length === 0) {
    return <Unstocked />;
  }

  const pull = () => {
    const result = spinReels(symbols);
    const winnings = payoutFor(result, bet);
    const still = reducedMotion();

    onBet(bet);
    setSpinning(true);
    setMessage('');
    setWon([false, false, false]);
    setRolls((current) => current.map((roll, index) => nextRoll(roll, result[index], index, still)));

    timer.current = window.setTimeout(
      () => {
        setSpinning(false);
        setWon(matchingReels(result));
        setMessage(describe(result, bet, winnings));
        onWin(winnings);
        if (new Set(result).size === 1 && !still) {
          celebrate();
        }
      },
      still ? 0 : REEL_STOPS_MS[REEL_STOPS_MS.length - 1] + SETTLE_MS,
    );
  };

  /**
   * A burst of confetti over the machine. Browsers keep one animation clock per
   * image address, so each burst loads under a new one to play from its first frame.
   */
  const celebrate = () => {
    bursts.current += 1;
    setConfetti(bursts.current);
    window.clearTimeout(confettiTimer.current);
    confettiTimer.current = window.setTimeout(() => setConfetti(0), CONFETTI_MS);
  };

  return (
    <PaperCard>
      {confetti > 0 && (
        <img
          key={confetti}
          src={`${ccExtras.confetti}?burst=${confetti}`}
          alt=""
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover"
        />
      )}
      <HandLabel as="h2" size="lg" className="mb-3 block">
        Casino
      </HandLabel>

      <div className="grid grid-cols-3 gap-2 rounded-card bg-ink/10 p-2" aria-busy={spinning}>
        {rolls.map((roll, index) => (
          <Reel key={`${index}-${roll.id}`} roll={roll} won={won[index]} />
        ))}
      </div>

      <p className="mt-3 min-h-6 text-center font-bold text-ink" aria-live="polite">
        {message}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2" role="group" aria-labelledby="slots-bet">
        <span id="slots-bet" className="text-sm text-faded">
          Bet
        </span>
        {BETS.map((amount) => (
          <Chip key={amount} label={String(amount)} selected={bet === amount} onClick={() => setBet(amount)} />
        ))}
      </div>

      <Button variant="keep" onClick={pull} disabled={spinning || coins < bet} className="mt-3 w-full">
        {spinning ? 'Spinning…' : `Spin for ${bet}`}
      </Button>

      {coins < BETS[0] && !spinning && (
        <p className="mt-2 text-center text-sm text-ink-soft">Out of coins. Clock in below to earn more.</p>
      )}
    </PaperCard>
  );
}

/** Before the first spin: three different symbols sitting still. */
function restingRolls(): ReelRoll[] {
  return [0, 1, 2].map((index) => ({ id: 0, strip: [symbols[index % symbols.length]], durationMs: 0 }));
}

/**
 * From where the reel last stopped, through a run of random symbols, to where it
 * lands. Later reels roll further and for longer, so they stop left to right.
 */
function nextRoll(previous: ReelRoll, landing: string, index: number, still: boolean): ReelRoll {
  if (still) {
    return { id: previous.id + 1, strip: [landing], durationMs: 0 };
  }

  const resting = previous.strip[previous.strip.length - 1];
  const filler = randomSymbols(symbols, ROLL_LENGTH + index * 6);

  return { id: previous.id + 1, strip: [resting, ...filler, landing], durationMs: REEL_STOPS_MS[index] };
}

function describe(reels: Reels, bet: number, winnings: number): string {
  if (winnings === 0) {
    return `No match. −${bet}`;
  }
  if (isJackpot(reels)) {
    return `Jackpot! +${winnings}`;
  }
  if (new Set(reels).size === 1) {
    return `Three ${cutoutLabel(reels[0])}! +${winnings}`;
  }
  return 'A pair. Your bet back.';
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Unstocked() {
  return (
    <PaperCard>
      <HandLabel as="h2" size="lg" className="block">
        Casino
      </HandLabel>
      <p className="mt-2 text-sm text-ink-soft">The machine has no symbols yet.</p>
    </PaperCard>
  );
}
