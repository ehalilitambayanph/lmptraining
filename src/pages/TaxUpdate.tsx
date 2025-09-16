import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function TaxUpdate() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/a861675f-582f-4b42-80ff-16343ef6836f.png" 
                alt="Company Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tax Update</h1>
                <p className="text-muted-foreground">Ledmyplace states tax collection information</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://chat.whatsapp.com/KOiszYwZudR519lSjcXQS9', '_blank')}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                >
                  Join us on WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  Product Training
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/training-activity'}
                  className="text-sm"
                >
                  Training Activity
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/tax-update'}
                  className="text-sm"
                >
                  Tax Update
                </Button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Product Training
          </Button>
        </div>

        {/* Main Content */}
        <Card className="shadow-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl mb-2">Tax Update: Ledmyplace States</CardTitle>
            <p className="text-muted-foreground">States where we collect taxes</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Current Tax Collection States</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  'Pennsylvania', 'New Jersey', 'Kentucky', 'Florida', 'Illinois', 'Maryland',
                  'North Carolina', 'Ohio', 'Texas', 'Michigan', 'Louisiana', 'Iowa',
                  'Washington', 'Minnesota', 'Georgia', 'Indiana', 'Tennessee', 'Wisconsin', 'Virginia'
                ].map((state) => (
                  <Badge key={state} variant="outline" className="justify-center p-2">
                    {state}
                  </Badge>
                ))}
              </div>
              
              <h3 className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Coming Soon</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {['Arkansas', 'Missouri'].map((state) => (
                  <Badge key={state} variant="secondary" className="justify-center p-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    {state}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-primary">Important Tax Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>Taxes are collected based on the <strong>shipping address</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>Shopify collects taxes on <strong>shipping fees</strong> as well</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>We accept a <strong>resale certificate</strong> to mark a customer tax-exempt</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>Resale certificates must be <strong>approved by our accountant</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>For questions, reach out to <strong>@Ayan Alam</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}