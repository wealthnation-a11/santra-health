import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsultDoctorButtonProps {
  className?: string;
}

export function ConsultDoctorButton({ className }: ConsultDoctorButtonProps) {
  const handleConsult = () => {
    window.open("https://prescribly.app", "_blank");
  };

  return (
    <Button
      variant="santra"
      size="sm"
      onClick={handleConsult}
      className={className}
    >
      <Stethoscope className="mr-2 h-4 w-4" />
      Consult a Doctor
    </Button>
  );
}
