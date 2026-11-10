/* RAW GRAVITY · <rg-video-reviews> custom element.
   Shared by sections rg-video-reviews, rg-pdp-main, rg-pdp-community. Loaded by each of them as a module
   (<script type="module">), so it runs once per page whichever of them is on the page.
   A section {% javascript %} block runs only when that section itself is on the page. */
/* Video reviews: one video plays at a time; mobile swipe dots; optional arrows (data-rg-step). */
if (!customElements.get('rg-video-reviews')) {
  customElements.define(
    'rg-video-reviews',
    class RgVideoReviews extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-rg-track]');
        this.cards = Array.from(this.querySelectorAll('[data-rg-card]'));
        this.dots = Array.from(this.querySelectorAll('[data-rg-dot]'));
        this.onClick = this.onClick.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.addEventListener('click', this.onClick);
        this.track?.addEventListener('scroll', this.onScroll, { passive: true });
        this.cards.forEach((card) => {
          const video = card.querySelector('video');
          if (!video) return;
          video.addEventListener('pause', () => this.setPlaying(card, false));
          video.addEventListener('play', () => this.setPlaying(card, true));
        });
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.track?.removeEventListener('scroll', this.onScroll);
      }

      onClick(event) {
        const step = event.target.closest('[data-rg-step]');
        if (step && this.track) {
          /* Arrows: scroll one card; scroll-snap settles on the nearest card */
          const card = this.cards[0];
          const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
          const distance = (card ? card.offsetWidth : this.track.clientWidth / 3) + gap;
          this.track.scrollBy({ left: Number(step.dataset.rgStep) * distance, behavior: 'smooth' });
          return;
        }
        const button = event.target.closest('[data-rg-play]');
        if (!button) return;
        const card = button.closest('[data-rg-card]');
        const video = card?.querySelector('video');
        if (!video) return;
        if (video.paused) {
          this.cards.forEach((other) => {
            const otherVideo = other.querySelector('video');
            if (otherVideo && otherVideo !== video) otherVideo.pause();
          });
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        } else {
          video.pause();
        }
      }

      setPlaying(card, playing) {
        card.classList.toggle('is-playing', playing);
        card.classList.toggle('is-active', playing);
        card.querySelector('[data-rg-play]')?.setAttribute('aria-pressed', String(playing));
      }

      onScroll() {
        if (!this.dots.length || !this.track) return;
        window.cancelAnimationFrame(this.frame);
        this.frame = window.requestAnimationFrame(() => {
          const trackLeft = this.track.getBoundingClientRect().left;
          let active = 0;
          let best = Infinity;
          this.cards.forEach((card, index) => {
            const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
            if (distance < best) {
              best = distance;
              active = index;
            }
          });
          this.dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
        });
      }
    }
  );
}
