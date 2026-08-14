import React from 'react';
import logoImg from '../../assets/images/klinatop_logo_1786547596570.jpg';

interface KlinaTopLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  lightBackground?: boolean;
}

export const KlinaTopLogo: React.FC<KlinaTopLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  lightBackground = true,
}) => {
  const containerSizes = {
    sm: 'max-w-[130px]',
    md: 'max-w-[190px]',
    lg: 'max-w-[260px]',
    xl: 'max-w-[320px]',
  };

  const imgHeights = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32',
  };

  return (
    <div className={`flex flex-col items-center justify-center font-poppins text-center select-none ${className}`}>
      {/* Official Exact KlinaTop Logo Image Asset */}
      <div className={`relative flex flex-col items-center justify-center ${containerSizes[size]}`}>
        <img
          src={logoImg}
          alt="KlinaTop Logo Officiel"
          referrerPolicy="no-referrer"
          className={`${imgHeights[size]} w-auto object-contain drop-shadow-sm rounded-lg transition-transform hover:scale-102`}
        />
      </div>

      {/* Optional Slogan detail if variant is 'full' and on light background */}
      {variant === 'full' && (
        <div className="mt-1">
          <p
            className={`text-[10px] sm:text-xs font-semibold max-w-[260px] mx-auto leading-tight ${
              lightBackground ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            Solution de pointage & suivi terrain
          </p>
        </div>
      )}
    </div>
  );
};

