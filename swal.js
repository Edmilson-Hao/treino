// swal.js – SweetAlert2 embutido + estilo Gorila Mode Clean
const Swal = window.Swal = (() => {
  const style = document.createElement('style');
  style.textContent = `
    .my-swal .swal2-popup { background:#0D1B2A !important; color:#E0E1DD !important; border:2px solid #00FF9D !important; border-radius:16px !important; }
    .my-swal .swal2-title { color:#00FF9D !important; font-size:1.6em; }
    .my-swal .swal2-html-container { font-size:1.1em; line-height:1.5; }
    .my-swal .swal2-confirm { background:#00FF9D !important; color:#000 !important; font-weight:800 !important; border-radius:12px !important; padding:12px 28px !important; }
    .my-swal .swal2-cancel { background:transparent !important; color:#00FF9D !important; border:2px solid #00FF9D !important; border-radius:12px !important; padding:12px 28px !important; }
  `;
  document.head.appendChild(style);

  return (opts) => {
    if (typeof opts === 'string') opts = { text: opts };
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.className = 'my-swal';
      div.innerHTML = `
        <div class="swal2-popup swal2-modal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;width:90%;max-width:420px;padding:24px;border-radius:16px;text-align:center;">
          ${opts.title ? `<h2 style="margin:0 0 16px;color:#00FF9D;">${opts.title}</h2>` : ''}
          ${opts.text ? `<p style="margin:16px 0;font-size:1.1em;line-height:1.5;">${opts.text}</p>` : ''}
          ${opts.html || ''}
          <div style="margin-top:28px;display:flex;gap:16px;justify-content:center;">
            ${opts.showCancelButton ? `<button class="swal2-cancel">${opts.cancelButtonText || 'Cancelar'}</button>` : ''}
            ${opts.showConfirmButton !== false ? `<button class="swal2-confirm">${opts.confirmButtonText || 'OK'}</button>` : ''}
          </div>
        </div>
      `;
      document.body.appendChild(div);
      div.querySelector('.swal2-confirm')?.addEventListener('click', () => { div.remove(); resolve(true); });
      div.querySelector('.swal2-cancel')?.addEventListener('click', () => { div.remove(); resolve(false); });
      div.addEventListener('click', e => { if (e.target === div) { div.remove(); resolve(false); } });
    });
  };
})();

Swal.fire = Swal;
Swal.confirm = (text) => Swal({ text, showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não' });