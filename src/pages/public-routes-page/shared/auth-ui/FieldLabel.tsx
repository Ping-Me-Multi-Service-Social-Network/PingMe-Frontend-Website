import { Label } from "@/components/ui/label";

interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
}

export default function FieldLabel({ htmlFor, children }: Readonly<FieldLabelProps>) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
    >
      {children}
    </Label>
  );
}
