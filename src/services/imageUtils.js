/**
 * Utilitário de Compressão e Otimização de Imagens para o VagaGo
 * Converte imagens para o formato moderno WebP com alta fidelidade visual (HD 1600px, 88% qualidade)
 * Mantém nitidez de detalhes (portão, número, placa) enquanto economiza até 85-90% de espaço.
 */

export const compressImageToWebP = (file, maxWidth = 1600, quality = 0.88) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Nenhum arquivo de imagem fornecido.'));
    }

    // Se o arquivo for muito pequeno (menos de 60KB), não precisa redimensionar tanto
    const originalSizeKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém a proporção exata sem distorção
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: readerEvent.target.result,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            savingsPercent: 0
          });
        }

        // Suavização de alta fidelidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Converte para WebP com alta fidelidade
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          
          // Calcula tamanho comprimido aproximado
          const head = 'data:image/webp;base64,';
          const sizeInBytes = Math.round((webpDataUrl.length - head.length) * 3 / 4);
          const compressedSizeKb = Math.round(sizeInBytes / 1024);
          const savingsPercent = originalSizeKb > 0 ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)) : 0;

          resolve({
            dataUrl: webpDataUrl,
            originalSizeKb,
            compressedSizeKb,
            savingsPercent
          });
        } catch (err) {
          // Fallback caso o navegador não suporte toDataURL com webp
          const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({
            dataUrl: fallbackDataUrl,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            savingsPercent: 0
          });
        }
      };

      img.onerror = (err) => reject(new Error('Erro ao carregar a imagem selecionada.'));
      img.src = readerEvent.target.result;
    };

    reader.onerror = (err) => reject(new Error('Erro ao ler o arquivo de foto.'));
    reader.readAsDataURL(file);
  });
};
