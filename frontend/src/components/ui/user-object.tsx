"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

const UserObject = () => {
  const { user } = usePrivy();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">User Information</CardTitle>
          <Badge variant="secondary">Debug Info</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserObject;