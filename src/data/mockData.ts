import { Business, Category, FeedPost, Review, Question } from '@/types';

export const categories: Category[] = [
  {
    id: 'uteis', name: 'Úteis', icon: 'ShoppingBag',
    subcategories: [
      { id: 'mercados', name: 'Mercados', categoryId: 'uteis' },
      { id: 'farmacias', name: 'Farmácias', categoryId: 'uteis' },
      { id: 'postos', name: 'Postos de Combustível', categoryId: 'uteis' },
    ],
  },
  {
    id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed',
    subcategories: [
      { id: 'restaurantes', name: 'Restaurantes', categoryId: 'alimentacao' },
      { id: 'lanchonetes', name: 'Lanchonetes', categoryId: 'alimentacao' },
      { id: 'pizzarias', name: 'Pizzarias', categoryId: 'alimentacao' },
    ],
  },
  {
    id: 'saude', name: 'Saúde', icon: 'Heart',
    subcategories: [
      { id: 'clinicas', name: 'Clínicas', categoryId: 'saude' },
      { id: 'dentistas', name: 'Dentistas', categoryId: 'saude' },
      { id: 'veterinarios', name: 'Veterinários', categoryId: 'saude' },
    ],
  },
  {
    id: 'servicos', name: 'Serviços', icon: 'Wrench',
    subcategories: [
      { id: 'oficinas', name: 'Oficinas', categoryId: 'servicos' },
      { id: 'eletricistas', name: 'Eletricistas', categoryId: 'servicos' },
      { id: 'encanadores', name: 'Encanadores', categoryId: 'servicos' },
    ],
  },
  {
    id: 'educacao', name: 'Educação', icon: 'GraduationCap',
    subcategories: [
      { id: 'escolas', name: 'Escolas', categoryId: 'educacao' },
      { id: 'cursos', name: 'Cursos', categoryId: 'educacao' },
    ],
  },
  {
    id: 'beleza', name: 'Beleza', icon: 'Sparkles',
    subcategories: [
      { id: 'saloes', name: 'Salões', categoryId: 'beleza' },
      { id: 'barbearias', name: 'Barbearias', categoryId: 'beleza' },
    ],
  },
];

const defaultHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '13:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

