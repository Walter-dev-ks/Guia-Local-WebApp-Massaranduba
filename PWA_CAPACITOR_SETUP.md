# Guia de Configuração: PWA e Capacitor para Guia Local

## 📱 Parte 1: Ativar o PWA (Imediato)

Seu projeto agora está configurado como um **Progressive Web App (PWA)**. Isso significa que seus usuários podem instalar o app diretamente do navegador.

### Como testar o PWA localmente:

1. **Build do projeto:**
   ```bash
   npm run build
   # ou
   bun run build
   ```

2. **Servir em HTTPS (necessário para PWA):**
   ```bash
   # Usando Python 3
   python3 -m http.server 8000 --directory dist
   
   # Ou usando Node.js com um servidor HTTPS simples
   npx http-server dist -c-1 -p 8000
   ```

3. **Acessar no navegador:**
   - Abra `https://localhost:8000` (você pode precisar aceitar o certificado auto-assinado)
   - No Chrome/Edge: Clique no ícone de "Instalar" na barra de endereço
   - No Safari (iOS): Compartilhar → Adicionar à Tela de Início

### O que foi configurado:

- ✅ **manifest.json**: Define o nome, ícone e cores do app
- ✅ **Service Worker (sw.js)**: Permite funcionamento offline e cache inteligente
- ✅ **Meta tags PWA**: Suporte para iOS e Android
- ✅ **Ícones**: Preparados para diferentes tamanhos (192x192, 512x512 e maskable)

---

## 🚀 Parte 2: Preparar para Capacitor (Futuro - Android/iOS Nativos)

Quando você estiver pronto para publicar nas lojas (Play Store e App Store), use o **Capacitor**.

### Pré-requisitos:

- **Node.js** 16+ instalado
- **Android Studio** (para builds Android)
- **Xcode** (para builds iOS - apenas em Mac)

### Passo 1: Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Passo 2: Inicializar Capacitor

```bash
npx cap init
# Será perguntado:
# - App name: Guia Local
# - App Package ID: com.guialocal.app
# - Web dir: dist
```

### Passo 3: Adicionar Plataformas

```bash
# Para Android
npx cap add android

# Para iOS (apenas em Mac)
npx cap add ios
```

### Passo 4: Build e Deploy

```bash
# Fazer build do Vite
npm run build

# Sincronizar com Capacitor
npx cap sync

# Abrir no Android Studio (Android)
npx cap open android

# Abrir no Xcode (iOS - apenas Mac)
npx cap open ios
```

---

## 📦 Estrutura de Ícones Necessários

Coloque os seguintes ícones em `/public`:

```
public/
├── favicon.ico                    # Ícone padrão
├── pwa-192x192.png               # Ícone PWA 192x192
├── pwa-512x512.png               # Ícone PWA 512x512
├── pwa-maskable-192x192.png      # Ícone maskable (Android)
├── pwa-maskable-512x512.png      # Ícone maskable (Android)
├── screenshot-540x720.png        # Screenshot para Play Store
└── screenshot-1280x720.png       # Screenshot para Play Store
```

**Dica:** Use ferramentas como [PWA Asset Generator](https://www.pwabuilder.com/) para gerar esses ícones automaticamente a partir de uma imagem base.

---

## 🔧 Configurações Importantes

### manifest.json
- Define o nome, descrição, cores e ícones do app
- Permite que o app seja instalado na tela inicial
- Controla a orientação (portrait/landscape)

### sw.js (Service Worker)
- **Network First** para APIs (Supabase): Tenta rede primeiro, cache como fallback
- **Cache First** para arquivos estáticos: Usa cache local para velocidade
- Sincronização automática de dados quando offline

### capacitor.config.ts
- Configuração do app para builds nativos
- Define o diretório de saída (`dist`)
- Configurações de segurança e plugins

---

## 🌐 Deploy do PWA

### Opção 1: Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Opção 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Opção 3: Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

---

## 📝 Próximos Passos

1. **Gerar ícones PWA** usando a ferramenta online
2. **Testar o PWA** em um dispositivo real (Android/iOS)
3. **Quando pronto para lojas:**
   - Instalar Capacitor
   - Fazer build para Android/iOS
   - Publicar nas lojas

---

## ❓ Dúvidas Comuns

**P: O PWA funciona offline?**
R: Sim! O Service Worker faz cache dos arquivos estáticos. Dados da API (Supabase) são sincronizados quando online.

**P: Qual é a diferença entre PWA e Capacitor?**
R: PWA é um site que parece um app. Capacitor é um app nativo que roda seu código web. PWA é mais rápido de implementar; Capacitor tem mais acesso aos recursos do celular.

**P: Posso usar PWA + Capacitor juntos?**
R: Sim! O Capacitor usa o mesmo código web que o PWA. Você mantém um único código para tudo.

---

## 📚 Recursos Úteis

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Asset Generator](https://www.pwabuilder.com/)

---

**Criado para: Guia Local MVP**
**Data: 2026-03-29**
