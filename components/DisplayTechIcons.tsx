"use client";

// DisplayTechIcons.tsx - Component for displaying technology stack icons
// This component shows icons for different technologies used in interviews
import { useEffect, useState } from "react";
import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

interface TechIconProps {
  techStack: string[];
}

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<Array<{ tech: string; url: string }>>([]);

  useEffect(() => {
    const loadTechIcons = async () => {
      const icons = await getTechLogos(techStack);
      setTechIcons(icons);
    };
    loadTechIcons();
  }, [techStack]);

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;

/* 
Modification Examples:
1. Add more icon features:
   - Add icon animations
   - Add icon size options
   - Add custom icon sets
   - Add icon backgrounds

2. Enhance tooltips:
   - Add more tooltip information
   - Add tooltip animations
   - Add tooltip positioning options
   - Add tooltip styling options

3. Add more functionality:
   - Add icon click actions
   - Add tech stack filtering
   - Add tech stack sorting
   - Add tech stack search

4. Add accessibility:
   - Add ARIA labels
   - Add keyboard navigation
   - Add screen reader support
   - Add high contrast mode
*/
