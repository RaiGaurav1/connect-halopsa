import React from 'react';
import { SvgIcon, SxProps, Theme } from '@mui/material';

interface EmptyStateIllustrationProps {
  sx?: SxProps<Theme>;
}

const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({ sx }) => {
  return (
    <SvgIcon sx={{ ...sx, width: '100%', height: '100%', fontSize: 'inherit' }} viewBox="0 0 240 180">
      <path fill="#f5f5f7" d="M0 0h240v180H0z" />
      <path fill="#dde3e9" d="M40 56h160v90H40z" />
      <path fill="#fff" d="M48 65h144v73H48z" />
      <path fill="#6b7280" d="M70 85h100v4H70z" />
      <path fill="#9ca3af" d="M70 97h70v3H70z" />
      <path fill="#9ca3af" d="M70 108h80v3H70z" />
      <path fill="#e5e7eb" d="M70 120h30v15H70z" />
      <path fill="#e5e7eb" d="M110 120h30v15h-30z" />
      <circle fill="#4f46e5" cx="172" cy="75" r="10" />
      <path fill="#fff" d="m169 72 2 2 4-4 1 1-5 5-3-3z" />
      <path fill="#9ca3af" d="M128 33c-13 0-23 10-23 23h46c0-13-10-23-23-23z" />
      <path fill="#e5e7eb" d="M133 39c-10-3-20 3-23 13h36c-3-10-10-16-13-13z" />
      <path fill="#9ca3af" d="M127 150c9 0 16-7 16-16h-32c0 9 7 16 16 16z" />
      <path fill="#e5e7eb" d="M123 146c7 2 14-2 16-9h-25c2 7 7 11 9 9z" />
    </SvgIcon>
  );
};

export default EmptyStateIllustration;
