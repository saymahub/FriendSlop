import { useEffect, useRef, useState } from 'react';
import { ccArt } from '@/assets/registry';
import { Button, HandLabel, PaperCard } from '@/components/primitives';
import { newCustomer, patienceLeft, tipFor, whoOrdered, type Customer } from './cafe';
import { CAFE } from './config';
import { articleFor, menu, menuItem, type MenuItem } from './menu';

const looks = Object.keys(ccArt.customers).sort();
const menuKeys = menu.map((item) => item.key);

/** How often patience bars update. */
const TICK_MS = 250;

/**
 * Customers walk in and order a drink or something to eat; tap it on the shelf to
 * hand it to whoever ordered it first. Nothing happens until the café is opened,
 * so a page left open does not fill with customers walking out.
 */
export function CafeCounter({ onTip }: { onTip: (tip: number) => void }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState('');
  const nextId = useRef(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const clock = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      setCustomers((waiting) => waiting.filter((customer) => patienceLeft(customer, time) > 0));
    }, TICK_MS);

    const walkIn = () =>
      setCustomers((waiting) =>
        waiting.length >= CAFE.maxWaiting ? waiting : [...waiting, newCustomer(nextId.current++, looks, menuKeys, Date.now())],
      );

    // The first customer is already at the door when the café opens.
    walkIn();
    const door = window.setInterval(walkIn, CAFE.arrivalMs);

    return () => {
      window.clearInterval(clock);
      window.clearInterval(door);
    };
  }, [open]);

  if (menu.length === 0) {
    return <Unstocked />;
  }

  const serve = (item: MenuItem) => {
    const customer = whoOrdered(customers, item.key);

    if (!customer) {
      setMessage(`Nobody ordered ${articleFor(item.label)} ${item.label}.`);
      return;
    }

    const tip = tipFor(customer, Date.now());
    setCustomers((waiting) => waiting.filter((other) => other.id !== customer.id));
    setMessage(`${item.label} served. +${tip} tip`);
    onTip(tip);
  };

  const toggle = () => {
    setOpen((wasOpen) => !wasOpen);
    setCustomers([]);
    setMessage('');
  };

  return (
    <PaperCard>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <HandLabel as="h2" size="lg" className="block">
          Café
        </HandLabel>
        <Button variant={open ? 'quiet' : 'keep'} onClick={toggle}>
          {open ? 'Close up' : 'Open the café'}
        </Button>
      </div>

      {open && (
        <>
          <Queue customers={customers} now={now} />
          <p className="mt-2 min-h-6 text-center text-sm font-bold text-ink" aria-live="polite">
            {message}
          </p>
          <Shelf onServe={serve} />
        </>
      )}

      {!open && <p className="text-sm text-ink-soft">Serve orders for tips, then spend them in the casino.</p>}
    </PaperCard>
  );
}

function Queue({ customers, now }: { customers: Customer[]; now: number }) {
  if (customers.length === 0) {
    return <p className="py-6 text-center text-sm text-faded">Waiting for customers…</p>;
  }

  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Customers waiting">
      {customers.map((customer) => {
        const order = menuItem(customer.wants);

        return (
          <li key={customer.id} className="flex flex-col items-center gap-1 text-center">
            {looks.length > 0 && (
              <img src={ccArt.customers[customer.look]} alt="" className="h-16 w-16 object-contain" />
            )}
            {order && (
              <span className="text-xs text-ink-soft">
                Wants {articleFor(order.label)} <span className="font-bold text-ink">{order.label}</span>
              </span>
            )}
            <PatienceBar left={patienceLeft(customer, now)} />
          </li>
        );
      })}
    </ul>
  );
}

/** Drains as they wait, turning to the warning colour in the last third. */
function PatienceBar({ left }: { left: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-chip bg-paper-edge" aria-hidden="true">
      <span
        style={{ width: `${left * 100}%` }}
        className={`block h-full ${left > 1 / 3 ? 'bg-progress-75' : 'bg-allergy'}`}
      />
    </span>
  );
}

/** Everything on the menu to hand out. Names sit under each so nobody has to guess. */
function Shelf({ onServe }: { onServe: (item: MenuItem) => void }) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="group" aria-label="Menu">
        {menu.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onServe(item)}
            className="overflow-hidden rounded-card border-2 border-paper-edge hover:border-ink"
          >
            <span className="flex h-16 items-center justify-center bg-paper-deep p-1">
              <img src={item.image} alt="" className="h-full w-full object-contain" />
            </span>
            <span className="block bg-paper px-1 py-1 text-center text-[11px] font-bold text-ink-soft">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Unstocked() {
  return (
    <PaperCard>
      <HandLabel as="h2" size="lg" className="block">
        Café
      </HandLabel>
      <p className="mt-2 text-sm text-ink-soft">The shelf is empty so far.</p>
    </PaperCard>
  );
}
