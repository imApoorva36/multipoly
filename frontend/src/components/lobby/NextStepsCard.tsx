"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NextStepsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">What happens next?</CardTitle>
        <CardDescription>
          After creating or joining a room, you&apos;ll be redirected to the dedicated room space for chat and participant management.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
