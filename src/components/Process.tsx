// import React from 'react';
// import { motion } from 'motion/react';

// export const Process = () => {
//   const processSteps = [
//     {
//       title: "The Consultation",
//       desc: "A deep dive into your skin, features, and the aesthetic vision you wish to project."
//     },
//     {
//       title: "Skin Alchemy",
//       desc: "Bespoke preparation using elite serums and techniques to create the perfect canvas."
//     },
//     {
//       title: "Artistic Application",
//       desc: "Precise, layered artistry tailored to your unique structure and the occasion's lighting."
//     },
//     {
//       title: "The Reveal",
//       desc: "The final sublime moment where vision becomes reality. Confidence, perfected."
//     }
//   ];

//   return (
//     <section className="py-32 bg-luxury-cream/50">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="text-center mb-24 space-y-4">
//           <p className="text-luxury-gold text-xs tracking-[0.4em] uppercase">The Journey</p>
//           <h2 className="text-5xl font-serif italic">Our Signature Process</h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
//           {processSteps.map((step, i) => (
//             <motion.div 
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//               className="relative group text-center sm:text-left"
//             >
//               <div className="text-7xl sm:text-8xl font-serif italic text-luxury-gold/10 absolute -top-8 sm:-top-12 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 group-hover:text-luxury-gold/20 transition-colors">
//                 0{i + 1}
//               </div>
//               <div className="relative z-10 space-y-4">
//                 <h3 className="text-xl font-serif italic pt-4">{step.title}</h3>
//                 <p className="text-sm text-luxury-ink/60 leading-relaxed font-light">
//                   {step.desc}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };
