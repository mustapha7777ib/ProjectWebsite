import React, { useEffect, useRef } from "react";

function About() {
  const aboutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current);
      }
    };
  }, []);

  return (
    <div id="about" className="about cto" ref={aboutRef}>
      <h1 className="hear">Hear About Us From Our CEO</h1>
      <div className="hearwhatoga">
        <p className="hearwhat">
          We are a company dedicated to bridging the gap
          between individuals in need of skilled labor services
          and qualified professionals who provide them.
          Our platform makes it easy for people to find and book
          reliable service providers, whether they require electrical work,
          carpentry, plumbing, or other specialized services.
          Our goal is to simplify the process of hiring skilled labor
          by offering a seamless, trustworthy, and efficient experience,
          ultimately saving our customers time and effort
          while ensuring high-quality service.
        </p>
        <p className="ceo">- Mustapha Ibrahim<br />CEO, Work Up</p>
        <p></p>
      </div>
    </div>
  );
}

export default About;