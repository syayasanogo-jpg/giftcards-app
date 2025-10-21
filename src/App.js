import React, { useMemo, useState, useEffect } from "react";
import Paiement from "./components/Paiement";
import googlePlayImg from "./assets/googleplay.jpg";
import { Routes, Route, Link } from "react-router-dom";
import Checkout from "./pages/Checkout";

/* ====== Demo Gift Cards (JS) ====== */

// Produits mock
const PRODUCTS = [
  {
    id: "apple-ci",
    brand: "Apple",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1887&auto=format&fit=crop",
    faceValues: [10000, 25000, 50000],
    country: "CI",
    description:
      "Créditez votre identifiant Apple pour apps, musique et abonnements. *Démo*.",
  },
  {
    id: "psn-ci",
    brand: "PSN",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1887&auto=format&fit=crop",
    faceValues: [10000, 20000, 40000],
    country: "CI",
    description: "Cartes PlayStation Store pour jeux, addons et PS Plus. *Démo*.",
  },
  {
  id: "gplay-ci",
  brand: "Google Play",
  description: "Apps, films et jeux sur Google Play.",
  faceValues: [10000, 15000, 30000],
  country: "CI",
  image: "src/assets/googleplay.jpg",
},
];

// Vault mock (NE PAS utiliser en prod côté client)
const VAULT = {
  "psn-ci:10000": ["PSN-9JQ4-8ZKD-1X2C"],
  "psn-ci:20000": ["PSN-88ZX-2KLM-0PQ9"],
  "psn-ci:40000": ["PSN-7YTR-FF22-ABCD"],
  "gplay-ci:10000": ["GPC-22AB-9911-OKLM"],
  "gplay-ci:15000": ["GPC-55TT-AB77-1290"],
  "gplay-ci:30000": ["GPC-XY22-0000-9UIO"],
  "apple-ci:10000": ["APL1-9MNP-XY22-00AA"],
  "apple-ci:25000": ["APL2-ABCD-EF12-3456"],
  "apple-ci:50000": ["APL5-8HG2-QQ11-77ZZ"],
};

const maskCode = (code) => `••••-••••-••••-${code.slice(-4)}`;

const LS_CART_KEY = "gc_demo_cart";
const LS_WALLET_KEY = "gc_demo_wallet";

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);
  return [val, setVal];
}

/* ====== UI ====== */

