import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  id?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, id = "resume-preview" }) => {
  return (
    <div 
      id={id}
      className="bg-white mx-auto p-[40px] md:p-[50px] text-gray-800 text-sm leading-relaxed shadow-xl print:shadow-none"
      style={{ 
        fontFamily: "'Inter', sans-serif",
        width: '210mm',
        minHeight: '297mm',
      }}
    >
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tight mb-4 font-heading text-center md:text-left">
          {data.fullName}
        </h1>
        <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-4 text-gray-600 text-xs">
          {data.contactInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" />
              <span>{data.contactInfo.email}</span>
            </div>
          )}
          {data.contactInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              <span>{data.contactInfo.phone}</span>
            </div>
          )}
          {data.contactInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span>{data.contactInfo.location}</span>
            </div>
          )}
          {data.contactInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin size={14} className="text-gray-400" />
              <a href={data.contactInfo.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                 LinkedIn
              </a>
            </div>
          )}
           {data.contactInfo.website && (
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-gray-400" />
              <a href={data.contactInfo.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                 Portfolio
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 flex items-center">
            <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
            Professional Summary
          </h2>
          <p className="text-gray-700 text-justify leading-relaxed text-xs md:text-sm">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center">
            <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-50 text-gray-700 px-2.5 py-1 rounded border border-gray-100 text-xs font-medium print:border-gray-300">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
            <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
            Professional Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">{exp.role}</h3>
                  <span className="text-gray-500 text-xs font-medium whitespace-nowrap">{exp.duration}</span>
                </div>
                <div className="text-primary font-medium text-xs mb-2">{exp.company}</div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700 text-xs md:text-sm marker:text-gray-300">
                  {exp.details.map((detail, dIdx) => (
                    <li key={dIdx} className="pl-1 leading-relaxed">{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
            <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
            Key Projects
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="border-l-2 border-gray-100 pl-3 print:border-gray-300">
                 <h3 className="font-bold text-gray-900 text-sm mb-0.5">{proj.name}</h3>
                 <p className="text-gray-700 mb-1.5 text-xs leading-relaxed">{proj.description}</p>
                 <div className="flex flex-wrap gap-1 opacity-80">
                    {proj.technologies.map((tech, tIdx) => (
                         <span key={tIdx} className="text-[10px] text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded">#{tech}</span>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center">
            <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{edu.school}</h3>
                  <p className="text-gray-600 text-xs">{edu.degree}</p>
                </div>
                <span className="text-gray-500 text-xs font-medium">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};