// src/components/Paiement.js
import React, { useEffect, useState, useCallback } from "react";

function useFlutterwave() {
  const [ready, setReady] = useState(!!window.FlutterwaveCheckout);

  useEffect(() => {
    if (window.FlutterwaveCheckout) {
      setReady(true);
      return;
    }
    const id = "flw-v3-js";
    if (document.getElementById(id)) {
      // un autre composant est en train de le charger
      const int = setInterval(() => {
        if (window.FlutterwaveCheckout) {
          setReady(true);
          clearInterval(int);
        }
      }, 200);
      return () => clearInterval(int);
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => setReady(false);
    document.body.appendChild(s);
  }, []);

  return ready;
}

export default function Paiement({
  amount,
  customer,
  label = "Payer (test)",
  onSuccess,
  onCancel,
}) {
  const ready = useFlutterwave();
  const pubKey = process.env.REACT_APP_FLW_PUBLIC_KEY;
  const appName = process.env.REACT_APP_APP_NAME || "GiftCards";

  const handlePay = useCallback(() => {
    if (!ready || !window.FlutterwaveCheckout) return;

    window.FlutterwaveCheckout({
      public_key: pubKey,
      tx_ref: `gc_${Date.now()}`,
      amount: Number(amount || 0),
      currency: "XOF",
      payment_options: "card,ussd,banktransfer,mobilemoney",
      customer: {
        email: customer?.email || "client@example.com",
        phonenumber: customer?.phone || "0700000000",
        name: customer?.name || "Client Démo",
      },
      customizations: {
        title: appName,
        description: "Achat de cartes cadeaux (démo)",
      },
      callback: (payment) => {
        try {
          onSuccess && onSuccess(payment);
        } finally {
          // la modale se ferme toute seule côté FLW v3
        }
      },
      onclose: () => {
        onCancel && onCancel();
      },
    });
  }, [ready, pubKey, amount, customer, onSuccess, onCancel, appName]);

  const disabled = !ready || !pubKey || !amount;

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl ${
        disabled ? "bg-gray-200 text-gray-500" : "bg-black text-white hover:opacity-90"
      }`}
      title={disabled ? "Chargement du module de paiement…" : "Payer avec Flutterwave"}
    >
      {disabled ? "Chargement du paiement…" : label}
    </button>
  );
}