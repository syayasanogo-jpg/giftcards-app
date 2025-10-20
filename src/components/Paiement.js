// src/components/Paiement.js
import React, { useEffect, useState, useCallback } from "react";

/**
 * Bouton de paiement Flutterwave (v3) sans dépendance NPM.
 * - Charge le script https://checkout.flutterwave.com/v3.js si nécessaire
 * - Utilise la clé publique depuis process.env.REACT_APP_FLW_PUBLIC_KEY
 *
 * Props :
 *  - amount (number)         : montant en XOF (ex: 10000)
 *  - customer ({email, phone, name})
 *  - onSuccess(response)     : callback après paiement validé (sandbox/real)
 *  - onCancel()              : callback si l’utilisateur ferme annule
 *  - label (string)          : texte du bouton
 */
export default function Paiement({
  amount,
  customer = { email: "test@example.com", phone: "0700000000", name: "Client Démo" },
  onSuccess,
  onCancel,
  label = "Payer avec Flutterwave (test)",
}) {
  const [ready, setReady] = useState(false);
  const pubKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  // Charge le SDK Flutterwave si absent
  useEffect(() => {
    if (window.FlutterwaveCheckout) {
      setReady(true);
      return;
    }
    const id = "fw-sdk-v3";
    if (document.getElementById(id)) return; // en cours de chargement
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => console.error("Échec de chargement du SDK Flutterwave");
    document.body.appendChild(s);
  }, []);

  const pay = useCallback(() => {
    if (!pubKey) {
      alert(
        "Clé publique Flutterwave manquante.\n" +
          "Ajoute REACT_APP_FLW_PUBLIC_KEY dans tes variables Netlify."
      );
      return;
    }
    if (!window.FlutterwaveCheckout) {
      alert("SDK Flutterwave non chargé. Réessaie dans une seconde…");
      return;
    }

    window.FlutterwaveCheckout({
      public_key: pubKey,
      tx_ref: "gc-" + Date.now(),
      amount: Number(amount || 0),
      currency: "XOF",
      payment_options: "card, mobilemoneyfranco, account, ussd",
      customer: {
        email: customer.email,
        phonenumber: customer.phone,
        name: customer.name,
      },
      customizations: {
        title: "Achat Carte Cadeau",
        description: "Paiement démo",
        logo:
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      },
      callback: (response) => {
        try {
          onSuccess && onSuccess(response);
        } finally {
          // La modale se ferme automatiquement côté Flutterwave après callback
        }
      },
      onclose: () => {
        onCancel && onCancel();
      },
    });
  }, [amount, customer, onCancel, onSuccess, pubKey]);

  return (
    <button
      type="button"
      onClick={pay}
      disabled={!ready || !amount}
      className={`w-full px-4 py-3 rounded-xl ${
        ready ? "bg-black text-white" : "bg-gray-300 text-gray-600"
      }`}
      title={!ready ? "Chargement du SDK Flutterwave…" : ""}
    >
      {label}
    </button>
  );
}