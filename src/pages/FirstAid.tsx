import { ArrowLeft, Heart, Wind, Flame, Droplets, Bone, AlertTriangle, Baby, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SantraLogo } from "@/components/SantraLogo";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const firstAidGuides = [
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    icon: Heart,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    steps: [
      "Check the scene is safe and tap the person to check for responsiveness.",
      "Call emergency services (or ask someone else to) immediately.",
      "Place the person on their back on a firm, flat surface.",
      "Place the heel of one hand on the center of their chest, other hand on top.",
      "Push hard and fast — at least 2 inches deep, at 100-120 compressions per minute.",
      "After 30 compressions, tilt the head back, lift the chin, and give 2 rescue breaths.",
      "Continue cycles of 30 compressions and 2 breaths until help arrives or the person recovers.",
    ],
  },
  {
    id: "choking",
    title: "Choking",
    icon: Wind,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    steps: [
      "Ask the person \"Are you choking?\" — if they can't speak, cough, or breathe, act immediately.",
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place it just above the navel.",
      "Grasp your fist with the other hand and thrust inward and upward firmly.",
      "Repeat thrusts until the object is expelled or the person can breathe.",
      "If the person becomes unconscious, begin CPR and check the mouth for the object before giving breaths.",
    ],
  },
  {
    id: "burns",
    title: "Burns",
    icon: Flame,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    steps: [
      "Remove the person from the source of the burn immediately.",
      "Cool the burn under cool (not cold) running water for at least 10-20 minutes.",
      "Do NOT apply ice, butter, toothpaste, or any home remedies to the burn.",
      "Remove jewelry or tight clothing near the burn before swelling occurs.",
      "Cover the burn loosely with a sterile, non-stick bandage.",
      "For severe burns (larger than your palm, on face/joints, or deep), seek emergency medical care.",
      "Give over-the-counter pain relief if needed (follow label instructions).",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: Droplets,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    steps: [
      "Apply direct, firm pressure to the wound using a clean cloth or bandage.",
      "If possible, elevate the injured area above the level of the heart.",
      "Do NOT remove the cloth if blood soaks through — add more layers on top.",
      "Maintain continuous pressure for at least 15 minutes.",
      "If bleeding is from a limb and doesn't stop, apply a tourniquet 2-3 inches above the wound as a last resort.",
      "Call emergency services for any severe or uncontrolled bleeding.",
      "Keep the person calm and still; watch for signs of shock (pale skin, rapid breathing).",
    ],
  },
  {
    id: "fractures",
    title: "Fractures & Broken Bones",
    icon: Bone,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    steps: [
      "Do NOT try to straighten or move the broken bone.",
      "Immobilize the injured area — use a splint or padding to prevent movement.",
      "Apply ice wrapped in a cloth to reduce swelling (20 minutes on, 20 off).",
      "If there is an open wound with the fracture, cover it with a clean bandage.",
      "Watch for signs of shock and keep the person comfortable.",
      "Seek immediate medical attention — call emergency services for severe fractures.",
    ],
  },
  {
    id: "allergic-reaction",
    title: "Severe Allergic Reaction (Anaphylaxis)",
    icon: AlertTriangle,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    steps: [
      "Call emergency services immediately if the person has difficulty breathing, swelling of face/throat, or feels faint.",
      "If the person has an epinephrine auto-injector (EpiPen), help them use it on the outer thigh.",
      "Have the person lie down with legs elevated (unless they have difficulty breathing — then let them sit up).",
      "Loosen tight clothing and cover with a blanket to prevent shock.",
      "If symptoms don't improve in 5-15 minutes, a second dose of epinephrine may be given.",
      "Do NOT give food, drink, or oral medication if the person is having trouble breathing.",
      "Stay with the person until emergency help arrives.",
    ],
  },
  {
    id: "seizure",
    title: "Seizures",
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    steps: [
      "Stay calm and time the seizure. Call emergency services if it lasts more than 5 minutes.",
      "Clear the area of hard or sharp objects to prevent injury.",
      "Do NOT hold the person down or try to stop their movements.",
      "Do NOT put anything in their mouth — they cannot swallow their tongue.",
      "Gently roll the person onto their side after the seizure stops (recovery position).",
      "Stay with them until they are fully conscious and aware.",
      "Speak calmly and reassure them as they recover.",
    ],
  },
  {
    id: "infant-choking",
    title: "Infant Choking (Under 1 Year)",
    icon: Baby,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    steps: [
      "Hold the infant face-down on your forearm, supporting the head and jaw.",
      "Give 5 firm back blows between the shoulder blades using the heel of your hand.",
      "Turn the infant face-up, supporting the head, and give 5 chest thrusts using 2 fingers on the breastbone.",
      "Alternate between 5 back blows and 5 chest thrusts until the object is expelled.",
      "If the infant becomes unconscious, begin infant CPR immediately.",
      "Call emergency services if you haven't already.",
    ],
  },
];

export default function FirstAid() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
              <ArrowLeft size={20} />
            </Button>
            <SantraLogo size="sm" />
          </div>
          <Button variant="ghost" onClick={() => navigate("/chat")}>
            Back to Chat
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            🩹 First Aid Quick Guide
          </h1>
          <p className="text-muted-foreground">
            Step-by-step emergency instructions. No internet needed once loaded.
          </p>
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This guide is for educational purposes only. In a real emergency, always call your local emergency services first.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {firstAidGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <AccordionItem
                key={guide.id}
                value={guide.id}
                className="bg-card border border-border rounded-2xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${guide.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon size={20} className={guide.color} />
                    </div>
                    <span className="font-semibold text-foreground text-left">{guide.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <ol className="space-y-3 ml-1">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>
    </div>
  );
}
