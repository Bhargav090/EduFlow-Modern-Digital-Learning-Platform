import React from 'react';
import PublicLayout from '../components/PublicLayout';

const DemoPage = () => {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-900">Welcome to the Eduflow Demo</h1>
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube-nocookie.com/embed/PeMlggyqz0Y?si=J-Mpt_Zxp0DwJFIK&amp;controls=0&amp;modestbranding=1&amp;rel=0&amp;autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore the Future of Learning</h2>
          <p className="text-lg text-slate-500 mb-4 leading-relaxed">
            This demo showcases the core experience of our platform. See how students can interact with course materials, watch high-quality video lectures, and track their progress.
          </p>
          <p className="text-lg text-slate-500 leading-relaxed">
            Our intuitive interface is designed to be clean and distraction-free, allowing learners to focus on what matters most: acquiring new knowledge and skills.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default DemoPage;
