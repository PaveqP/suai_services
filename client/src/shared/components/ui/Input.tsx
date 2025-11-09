import styled from 'styled-components';

export interface InputProps {
  error?: boolean;
  hasIcon?: boolean;
}

export const Input = styled.input<InputProps>`
  width: 100%;
  padding: 12px 16px;
  padding-left: ${props => props.hasIcon ? '40px' : '16px'};
  border: 2px solid ${props => props.error ? '#ef4444' : '#e5e7eb'};
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#3b82f6'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;