export const businesses: Business[] = [
  {
    id: 'mercado-central',
    name: 'Mercado Central Ltda',
    tradeName: 'Mercado Central',
    cnpj: '12.345.678/0001-90',
    description: 'O maior mercado da região, com produtos frescos todos os dias. Hortifruti selecionado, açougue premium e padaria artesanal.',
    categoryId: 'uteis',
    subcategoryId: 'mercados',
    phone: '(11) 3456-7890',
    whatsapp: '5511934567890',
    email: 'contato@mercadocentral.com',
    instagram: '@mercadocentral',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01001-000',
    photos: [],
    coverPhoto: '',
    hours: defaultHours,
    rating: 4.5,
    reviewCount: 128,
    verified: true,
    createdAt: '2024-01-15',
    lastVerified: '2024-03-01',
  },
  {
    id: 'farmacia-saude',
    name: 'Farmácia Saúde Total EIRELI',
    tradeName: 'Farmácia Saúde Total',
    cnpj: '23.456.789/0001-01',
    description: 'Farmácia completa com delivery rápido. Medicamentos, perfumaria, suplementos e serviços de aferição de pressão arterial.',
    categoryId: 'uteis',
    subcategoryId: 'farmacias',
    phone: '(11) 2345-6789',
    whatsapp: '5511923456789',
    email: 'contato@farmaciasaude.com',
    address: 'Av. Brasil, 456 - Jardim América',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01402-000',
    photos: [],
    coverPhoto: '',
    hours: { ...defaultHours, sunday: { open: '08:00', close: '12:00', closed: false } },
    rating: 4.8,
    reviewCount: 95,
    verified: true,
    createdAt: '2024-02-01',
    lastVerified: '2024-03-10',
  },
  {
    id: 'pizzaria-bella',
    name: 'Pizzaria Bella Napoli ME',
    tradeName: 'Pizzaria Bella Napoli',
    cnpj: '34.567.890/0001-12',
    description: 'Pizzas artesanais com massa fermentada por 72h. Ingredientes importados da Itália e receitas tradicionais napolitanas.',
    categoryId: 'alimentacao',
    subcategoryId: 'pizzarias',
    phone: '(11) 3456-0000',
    whatsapp: '5511934560000',
    email: 'reservas@bellanapoli.com',
    instagram: '@bellanapoli',
    address: 'Rua Itália, 789 - Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05443-000',
    photos: [],
    coverPhoto: '',
    hours: {
      monday: { open: '00:00', close: '00:00', closed: true },
      tuesday: { open: '18:00', close: '23:00', closed: false },
      wednesday: { open: '18:00', close: '23:00', closed: false },
      thursday: { open: '18:00', close: '23:00', closed: false },
      friday: { open: '18:00', close: '00:00', closed: false },
      saturday: { open: '12:00', close: '00:00', closed: false },
      sunday: { open: '12:00', close: '22:00', closed: false },
    },
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    createdAt: '2024-01-20',
    lastVerified: '2024-03-05',
  },
  {
    id: 'oficina-motor',
    name: 'Auto Mecânica Motor Forte Ltda',
    tradeName: 'Oficina Motor Forte',
    cnpj: '45.678.901/0001-23',
    description: 'Mecânica geral, elétrica automotiva e funilaria. Atendemos todas as marcas com garantia de 90 dias nos serviços.',
    categoryId: 'servicos',
    subcategoryId: 'oficinas',
    phone: '(11) 4567-8901',
    whatsapp: '5511945678901',
    email: 'orcamento@motorforte.com',
    address: 'Rua dos Mecânicos, 321 - Brás',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '03011-000',
    photos: [],
    coverPhoto: '',
    hours: { ...defaultHours, saturday: { open: '08:00', close: '12:00', closed: false } },
    rating: 4.3,
    reviewCount: 67,
    verified: true,
    createdAt: '2024-02-10',
    lastVerified: '2024-03-12',
  },
  {
    id: 'clinica-vida',
    name: 'Clínica Vida Plena S/S',
    tradeName: 'Clínica Vida Plena',
    cnpj: '56.789.012/0001-34',
    description: 'Clínica multidisciplinar com ortopedia, cardiologia, dermatologia e pediatria. Exames laboratoriais no local.',
    categoryId: 'saude',
    subcategoryId: 'clinicas',
    phone: '(11) 5678-9012',
    whatsapp: '5511956789012',
    email: 'agendamento@vidaplena.com',
    website: 'https://vidaplena.com',
    address: 'Av. Saúde, 500 - Saúde',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04142-000',
    photos: [],
    coverPhoto: '',
    hours: defaultHours,
    rating: 4.7,
    reviewCount: 203,
    verified: true,
    createdAt: '2024-01-05',
    lastVerified: '2024-03-08',
  },
  {
    id: 'salao-glamour',
    name: 'Salão Glamour Beauty ME',
    tradeName: 'Salão Glamour',
    cnpj: '67.890.123/0001-45',
    description: 'Corte, coloração, tratamentos capilares, manicure e estética facial. Profissionais especializados e produtos de alta qualidade.',
    categoryId: 'beleza',
    subcategoryId: 'saloes',
    phone: '(11) 6789-0123',
    whatsapp: '5511967890123',
    email: 'agenda@salaoglamour.com',
    instagram: '@salaoglamour',
    address: 'Rua da Beleza, 88 - Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05422-000',
    photos: [],
    coverPhoto: '',
    hours: {
      ...defaultHours,
      monday: { open: '00:00', close: '00:00', closed: true },
      saturday: { open: '09:00', close: '17:00', closed: false },
    },
    rating: 4.6,
    reviewCount: 178,
    verified: true,
    createdAt: '2024-02-15',
    lastVerified: '2024-03-15',
  },
];

