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
          We are a company dedicated to bridging the gap<br />
          between individuals in need of skilled labor services<br />
          and qualified professionals who provide them.<br />
          Our platform makes it easy for people to find and book<br />
          reliable service providers, whether they require electrical work,<br />
          carpentry, plumbing, or other specialized services.<br />
          Our goal is to simplify the process of hiring skilled labor<br />
          by offering a seamless, trustworthy, and efficient experience,<br />
          ultimately saving our customers time and effort<br />
          while ensuring high-quality service.
        </p>
        <div className="ceo">
          <p>- Mustapha Ibrahim</p>
          <p>CEO, Work Up</p>
        </div>
      </div>
    </div>
  );
}

export default About;