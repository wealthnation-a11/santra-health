import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Droplets, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bmi = height && weight ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)) : null;
  const getCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal", color: "text-primary" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-destructive" };
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
      </div>
      {bmi && bmi > 0 && bmi < 100 && (
        <div className="bg-accent rounded-xl p-4 text-center animate-fade-in">
          <p className="text-3xl font-bold text-foreground">{bmi.toFixed(1)}</p>
          <p className={`font-semibold ${getCategory(bmi).color}`}>{getCategory(bmi).label}</p>
          <p className="text-xs text-muted-foreground mt-2">BMI is a screening tool, not a diagnostic measure.</p>
        </div>
      )}
    </div>
  );
}

function WaterIntakeCalculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const multiplier = activity === "low" ? 30 : activity === "moderate" ? 35 : 40;
  const intake = weight ? ((parseFloat(weight) * multiplier) / 1000) : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Weight (kg)</Label>
        <Input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Activity Level</Label>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Sedentary</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="high">Active / Athletic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {intake && intake > 0 && (
        <div className="bg-accent rounded-xl p-4 text-center animate-fade-in">
          <p className="text-3xl font-bold text-foreground">{intake.toFixed(1)}L</p>
          <p className="text-sm text-muted-foreground">Recommended daily water intake</p>
          <p className="text-xs text-muted-foreground mt-2">≈ {Math.round(intake / 0.25)} glasses (250ml each)</p>
        </div>
      )}
    </div>
  );
}

function CalorieEstimator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("1.55");

  const bmr = age && weight && height
    ? gender === "male"
      ? 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5
      : 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161
    : null;
  const tdee = bmr ? bmr * parseFloat(activity) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Activity Level</Label>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1.2">Sedentary (little exercise)</SelectItem>
            <SelectItem value="1.375">Light (1-3 days/week)</SelectItem>
            <SelectItem value="1.55">Moderate (3-5 days/week)</SelectItem>
            <SelectItem value="1.725">Active (6-7 days/week)</SelectItem>
            <SelectItem value="1.9">Very Active (athlete)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {tdee && tdee > 0 && (
        <div className="bg-accent rounded-xl p-4 text-center animate-fade-in">
          <p className="text-3xl font-bold text-foreground">{Math.round(tdee)}</p>
          <p className="text-sm text-muted-foreground">Estimated daily calories (kcal)</p>
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-muted-foreground">
            <div><p className="font-semibold text-foreground">{Math.round(tdee - 500)}</p>Lose weight</div>
            <div><p className="font-semibold text-foreground">{Math.round(tdee)}</p>Maintain</div>
            <div><p className="font-semibold text-foreground">{Math.round(tdee + 500)}</p>Gain weight</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tools() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft size={20} />
          </Button>
          <Calculator size={22} className="text-primary" />
          <h1 className="text-xl font-display font-bold">Health Tools</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="bmi" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bmi" className="gap-1.5"><Calculator size={14} />BMI</TabsTrigger>
            <TabsTrigger value="water" className="gap-1.5"><Droplets size={14} />Water</TabsTrigger>
            <TabsTrigger value="calories" className="gap-1.5"><Flame size={14} />Calories</TabsTrigger>
          </TabsList>

          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle>BMI Calculator</CardTitle>
                <CardDescription>Calculate your Body Mass Index</CardDescription>
              </CardHeader>
              <CardContent><BMICalculator /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle>Water Intake Calculator</CardTitle>
                <CardDescription>Find your recommended daily water intake</CardDescription>
              </CardHeader>
              <CardContent><WaterIntakeCalculator /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calories">
            <Card>
              <CardHeader>
                <CardTitle>Calorie Estimator</CardTitle>
                <CardDescription>Estimate daily calorie needs (Mifflin-St Jeor)</CardDescription>
              </CardHeader>
              <CardContent><CalorieEstimator /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
