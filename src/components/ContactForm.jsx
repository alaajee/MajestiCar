import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        form.reset();

        // Masquer après 5s
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-200 p-12 mt-12 max-w-4xl mx-auto rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-black text-center">
        Entrez vos coordonnées
      </h2>

      {/* Message de confirmation */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          Votre message a été envoyé avec succès !
        </div>
      )}

      <form
        id="contact-form"
        action="https://formsubmit.co/abservices381@gmail.com"
        method="POST"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-xl mx-auto"
      >
        {/* Protection anti-spam */}
        <input type="hidden" name="_captcha" value="false" />
        <input
          type="hidden"
          name="_subject"
          value="Nouveau message AB Services"
        />
        <input type="hidden" name="_template" value="table" />

        <input
          type="text"
          id="name"
          name="name"
          placeholder="Votre nom"
          required
          className="p-3 rounded border border-black focus:outline-none focus:ring-2 focus:ring-[#a67b5b]"
        />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Votre email"
          required
          className="p-3 rounded border border-black focus:outline-none focus:ring-2 focus:ring-[#a67b5b]"
        />
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder="Votre numéro de téléphone"
          required
          className="p-3 rounded border border-black focus:outline-none focus:ring-2 focus:ring-[#a67b5b]"
        />
        <textarea
          id="message"
          name="message"
          rows="4"
          placeholder="Votre message"
          required
          className="p-3 rounded border border-black focus:outline-none focus:ring-2 focus:ring-[#a67b5b]"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className="bg-black hover:bg-black text-white font-semibold py-3 rounded transition"
        >
          {loading ? "Envoi en cours..." : "Envoyer par email"}
        </button>
      </form>
    </section>
  );
}
