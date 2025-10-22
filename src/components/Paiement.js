// src/components/Paiement.js
import React, { useEffect, useState } from "react";

const KEY_ENDPOINT = "/.netlify/functions/public-key"; // <<< unique endpoint côté Netlify

export default function Paiement({
  amount,
  customer,
  onSuccess,
  onCancel,
  label = "Payer (test)",
}) {
  const [pubKey, setPubKey] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");

  // 1) Récupère la clé publique depuis la fonction Netlify
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch(KEY_ENDPOINT, { cache: "no-store" });
        if (!r.ok) throw new Error(`GET ${KEY_ENDPOINT} -> ${r.status}`);
        const data = await r.json();
        if (!data?.publicKey) throw new Error("publicKey manquante dans la réponse");
        if (alive) setPubKey(data.publicKey);
      } catch (e) {
        console.error("Public key load failed:", e);
        if (alive) setError("Impossible de charger la clé publique.");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2) Charge le script Flutterwave (v3)
  useEffect(() => {
    const id = "flw-v3";
    if (document.getElementById(id)) {
      setScriptReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = () => setScriptReady(true);
    s.onerror = () => setError("Échec de chargement du script Flutterwave.");
    document.body.appendChild(s);
    return () => s.remove();
  }, []);

  const isReady = !!pubKey && scriptReady && !error;

  const handlePay = () => {
    if (!isReady) return;
    /* global FlutterwaveCheckout */
    FlutterwaveCheckout({
      public_key: pubKey,
      amount,
      currency: "XOF",
      tx_ref: `demo-${Date.now()}`,
      customer: {
        email: customer?.email || "client@example.com",
        phone_number: customer?.phone || "0700000000",
        name: customer?.name || "Client Démo",
      },
      customizations: {
        title: "Gift Cards",
        description: "Achat de cartes (démo)",
      },
      callback: (res) =>
        res?.status === "successful" ? onSuccess?.(res) : onCancel?.(res),
      onclose: () => onCancel?.(),
    });
  };

  return (
    <div className="space-y-2">
      <button
        className={`w-full px-4 py-3 rounded-xl text-white ${
          isReady ? "bg-black hover:bg-neutral-800" : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!isReady}
        onClick={handlePay}
      >
        {isReady ? label : "Chargement du paiement…"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-gray-500">Sandbox : aucune carte réelle débitée.</p>
    </div>
  );
}