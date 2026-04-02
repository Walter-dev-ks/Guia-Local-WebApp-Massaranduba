#!/usr/bin/env node

/**
 * Script para gerar ícones PWA a partir de uma imagem base
 * 
 * Uso: node scripts/generate-pwa-icons.js <caminho-da-imagem>
 * 
 * Exemplo: node scripts/generate-pwa-icons.js logo.png
 * 
 * Dependências: npm install sharp
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Gerador de Ícones PWA para Guia Local');
console.log('========================================\n');

console.log('⚠️  Para usar este script, você precisa:');
console.log('1. Instalar a dependência: npm install sharp');
console.log('2. Ter uma imagem de pelo menos 512x512px\n');

console.log('📝 Instruções:');
console.log('1. Coloque sua imagem (ex: logo.png) na raiz do projeto');
console.log('2. Execute: node scripts/generate-pwa-icons.js logo.png\n');

console.log('🔗 Alternativa Online (Recomendado):');
console.log('Visite: https://www.pwabuilder.com/');
console.log('- Faça upload de uma imagem 512x512px');
console.log('- Baixe o arquivo ZIP com todos os ícones');
console.log('- Extraia em /public\n');

console.log('📦 Ícones necessários:');
console.log('- pwa-192x192.png (192x192)');
console.log('- pwa-512x512.png (512x512)');
console.log('- pwa-maskable-192x192.png (192x192 - para Android)');
console.log('- pwa-maskable-512x512.png (512x512 - para Android)');
console.log('- favicon.ico (16x16, 32x32, 64x64)\n');

// Se o usuário passou um arquivo, tentar processar
const imagePath = process.argv[2];
if (imagePath) {
  console.log(`📂 Tentando processar: ${imagePath}\n`);
  
  try {
    const sharp = require('sharp');
    const publicDir = path.join(__dirname, '../public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const image = sharp(imagePath);

    // Gerar ícones
    const sizes = [192, 512];
    
    Promise.all([
      ...sizes.map(size => 
        image.resize(size, size).png().toFile(path.join(publicDir, `pwa-${size}x${size}.png`))
      ),
      ...sizes.map(size => 
        image.resize(size, size).png().toFile(path.join(publicDir, `pwa-maskable-${size}x${size}.png`))
      ),
    ]).then(() => {
      console.log('✅ Ícones gerados com sucesso em /public!');
      console.log('\n⚠️  Nota: Para favicon.ico, use uma ferramenta online como:');
      console.log('   https://convertio.co/png-ico/');
    }).catch(err => {
      console.error('❌ Erro ao gerar ícones:', err.message);
    });
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.log('\nInstale sharp com: npm install sharp');
  }
}
