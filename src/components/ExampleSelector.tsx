import { examples } from "@/demos/examples";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ExampleSelectorProps {
  onSelect: (exampleId: string) => void;
}

export function ExampleSelector({ onSelect }: ExampleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examples.map((example) => {
        const Icon = example.icon;
        return (
          <Card
            key={example.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect(example.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle>{example.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{example.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
