// src/pages/Checkout.js
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Paiement from "../components/Paiement";

// Utilise les mêmes clés que l'app
const LS_CART_KEY = "gc_demo_cart";
const LS_WALLET_KEY = "gc_demo_wallet";

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

const mask = (code) => `••••-••••-••••-${code.slice(-4)}`;

export default function Checkout() {
  const navigate = useNavigate();

  // Panier depuis localStorage (même structure que dans App.js)
  const [cart, setCart] = useLocalStorageState(LS_CART_KEY, []);
  const [wallet, setWallet] = useLocalStorageState(LS_WALLET_KEY, []);

  const total = useMemo(
    () => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0),
    [cart]
  );

  // Attribution simulée (comme dans App.js)
  const attributeAndStore = () => {
    if (!cart.length) return;
    const now = new Date().toISOString();
    const newWallet = cart.map((it) => {
      const full = `SIM-${Math.random().toString(36).slice(2).toUpperCase()}`;
      return {
        id: `${Date.now()}-${Math.random()}`,
        brand: it.brand,
        amount: it.amount,
        maskedCode: mask(full),
        fullCode: full,
        createdAt: now,
      };
    });
    setWallet((prev) => [...newWallet, ...prev]);
    setCart([]); // vide le panier
  };

  const handleSuccess = () => {
    attributeAndStore();
    // Retour à l’accueil après succès
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Récapitulatif de commande</h1>
          <Link to="/" className="text-sm underline">← Continuer mes achats</Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-600 mb-4">Votre panier est vide.</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 rounded-xl bg-black text-white"
            >
              Retour à l’accueil
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-4 space-y-3">
              {cart.map((it, idx) => (
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

            <aside className="bg-white rounded-2xl shadow p-4 h-fit space-y-3">
              <div className="flex items-center justify-between">
                <span>Sous-total</span>
                <span className="font-medium">
                  {total.toLocaleString()} CFA
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Frais</span>
                <span>0 CFA</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {total.toLocaleString()} CFA
                </span>
              </div>

              <Paiement
                amount={total}
                customer={{
                  email: "client@example.com",
                  phone: "0700000000",
                  name: "Client Démo",
                }}
                onSuccess={handleSuccess}
                onCancel={() => alert("Paiement annulé")}
                label="Payer maintenant (test)"
              />

              <p className="text-[11px] text-gray-500">
                Mode sandbox – aucune carte réelle débitée.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}