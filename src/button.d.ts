import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  customProp?: string;
}

declare const Button: React.FC<ButtonProps>;

export default Button;
