document.addEventListener('DOMContentLoaded', () => {
  // 0. Intro Screen / Splash Preloader (Estilo GR6 & Love Funk)
  const introScreen = document.getElementById('intro-screen');
  const phase1 = document.getElementById('phase-1');
  const phase2 = document.getElementById('phase-2');
  const skipBtn = document.getElementById('intro-skip');
  const progressBar = document.getElementById('intro-progress-bar');

  if (introScreen) {
    let progress = 0;
    const totalTime = 3400; // 3.4 segundos
    const intervalTime = 40;
    const increment = (intervalTime / totalTime) * 100;

    const progressInterval = setInterval(() => {
      progress += increment;
      if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
      }

      // Transição da Fase 1 (Logo) para Fase 2 (Parceiros) na metade do tempo
      if (progress >= 48 && phase1 && phase2 && !phase2.classList.contains('active')) {
        phase1.classList.remove('active');
        phase2.classList.add('active');
      }

      // Fim da Apresentação
      if (progress >= 100) {
        clearInterval(progressInterval);
        dismissIntro();
      }
    }, intervalTime);

    function dismissIntro() {
      clearInterval(progressInterval);
      if (introScreen && !introScreen.classList.contains('dismissed')) {
        introScreen.classList.add('dismissed');
      }
    }

    skipBtn?.addEventListener('click', dismissIntro);
  }

  // 1. Menu Mobile Toggle
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Ano Atual no Footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Catálogo Dinâmico com Abas de Categoria e Pesquisa por Texto
  const catalogueHost = document.getElementById('catalogue-results');
  const searchInput = document.getElementById('artist-search');
  const categoryTabs = document.querySelectorAll('.category-tabs .tab-btn');
  
  let currentCategory = 'all';
  let currentSearchQuery = '';

  const normalizeText = value => {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  function renderCatalogue() {
    if (!catalogueHost) return;

    const catalogData = window.BORTOLUCI_CATALOG || [];
    const query = normalizeText(currentSearchQuery.trim());

    // Filtragem por Categoria + Texto
    const filteredGroups = catalogData
      .filter(group => {
        if (currentCategory === 'all') return true;
        return group.title === currentCategory;
      })
      .map(group => {
        const matchingNames = group.names.filter(name => normalizeText(name).includes(query));
        return {
          ...group,
          names: matchingNames
        };
      })
      .filter(group => group.names.length > 0);

    if (filteredGroups.length === 0) {
      catalogueHost.innerHTML = `
        <div class="no-results">
          <p>Nenhum artista encontrado para os filtros selecionados.</p>
          <p>Entre em contato direto conosco para consultar datas e casting sob medida.</p>
        </div>
      `;
      return;
    }

    catalogueHost.innerHTML = filteredGroups
      .map(group => `
        <section class="catalogue-group">
          <h4>${group.title} (${group.names.length})</h4>
          <div class="name-grid">
            ${group.names.map(name => `
              <a href="#contato" data-artist-select="${name.replace(/"/g, '&quot;')}">
                <span>${name}</span>
                <span>↗</span>
              </a>
            `).join('')}
          </div>
        </section>
      `).join('');

    // Adiciona listener para preencher formulário ao clicar no artista
    attachArtistClickListeners();
  }

  function attachArtistClickListeners() {
    document.querySelectorAll('[data-artist-select]').forEach(element => {
      element.addEventListener('click', (e) => {
        const artistName = element.dataset.artistSelect;
        const msgTextarea = document.getElementById('form-mensagem');
        
        if (msgTextarea && artistName) {
          msgTextarea.value = `Gostaria de solicitar orçamento e disponibilidade para o artista: ${artistName}.`;
        }

        // Rola suavemente até a seção de contato se não estiver visível
        const contactSection = document.getElementById('contato');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Event Listeners das Abas
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category || 'all';
      renderCatalogue();
    });
  });

  // Event Listener da Busca em Tempo Real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderCatalogue();
    });
  }

  // Inicializa a renderização
  renderCatalogue();

  // 4. Envio do Formulário para WhatsApp
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const name = contactForm.elements['nome'].value.trim();
      const phone = contactForm.elements['whatsapp'].value.trim();
      const eventType = contactForm.elements['evento'].value;
      const cerimonialista = contactForm.elements['cerimonialista'] ? contactForm.elements['cerimonialista'].value.trim() : '';
      const message = contactForm.elements['mensagem'].value.trim();

      let text = `Olá, equipe Bortoluci Referência!\n\nMeu nome é: *${name}*\nWhatsApp: *${phone}*\nTipo de Evento: *${eventType}*`;
      if (cerimonialista) {
        text += `\nCerimonialista / Assessoria: *${cerimonialista}*`;
      }
      text += `\n\n*Detalhes / Artista:* ${message || 'Gostaria de consultar disponibilidade e orçamento para meu evento.'}`;

      const whatsappUrl = `https://wa.me/5511983463193?text=${encodeURIComponent(text)}`;
      
      window.open(whatsappUrl, '_blank', 'noopener');
      
      if (formNote) {
        formNote.textContent = '✓ Redirecionando para o WhatsApp oficial da Bortoluci Referência...';
      }

      contactForm.reset();
    });
  }

  // 5. Compacto do Canal Bortoluci Referência (Rotação em Loop de Vídeos & Imagens dos Shows)
  const heroVideo = document.getElementById('hero-video');
  const heroVideoSource = document.getElementById('hero-video-source');
  const heroImageSlide = document.getElementById('hero-image-slide');

  if (heroVideo && heroVideoSource && heroImageSlide) {
    const reel = [
      { type: 'video', src: 'assets/hero-lovefunk.mp4', mediaType: 'video/mp4' },
      { type: 'image', src: 'assets/bortoluci-show-1.jpg' },
      { type: 'video', src: 'assets/hero-gr6.webm', mediaType: 'video/webm' },
      { type: 'image', src: 'assets/bortoluci-show-2.jpg' }
    ];
    let currentIndex = 0;
    let imageTimer = null;

    function playReelItem(index) {
      clearTimeout(imageTimer);
      const item = reel[index];

      if (item.type === 'video') {
        heroImageSlide.classList.remove('active');
        heroVideo.style.opacity = '1';
        heroVideoSource.setAttribute('src', item.src);
        heroVideoSource.setAttribute('type', item.mediaType);
        heroVideo.load();
        heroVideo.play().catch(() => {});
      } else {
        heroVideo.style.opacity = '0';
        heroImageSlide.style.backgroundImage = `url('${item.src}')`;
        heroImageSlide.classList.add('active');

        // Para imagens de alta definição, avança após 6.5 segundos
        imageTimer = setTimeout(nextReelItem, 6500);
      }
    }

    function nextReelItem() {
      currentIndex = (currentIndex + 1) % reel.length;
      playReelItem(currentIndex);
    }

    heroVideo.removeAttribute('loop');
    heroVideo.addEventListener('ended', nextReelItem);
  }
});