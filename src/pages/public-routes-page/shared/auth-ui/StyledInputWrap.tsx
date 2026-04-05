interface StyledInputWrapProps {
  children: React.ReactNode;
}

export default function StyledInputWrap({ children }: Readonly<StyledInputWrapProps>) {
  return <div className="relative mt-2">{children}</div>;
}
