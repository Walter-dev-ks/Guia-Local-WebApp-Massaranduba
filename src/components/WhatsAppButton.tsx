import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  // SUBSTITUA PELO SEU NÚMERO REAL (Ex: 5547999999999)
  const phoneNumber = "5547992315473"; 
  const message = encodeURIComponent("Olá! Preciso de suporte no Guia Local.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 group"
      aria-label="Suporte via WhatsApp"
    >
      <MessageCircle size={32} className="fill-current" />
      
      {/* Tooltip que aparece ao passar o mouse */}
      <span className="absolute right-16 bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-slate-100">
        Suporte via WhatsApp
      </span>
      
      {/* Efeito de pulso sutil para chamar atenção */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none"></span>
    </a>
   );
};

export default WhatsAppButton;
