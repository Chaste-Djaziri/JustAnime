import React from 'react';
import website_name from '@/src/config/website.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield } from "@fortawesome/free-solid-svg-icons";

function DMCA() {
  return (
    <div className="max-w-5xl mx-auto pt-16 pb-5">
      {/* Content */}
      <div className="space-y-12 text-white/60">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">DMCA Takedown Request Requirements</h1>
        </div>

        <div>
          <p className="leading-relaxed text-base">
            We take the intellectual property rights of others seriously and require that our Users do the same. 
            The Digital Millennium Copyright Act (DMCA) established a process for addressing claims of copyright infringement. 
            If you own a copyright or have authority to act on behalf of a copyright owner and want to report a claim that a 
            third party is infringing that material on or through {website_name}'s services, please submit a DMCA report on 
            our Contact page, and we will take appropriate action.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">DMCA Report Requirements</h2>
          <ul className="space-y-3">
            {[
              "A description of the copyrighted work that you claim is being infringed;",
              "A description of the material you claim is infringing and that you want removed or access to which you want disabled and the URL or other location of that material;",
              "Your name, title (if acting as an agent), address, telephone number, and email address;",
              'The following statement: "I have a good faith belief that the use of the copyrighted material I am complaining of is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)";',
              'The following statement: "The information in this notice is accurate and, under penalty of perjury, I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right that is allegedly infringed";',
              "An electronic or physical signature of the owner of the copyright or a person authorized to act on the owner's behalf."
            ].map((requirement, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-sm mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-base">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Submit Your Request</h2>
          <p className="leading-relaxed text-base">
            Your DMCA takedown request should be submit here:{' '}
            <a 
              href="/contact" 
              className="text-white hover:text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/40 transition-colors"
            >
              /contact
            </a>
          </p>
          <p className="mt-3 leading-relaxed text-base">
            We will then review your DMCA request and take proper actions, including removal of the content from the website.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DMCA; 