import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlphaBadge } from "./AlphaBadge";

interface LogoProps {
  className?: string;
  asLink?: boolean;
  showAlpha?: boolean;
  size?: 'sm' | 'lg';
}

export function Logo({ className, asLink = true, showAlpha = true, size = 'sm' }: LogoProps) {
  const LogoContent = () => (
    <div className="relative inline-flex">
      <svg 
        width="320" 
        height="132" 
        viewBox="0 0 320 132" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn(
          size === 'sm' ? "h-12" : "h-20",
          "w-auto",
          className
        )}
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M84.0775 85C90.1805 85 94.6231 81.5125 94.6231 74.1134V53H88.206V74.0191C88.206 77.0353 86.3661 79.0619 83.539 79.0619C81.4747 79.0619 79.949 77.9779 78.7822 76.7997L76 81.8895C78.154 84.1046 81.026 85 84.0775 85ZM124.954 85C134.064 85 138.462 79.6274 138.462 71.8513V53H131.955V71.6627C131.955 76.0457 129.576 79.0619 124.954 79.0619C120.332 79.0619 117.909 76.0457 117.909 71.6627V53H111.447V71.8513C111.447 79.6274 115.845 85 124.954 85ZM172.248 84.4345H179.608L172.831 72.4639C176.062 71.6627 179.428 68.6465 179.428 63.1325C179.428 57.2887 175.569 53 169.331 53H155.33V84.4345H161.702V73.2651H166.369L172.248 84.4345ZM168.434 67.3741C170.947 67.3741 172.876 65.7717 172.876 63.0854C172.876 60.4934 170.947 58.891 168.434 58.891H161.702V67.3741H168.434ZM215.817 84.4345H223.042L211.509 53H203.521L191.989 84.4345H199.213L201.098 79.109H213.932L215.817 84.4345ZM212.182 73.218L207.515 59.6922L202.848 73.218H212.182ZM255.931 58.891H247.225V84.4345H240.808V58.891H232.058V53H255.931V58.891ZM296 84.4345H288.775L286.89 79.109H274.056L272.171 84.4345H264.947L276.479 53H284.467L296 84.4345ZM280.473 59.6922L285.14 73.218H275.806L280.473 59.6922Z" fill="#3C5074"/>
        <path d="M41 51L53 39V82L41 94V51Z" fill="url(#paint0_linear_1884_52)"/>
        <path d="M25 80L39 94V80L25 66V80Z" fill="url(#paint1_linear_1884_52)"/>
        <path d="M38.9985 94V80L31 72L38.9985 94Z" fill="black" fillOpacity="0.15"/>
        <defs>
          <linearGradient id="paint0_linear_1884_52" x1="41" y1="39" x2="41" y2="94" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A6B2C9"/>
            <stop offset="1" stopColor="#3C5074"/>
          </linearGradient>
          <linearGradient id="paint1_linear_1884_52" x1="23.9968" y1="90.2403" x2="38.0069" y2="91.7503" gradientUnits="userSpaceOnUse">
            <stop offset="0.0228795" stopColor="#A6B2C9"/>
            <stop offset="1" stopColor="#3C5074"/>
          </linearGradient>
        </defs>
      </svg>
      {showAlpha && (
        <div style={{
          position: 'absolute',
          top: size === 'lg' ? '25px' : '14px',
          right: size === 'lg' ? '-20px' : '-20px'
        }}>
          <AlphaBadge size={size === 'lg' ? 'md' : 'sm'} />
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="flex items-center">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}