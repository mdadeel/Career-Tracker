import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

interface WidgetProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Widget({ title, action, children }: WidgetProps) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xs">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="px-4 py-3">{children}</CardContent>
    </Card>
  );
}
