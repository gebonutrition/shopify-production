/* RAW GRAVITY · <rg-count-up> custom element.
   Shared by sections rg-pdp-timeline, rg-pdp-trust. Loaded by each of them as a module
   (<script type="module">), so it runs once per page whichever of them is on the page.
   A section {% javascript %} block runs only when that section itself is on the page. */
/* Counts the first number inside [data-count] up from 0 when visible
   (optional data-min-width: only from that viewport width up). */
if (!customElements.get('rg-count-up')) {
  customElements.define(
    'rg-count-up',
    class RgCountUp extends HTMLElement {
      connectedCallback() {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) return;
        /* data-min-width="990": animate only from that viewport width up */
        const minWidth = Number(this.dataset.minWidth || 0);
        if (minWidth && !window.matchMedia(`(min-width: ${minWidth}px)`).matches) return;
        this.items = Array.from(this.querySelectorAll('[data-count]')).map((el) => ({
          el,
          text: el.textContent,
          target: Number((el.textContent.match(/\d+/) || [])[0]),
        }));
        this.items = this.items.filter((item) => item.target > 0);
        this.items.forEach((item) => {
          item.el.textContent = item.text.replace(/\d+/, '0');
        });
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const item = this.items.find((candidate) => candidate.el === entry.target);
              this.observer.unobserve(entry.target);
              if (item) this.run(item);
            });
          },
          { threshold: 0.6 }
        );
        this.items.forEach((item) => this.observer.observe(item.el));
      }

      disconnectedCallback() {
        this.observer?.disconnect();
      }

      run(item) {
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min(1, (now - start) / 1300);
          const value = Math.round(item.target * (1 - Math.pow(1 - progress, 3)));
          item.el.textContent = item.text.replace(/\d+/, String(value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
  );
}
