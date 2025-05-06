
import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer } from 'lucide-react';

const Placement: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Placement</h1>
          <p className="text-muted-foreground">
            Placement information and resources
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-12">
          <Hammer className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <CardHeader className="text-center pb-0">
            <CardTitle>Section Under Construction</CardTitle>
            <CardDescription>
              The placement section is currently being updated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground pt-4">
            <p>Check back later for placement information and resources</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Placement;
