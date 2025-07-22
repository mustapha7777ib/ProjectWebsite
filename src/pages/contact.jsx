import React, { useEffect, useRef, useState } from "react";

function Contact() {
  const contactRef = useRef(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );

    if (contactRef.current) {
      const elements = contactRef.current.querySelectorAll(".contact-details, .contact-form");
      elements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`; // Stagger animation
        observer.observe(el);
      });
    }

    return () => {
      if (contactRef.current) {
        const elements = contactRef.current.querySelectorAll(".contact-details, .contact-form");
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000); // Hide message after 3s
    }
  };

  return (
    <div id="contact" className="contact cdg">
      <h1 className="contact-title">Contact Us</h1>
      <div className="contact-container" ref={contactRef}>
        <div className="contact-details">
          <p className="contact-intro">
            Have questions or need assistance? Reach out to us, and we’ll get back to you promptly!
          </p>
          <div className="contact-info">
            <p className="contact-item">
              <span className="contact-icon">📧</span> Email: workup@email.com
            </p>
            <p className="contact-item">
              <span className="contact-icon">📞</span> Phone: +234 905-617-1492
            </p>
            <p className="contact-item">
              <span className="contact-icon">📍</span> Address: 123 Main St, Abuja, Nigeria, 900001
            </p>
          </div>
        </div>
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="form-textarea"
            ></textarea>
            <button type="submit" className="form-submit">
              Send Message
            </button>
          </form>
          {submitted && <p className="form-success">Message sent successfully!</p>}
        </div>
      </div>
    </div>
  );
}

export default Contact;