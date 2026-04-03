"use client";

export default function ContactWhatsApp({ item }: any) {
    const phone = "22177XXXXXXX";

    const contact = () => {
        const msg = `Bonjour,
Je suis intéressé par ce terrain :

📍 Localisation : ${item.location}
📐 Surface : ${item.surface}
📄 Documents : ${item.documents}

Merci de me contacter.`;

        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
            "_blank"
        );
    };

    return (
        <button
            onClick={contact}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg"
        >
            Contacter via WhatsApp
        </button>
    );
}
