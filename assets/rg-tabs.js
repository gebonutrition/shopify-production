/* RAW GRAVITY · <rg-tabs> custom element.
   Shared by sections rg-reviews, rg-pdp-reviews, rg-pdp-faq. Loaded by each of them as a module
   (<script type="module">), so it runs once per page whichever of them is on the page.
   A section {% javascript %} block runs only when that section itself is on the page. */
/* Tabs with prev/next and dots (.rg-reviews__dot). */
if (!customElements.get('rg-tabs')) {
  customElements.define(
    'rg-tabs',
    class RgTabs extends HTMLElement {
      connectedCallback() {
        this.panels = Array.from(this.querySelectorAll('[data-rg-panel]'));
        this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
        this.dots = Array.from(this.querySelectorAll('.rg-reviews__dot'));
        this.index = 0;
        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.addEventListener('click', this.onClick);
        this.addEventListener('keydown', this.onKeydown);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('keydown', this.onKeydown);
      }

      onClick(event) {
        const target = event.target.closest('[data-rg-tab], [data-rg-prev], [data-rg-next]');
        if (!target || !this.contains(target)) return;
        if (target.hasAttribute('data-rg-prev')) this.select(this.index - 1);
        else if (target.hasAttribute('data-rg-next')) this.select(this.index + 1);
        else this.select(Number(target.dataset.rgTab));
      }

      onKeydown(event) {
        if (!event.target.matches('[role="tab"]')) return;
        if (event.key === 'ArrowRight') this.select(this.index + 1, true);
        else if (event.key === 'ArrowLeft') this.select(this.index - 1, true);
      }

      select(index, focusTab) {
        const count = this.panels.length;
        if (!count) return;
        this.index = ((index % count) + count) % count;
        this.panels.forEach((panel, i) => {
          panel.hidden = i !== this.index;
        });
        this.tabs.forEach((tab, i) => {
          const active = i === this.index;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          if (active && focusTab) tab.focus();
        });
        this.dots.forEach((dot, i) => {
          if (i === this.index) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
      }
    }
  );
}
