import React, { useEffect, useRef } from "react";

function Testimonials() {
  const testimonialsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of each card is visible
    );

    if (testimonialsRef.current) {
      const cards = testimonialsRef.current.querySelectorAll(".testimonial-card");
      cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`; // Stagger animations
        observer.observe(card);
      });
    }

    return () => {
      if (testimonialsRef.current) {
        const cards = testimonialsRef.current.querySelectorAll(".testimonial-card");
        cards.forEach((card) => observer.unobserve(card));
      }
    };
  }, []);

  return (
    <div id="testimonials" className="testimonials abc">
      <h1 className="testimonials-title">What Our Users Say</h1>
      <div className="testimonials-grid" ref={testimonialsRef}>
        <div className="testimonial-card">
          <div className="testimonial-card-inner">
            <p className="testimonial-quote">
              "Work Up connected me with a fantastic plumber who fixed my issue quickly. The booking process was seamless and stress-free!"
            </p>
            <div className="testimonial-author">
              <p>Layla Hassan</p>
              <p>Customer</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <div className="testimonial-card-inner">
            <p className="testimonial-quote">
              "As an electrician, Work Up has been a game-changer. I get regular clients who appreciate my skills, and the platform is easy to use."
            </p>
            <div className="testimonial-author">
              <p>Khaled Omar</p>
              <p>Artisan</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <div className="testimonial-card-inner">
            <p className="testimonial-quote">
              "I found a skilled carpenter for my home renovation through Work Up. The quality of service was outstanding, and I’ll use it again!"
            </p>
            <div className="testimonial-author">
              <p>Amina Bello</p>
              <p>Customer</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <div className="testimonial-card-inner">
            <p className="testimonial-quote">
              "Work Up’s platform helps me showcase my masonry work and connect with clients efficiently. It’s boosted my business significantly."
            </p>
            <div className="testimonial-author">
              <p>Ibrahim Musa</p>
              <p>Artisan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;