(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Menú móvil
  const toggle = $('[data-menu-toggle]');
  const nav = $('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Navegación de pestañas dentro de paneles
  $$('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tabTarget;
      $$('[data-tab-target]').forEach(b => b.classList.toggle('active', b === btn));
      $$('[data-tab-panel]').forEach(p => p.hidden = p.dataset.tabPanel !== id);
    });
  });

  // Formularios de esta entrega: validación visual, sin simular conexión a BD.
  $$('form[data-pending-integration]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const note = $('[data-form-message]', form) || $('[data-form-message]');
      if (note) {
        note.textContent = 'Interfaz lista. La operación se activará al conectar Supabase en la siguiente etapa.';
        note.classList.add('notice');
      }
    });
  });

  // Selector de tipo de registro
  const roleSelect = $('#register-role');
  const driverFields = $('[data-driver-fields]');
  if (roleSelect && driverFields) {
    const update = () => driverFields.hidden = roleSelect.value !== 'transportista';
    roleSelect.addEventListener('change', update);
    update();
  }

  // Demo de añadir solicitudes al resumen local de la pantalla, sin persistencia real.
  const serviceForm = $('#service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!serviceForm.reportValidity()) return;
      const type = $('#service-type')?.value || 'Moto taxi';
      const pickup = $('#pickup')?.value || '';
      const destination = $('#destination')?.value || '';
      const card = document.createElement('article');
      card.className = 'service-card';
      card.innerHTML = `<div class="service-top"><span class="pill">Pendiente de conexión</span><strong>${escapeHtml(type)}</strong></div>
        <p><b>Recojo:</b> ${escapeHtml(pickup)}</p><p><b>Destino:</b> ${escapeHtml(destination)}</p>
        <small>La solicitud solo se guardará y distribuirá cuando conectemos Supabase.</small>`;
      $('#service-list')?.prepend(card);
      serviceForm.reset();
      $('#service-message').textContent = 'Vista previa creada. Todavía no se envió a transportistas.';
    });
  }

  // Botones de muestra: informan qué integración falta sin fingir que guardaron datos.
  $$('[data-integration-action]').forEach(btn => btn.addEventListener('click', () => {
    const message = btn.dataset.message || 'Esta acción se habilitará al integrar Supabase.';
    const target = $('[data-global-message]');
    if (target) target.textContent = message;
    else alert(message);
  }));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();
