/* RAW GRAVITY · <rg-ingredients> custom element.
   Shared by sections rg-ingredients, rg-pdp-ingredients. Loaded by each of them as a module
   (<script type="module">), so it runs once per page whichever of them is on the page.
   A section {% javascript %} block runs only when that section itself is on the page. */
/* Ingredients modal: native <dialog>, prev/next, backdrop click; show(index) opens a panel. */
if (!customElements.get('rg-ingredients')) {
  customElements.define(
    'rg-ingredients',
    class RgIngredients extends HTMLElement {
      connectedCallback() {
        this.dialog = this.querySelector('dialog');
        this.panels = Array.from(this.querySelectorAll('[data-rg-panel]'));
        this.index = 0;
        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.addEventListener('click', this.onClick);
        this.dialog?.addEventListener('keydown', this.onKeydown);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.dialog?.removeEventListener('keydown', this.onKeydown);
      }

      onClick(event) {
        const open = event.target.closest('[data-rg-open]');
        if (open) {
          this.opener = open;
          this.show(Number(open.dataset.rgOpen));
          return;
        }
        if (!this.dialog?.open) return;
        if (event.target === this.dialog || event.target.closest('[data-rg-close]')) this.close();
        else if (event.target.closest('[data-rg-prev]')) this.show(this.index - 1);
        else if (event.target.closest('[data-rg-next]')) this.show(this.index + 1);
      }

      onKeydown(event) {
        if (event.key === 'ArrowRight') this.show(this.index + 1);
        if (event.key === 'ArrowLeft') this.show(this.index - 1);
      }

      show(index) {
        if (!this.dialog || !this.panels.length) return;
        const count = this.panels.length;
        this.index = ((index % count) + count) % count;
        this.panels.forEach((panel, i) => {
          panel.hidden = i !== this.index;
        });
        if (!this.dialog.open) {
          this.dialog.showModal();
          /* Horizon's own scroll lock: on desktop .page-wrapper is the scroll container */
          document.documentElement.setAttribute('scroll-lock', '');
          this.dialog.addEventListener(
            'close',
            () => {
              document.documentElement.removeAttribute('scroll-lock');
              this.opener?.focus();
            },
            { once: true }
          );
        }
      }

      close() {
        this.dialog?.close();
      }
    }
  );
}