export const feedPosts: FeedPost[] = [
  {
    id: 'post-1',
    businessId: 'mercado-central',
    businessName: 'Mercado Central',
    title: '🎉 Semana do Hortifruti com até 40% OFF!',
    description: 'Frutas, verduras e legumes fresquinhos com preços imperdíveis. Válido de segunda a sábado.',
    image: '',
    type: 'promotion',
    createdAt: '2024-03-20',
  },
  {
    id: 'post-2',
    businessId: 'pizzaria-bella',
    businessName: 'Pizzaria Bella Napoli',
    title: '🍕 Pizza Margherita por R$39,90',
    description: 'Nossa clássica Margherita com mozzarella di bufala, manjericão fresco e molho San Marzano. Promoção válida às terças e quartas.',
    image: '',
    type: 'sponsored',
    createdAt: '2024-03-19',
  },
  {
    id: 'post-3',
    businessId: 'farmacia-saude',
    businessName: 'Farmácia Saúde Total',
    title: '💊 Delivery grátis para o bairro todo!',
    description: 'Agora entregamos seus medicamentos sem taxa de entrega. Peça pelo WhatsApp e receba em até 40 minutos.',
    image: '',
    type: 'announcement',
    createdAt: '2024-03-18',
  },
  {
    id: 'post-4',
    businessId: 'salao-glamour',
    businessName: 'Salão Glamour',
    title: '✨ Pacote Noiva Completo',
    description: 'Cabelo, maquiagem, manicure e pedicure com 20% de desconto para noivas que agendarem com antecedência.',
    image: '',
    type: 'promotion',
    createdAt: '2024-03-17',
  },
  {
    id: 'post-5',
    businessId: 'clinica-vida',
    businessName: 'Clínica Vida Plena',
    title: '🏥 Check-up completo por R$199',
    description: 'Inclui consulta clínica, exames laboratoriais básicos e eletrocardiograma. Agende pelo WhatsApp.',
    image: '',
    type: 'sponsored',
    createdAt: '2024-03-16',
  },
];

export const reviews: Review[] = [
  { id: 'r1', businessId: 'mercado-central', userName: 'Maria Silva', rating: 5, comment: 'Melhor mercado da região! Produtos sempre frescos e atendimento excelente.', createdAt: '2024-03-15' },
  { id: 'r2', businessId: 'mercado-central', userName: 'João Santos', rating: 4, comment: 'Bom mercado, preços justos. Só falta mais opções de orgânicos.', createdAt: '2024-03-10' },
  { id: 'r3', businessId: 'pizzaria-bella', userName: 'Ana Costa', rating: 5, comment: 'A melhor pizza de São Paulo, sem exagero! Massa perfeita e ingredientes de primeira.', createdAt: '2024-03-18' },
  { id: 'r4', businessId: 'farmacia-saude', userName: 'Carlos Oliveira', rating: 5, comment: 'Delivery super rápido e farmacêuticos muito atenciosos.', createdAt: '2024-03-12' },
  { id: 'r5', businessId: 'clinica-vida', userName: 'Patrícia Lima', rating: 4, comment: 'Ótimos profissionais. A espera poderia ser menor, mas o atendimento compensa.', createdAt: '2024-03-08' },
];

export const questions: Question[] = [
  { id: 'q1', businessId: 'mercado-central', userName: 'Roberto Alves', question: 'Vocês fazem entrega para o bairro Consolação?', answer: 'Sim! Entregamos para toda a região central. Faça seu pedido pelo WhatsApp.', answeredBy: 'Equipe Guia Local', createdAt: '2024-03-10', answeredAt: '2024-03-11' },
  { id: 'q2', businessId: 'pizzaria-bella', userName: 'Fernanda Rocha', question: 'Tem opções sem glúten no cardápio?', answer: 'Temos sim! Nossa pizza sem glúten está disponível em todas as sextas e sábados.', answeredBy: 'Equipe Guia Local', createdAt: '2024-03-15', answeredAt: '2024-03-16' },
  { id: 'q3', businessId: 'farmacia-saude', userName: 'Lucas Mendes', question: 'Qual o horário do plantão aos domingos?', createdAt: '2024-03-18' },
];

export function isBusinessOpen(business: Business): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const today = days[now.getDay()];
  const todayHours = business.hours[today];

  if (todayHours.closed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes <= openMinutes) {
    // Crosses midnight
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function getCategoryById(id: string) {
  return categories.find(c => c.id === id);
}

export function getBusinessesByCategory(categoryId: string) {
  return businesses.filter(b => b.categoryId === categoryId);
}

export function getBusinessesBySubcategory(subcategoryId: string) {
  return businesses.filter(b => b.subcategoryId === subcategoryId);
}

export function getBusinessById(id: string) {
  return businesses.find(b => b.id === id);
}

export function getReviewsByBusiness(businessId: string) {
  return reviews.filter(r => r.businessId === businessId);
}

export function getQuestionsByBusiness(businessId: string) {
  return questions.filter(q => q.businessId === businessId);
}
