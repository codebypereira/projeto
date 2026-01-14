function loadLayout() {
    const footerMenu  = `
    <div class="lg:hidden fixed bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 z-[100] flex justify-between items-center rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      <a href="#" id="nav-home" class="nav-item flex flex-col items-center gap-1 text-gray-300 transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Início</span>
      </a>

      <a href="#" id="nav-live" class="nav-item flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Ao Vivo</span>
      </a>
      <a href="#" id="nav-stats" class="nav-item flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Estatísticas</span>
      </a>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', footerMenu);

    initNav();
}

//Animação de botão ativo para nav (mobile)
function initNav() {
    const items = document.querySelectorAll('.nav-item');

    if (items.length === 0) return;
    
    items.forEach(item => {
        item.addEventListener('click', (e) => {

            if(item.getAttribute('href') === '#') e.preventDefault();

            items.forEach(i => i.classList.remove('nav-active'));
            item.classList.add('nav-active');
            console.log(`Botão ativo: ${item.id}`)
        })
    });

    const homeBtn = document.getElementById('nav-home');
    if(homeBtn && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
        homeBtn.classList.add('nav-active');
    }
}

document.addEventListener('DOMContentLoaded', loadLayout);