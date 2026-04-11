import React from "react";

const About = () => {
  const teamMembers = [
    { name: "Team Member 1", role: "Developer" },
    { name: "Team Member 2", role: "Developer" },
    { name: "Team Member 3", role: "Developer" },
    { name: "Team Member 4", role: "Developer" },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-transparent text-gray-300 font-mono p-4 sm:p-8 max-w-5xl mx-auto flex flex-col justify-center py-10">
      <div className="space-y-6 sm:space-y-8">
        {/* Project Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-green-500 uppercase tracking-widest border-b border-green-500/30 pb-2">
            About The Project
          </h2>
          <p className="text-sm leading-relaxed">
            CTF Pi is an interactive Capture The Flag platform designed to
            challenge your cybersecurity skills. Built on a lightweight
            architecture, it serves as a training ground for enthusiasts to
            practice exploitation, reverse engineering, cryptography, and more
            in a safe, controlled environment. Our system bridges real-world
            vulnerabilities with educational puzzles to help you master the
            terminal.
          </p>
        </section>

        {/* Rules Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-green-500 uppercase tracking-widest border-b border-green-500/30 pb-2">
            Rules of Engagement
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm ml-4">
            <li>
              <strong className="text-white">
                No Denial of Service (DoS):
              </strong>{" "}
              Do not attempt to overwhelm the infrastructure.
            </li>
            <li>
              <strong className="text-white">Scope Restrictions:</strong> Only
              attack designated challenge targets. The underlying infrastructure
              and other users are strictly out of bounds.
            </li>
            <li>
              <strong className="text-white">Flag Format:</strong> Unless
              otherwise specified, flags follow the standard format:{" "}
              <span className="text-green-400 bg-green-500/10 px-1 py-0.5 rounded">
                CTF{"{"}flag_string{"}"}
              </span>
              .
            </li>
            <li>
              <strong className="text-white">No Flag Sharing:</strong>{" "}
              Collaboration is encouraged, but sharing exact solutions or flags
              ruins the fun for everyone.
            </li>
            <li>
              <strong className="text-white">Report Bugs:</strong> If you find a
              vulnerability in the platform itself, disclose it privately to the
              admins.
            </li>
          </ul>
        </section>

        {/* Team Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-green-500 uppercase tracking-widest border-b border-green-500/30 pb-2">
            Meet The Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-black/50 border border-green-500/20 p-4 rounded-lg text-center hover:border-green-500/60 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-neutral-800 rounded-full mx-auto mb-2 border-2 border-green-500/50 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl text-green-500/40">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-green-400 font-bold uppercase tracking-wider">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
