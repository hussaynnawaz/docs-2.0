import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add any additional props specific to your Input component
  customProp?: string;
}

declare const Input: React.FC<InputProps>;

export default Input;
