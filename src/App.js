// src/App.js
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LS_CART_KEY, LS_WALLET_KEY } from "./lib/storage";

const PRODUCTS = [
  { id: "apple-ci",  brand: "Apple • CI",  description: "Cartes Apple (App Store, musique…)", priceOptions: [10000, 25000, 50000] },
  { id: "psn-ci",    brand: "PSN • CI",    description: "PlayStation Store : jeux, addons, PS Plus.", priceOptions: [10000, 20000, 40000] },
  { id: "gplay-ci",  brand: "Google Play • CI", description: "Apps et contenus Google Play.", priceOptions: [10000, 15000, 30000] },
];

function useLocalStorageState(key, fallback) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  const set = (next) => {
    const v = typeof next === "function" ? next(val) : next;
    setVal(v);
    localStorage.setItem(key, JSON.stringify(v));
  };
  return [val, set];
}

function WalletModal({ open, onClose, wallet }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-40">
      <div className="absolute inset-x-0 top-10 mx-auto max-w-2xl bg-white rounded-2xl shadow-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Mon portefeuille</h2>
          <button onClick={onClose}>Fermer</button>
        </div>
        {wallet.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun code pour le moment.</p>
        ) : (
          wallet.map((g) => (
            <div key={g.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{g.brand}</div>
                <div className="text-xs text-gray-500">{g.amount.toLocaleString()} CFA</div>
              </div>
              <div className="text-sm">{g.maskedCode}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, items, total }) {
  return (
    <div className={`fixed inset-0 z-30 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Panier</h3>
          <button onClick={onClose} className="text-sm">Fermer</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-180px)]">
          {items.length === 0 && <p className="text-sm text-gray-500">Votre panier est vide.</p>}
          {items.map((it, idx) => (
            <div key={idx} className="border rounded-xl p-3 flex items-center gap-3">
              <div className="font-medium">{it.brand}</div>
              <div className="text-sm text-gray-600">
                {it.amount.toLocaleString()} CFA × {it.qty}
              </div>
              <div className="ml-auto font-semibold">
                {(it.unitPrice * it.qty).toLocaleString()} CFA
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="font-semibold">{total.toLocaleString()} CFA</span>
          </div>

          {items.length > 0 ? (
            <Link
              to="/checkout"
              className="block text-center w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90"
              onClick={onClose}
            >
              Aller au paiement
            </Link>
          ) : (
            <button disabled className="w-full px-4 py-3 rounded-xl bg-gray-200">
              Panier vide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useLocalStorageState(LS_CART_KEY, []);
  const [wallet] = useLocalStorageState(LS_WALLET_KEY, []);
  const [drawer, setDrawer] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [selected, setSelected] = useState({}); // { [productId]: amount }

  const total = useMemo(
    () => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0),
    [cart]
  );

  const addToCart = (p) => {
    const amount = selected[p.id] || p.priceOptions[0];
    setCart((prev) => {
      const i = prev.findIndex((x) => x.id === p.id && x.amount === amount);
      if (i !== -1) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          id: p.id,
          brand: p.brand,
          amount,
          unitPrice: amount,
          qty: 1,
        },
      ];
    });
    setDrawer(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} wallet={wallet} />
      <CartDrawer open={drawer} onClose={() => setDrawer(false)} items={cart} total={total} />

      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-bold">Gift Cards • MVP</div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setWalletOpen(true)} className="px-3 py-1.5 rounded-full border">
              Mon portefeuille
            </button>
            <button onClick={() => setDrawer(true)} className="px-3 py-1.5 rounded-full border">
              Panier ({cart.reduce((s, it) => s + it.qty, 0)})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-sm">
          ⚠️ Démo : paiement via Flutterwave (sandbox), attribution locale simulée.
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow p-4 space-y-3">
              <div className="font-semibold text-lg">{p.brand}</div>
              <p className="text-sm text-gray-600">{p.description}</p>
              <select
                className="border rounded-lg px-2 py-1 text-sm"
                value={selected[p.id] || p.priceOptions[0]}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                }
              >
                {p.priceOptions.map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()} CFA
                  </option>
                ))}
              </select>
              <button
                className="w-full mt-1 px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
                onClick={() => addToCart(p)}
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}