function Header({ onOpenCart, onOpenWallet, onOpenAdmin }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">
            GC
          </div>
          <div className="font-semibold text-lg">Gift Cards • MVP</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWallet}
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
          >
            Mon portefeuille
          </button>
          <button
            onClick={onOpenCart}
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
          >
            Panier
          </button>
          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ p, onAdd }) {
  const [amount, setAmount] = useState(p.faceValues[0]);
  return (
    <div className="bg-white rounded-2xl shadow p-3 flex flex-col">
      <img src={p.image} alt={p.brand} className="h-36 w-full object-cover rounded-xl" />
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {p.brand} • {p.country}
          </h3>
          <span className="text-sm text-gray-500">
            Montants: {p.faceValues.map((v) => (v / 1000).toFixed(0) + "k").join(" / ")}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{p.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <select
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="border rounded-xl px-3 py-2"
          >
            {p.faceValues.map((v) => (
              <option key={v} value={v}>
                {v.toLocaleString()} CFA
              </option>
            ))}
          </select>
          <button
            onClick={() => onAdd(amount)}
            className="ml-auto px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, items, onCheckout, total }) {
  return (
    <div className={`fixed inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Panier</h3>
          <button onClick={onClose} className="text-sm">
            Fermer
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-180px)]">
          {items.length === 0 && (
            <p className="text-sm text-gray-500">Votre panier est vide.</p>
          )}

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

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="font-semibold">{total.toLocaleString()} CFA</span>
          </div>

          {/* ⬇️ Lien vers la page /checkout */}
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

function WalletModal({ open, onClose, wallet, onReveal }) {
  return (
    <div className={`fixed inset-0 ${open ? "" : "hidden"}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 top-12 mx-auto max-w-2xl bg-white rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Mon portefeuille</h3>
          <button onClick={onClose} className="text-sm">Fermer</button>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {wallet.length === 0 && <p className="text-sm text-gray-500">Aucun achat pour le moment.</p>}
          {wallet.map((w) => (
            <div key={w.id} className="border rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="font-medium">{w.brand}</div>
                <div className="text-sm text-gray-600">{w.amount.toLocaleString()} CFA</div>
                <div className="ml-auto text-xs text-gray-500">{new Date(w.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <div className="px-3 py-2 rounded-xl bg-gray-100 font-mono tracking-widest select-all">
                    {w.revealedAt ? (w.fullCode || w.maskedCode) : w.maskedCode}
                  </div>
                  {!w.revealedAt && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Le code est masqué. Cliquez sur Révéler pour l’afficher (journalisé).
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  {!w.revealedAt ? (
                    <button onClick={() => onReveal(w.id)} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
                      Révéler
                    </button>
                  ) : (
                    <span className="text-xs text-green-600">
                      Révélé le {new Date(w.revealedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminModal({ open, onClose, onImport }) {
  const [brand, setBrand] = useState("PSN");
  const [amount, setAmount] = useState(10000);
  const [codes, setCodes] = useState("PSN-XXXX-YYYY-ZZZZ\nPSN-AAAA-BBBB-CCCC");
  return (
    <div className={`fixed inset-0 ${open ? "" : "hidden"}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 top-10 mx-auto max-w-3xl bg-white rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Admin • Import lot (démo)</h3>
          <button onClick={onClose} className="text-sm">Fermer</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Marque</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              {["PSN", "Google Play", "Apple", "Steam", "Netflix"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Montant (CFA)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value || "0"))}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-sm">Codes (un par ligne)</label>
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 h-32 font-mono"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              onClick={() => onImport({ brand, amount, codes })}
              className="px-4 py-2 rounded-xl bg-black text-white"
            >
              Importer (mock)
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          ⚠️ Prod: CSV chiffré côté serveur + KMS. Ici: démo locale.
        </p>
      </div>
    </div>
  );
}

/* ====== APP ====== */
export default function App() {
  const [cart, setCart] = useLocalStorage(LS_CART_KEY, []);
  const [wallet, setWallet] = useLocalStorage(LS_WALLET_KEY, []);

  const [openCart, setOpenCart] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  const products = useMemo(() => PRODUCTS, []);

  const addToCart = (p, amount) => {
    const unitPrice = amount;
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id && x.amount === amount);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = { ...cp[idx], qty: cp[idx].qty + 1 };
        return cp;
      }
      return [...prev, { productId: p.id, brand: p.brand, amount, qty: 1, unitPrice }];
    });
  };

  const total = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  const onCheckout = () => {
    if (!cart.length) return;
    const now = new Date().toISOString();
    const newWallet = [];

    for (const it of cart) {
      const key = `${it.productId}:${it.amount}`;
      const pool = VAULT[key] || [];
      const code = pool.shift() || `SIM-${Math.random().toString(36).slice(2).toUpperCase()}`;
      const masked = maskCode(code);
      newWallet.push({
        id: `${Date.now()}-${Math.random()}`,
        brand: it.brand,
        amount: it.amount,
        maskedCode: masked,
        fullCode: code,
        createdAt: now,
      });
    }
    setWallet((prev) => [...newWallet, ...prev]);
    setCart([]);
    setOpenCart(false);
    setOpenWallet(true);
    setLastOrderId(newWallet[0]?.id || null);
  };

  const reveal = (id) => {
    setWallet((prev) =>
      prev.map((w) => (w.id === id && !w.revealedAt ? { ...w, revealedAt: new Date().toISOString() } : w))
    );
  };

  const handleAdminImport = ({ brand, amount, codes }) => {
    const product = products.find((p) => p.brand === brand);
    if (!product) return alert("Produit introuvable pour cette marque");
    const key = `${product.id}:${amount}`;
    const lines = codes.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    VAULT[key] = [...(VAULT[key] || []), ...lines];
    alert(`Import simulé: ${lines.length} codes ajoutés au lot ${key}`);
    setOpenAdmin(false);
  };

  useEffect(() => {
    // sécurité démo: ne garde pas les codes complets en localStorage
    setWallet((prev) => prev.map((w) => ({ ...w, fullCode: undefined })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCart={() => setOpenCart(true)}
        onOpenWallet={() => setOpenWallet(true)}
        onOpenAdmin={() => setOpenAdmin(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Vente de cartes dématérialisées (démo)</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Prototype UI pour parcourir, acheter et stocker des cartes cadeaux. Paiement et coffre-fort simulés côté
            client pour démonstration uniquement.
          </p>
          <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 inline-block">
            ⚠️ Production: paiement via PSP, attribution serveur + chiffrement KMS, journaux d’audit.
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onAdd={(amount) => addToCart(p, amount)} />
          ))}
        </section>

        <section className="mt-10">
          <h2 className="font-semibold mb-2">Dernier achat</h2>
          {!lastOrderId ? (
            <p className="text-sm text-gray-500">Vous n'avez pas encore finalisé d'achat.</p>
          ) : (
            <p className="text-sm text-gray-600">
              Achat enregistré. Retrouvez vos codes dans{" "}
              <button className="underline" onClick={() => setOpenWallet(true)}>
                Mon portefeuille
              </button>.
            </p>
          )}
        </section>
      </main>

      <CartDrawer
        open={openCart}
        onClose={() => setOpenCart(false)}
        items={cart}
        total={total}
        onCheckout={onCheckout}
      />
      <WalletModal open={openWallet} onClose={() => setOpenWallet(false)} wallet={wallet} onReveal={reveal} />
      <AdminModal open={openAdmin} onClose={() => setOpenAdmin(false)} onImport={handleAdminImport} />
    </div>
  );
}