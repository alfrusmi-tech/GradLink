const About = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1
        className="text-3xl text-gray-900 mb-6"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        About GradLink
      </h1>
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          GradLink connects new graduates with their first real job. Instead of scrolling through
          hundreds of listings hoping something fits, you upload your CV once and see exactly how
          your skills line up with each role before you apply.
        </p>
        <p>
          On the other side, recruiters post roles with the skills that actually matter, and see
          applicants ranked by real overlap — not just a resume PDF and a guess.
        </p>
        <p>
          GradLink reads your CV, extracts your skills, normalizes the naming (so "ReactJS" and
          "React.js" count the same), and calculates a match percentage against every job's
          requirements. No manual tagging, no guesswork.
        </p>
      </div>
    </div>
  );
};

export default About;
