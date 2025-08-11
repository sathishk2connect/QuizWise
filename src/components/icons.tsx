
import { BrainCircuit, Star, Menu, Library } from 'lucide-react';
import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => <BrainCircuit {...props} />,
  star: (props: SVGProps<SVGSVGElement>) => <Star {...props} />,
  menu: (props: SVGProps<SVGSVGElement>) => <Menu {...props} />,
  library: (props: SVGProps<SVGSVGElement>) => <Library {...props} />,
};
