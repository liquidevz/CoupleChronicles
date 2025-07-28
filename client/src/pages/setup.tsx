import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Database, Key, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function Setup() {
  const [setupStatus, setSetupStatus] = useState({
    database: false,
    googleAuth: false,
    emails: false,
  });

  useEffect(() => {
    // Check environment variables status (this would be done server-side in production)
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/setup/status');
        if (response.ok) {
          const status = await response.json();
          setSetupStatus(status);
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
      }
    };
    
    checkSetup();
  }, []);

  const setupSteps = [
    {
      key: 'database',
      title: 'Database Connection',
      description: 'Connect to your Supabase database',
      icon: <Database className="w-6 h-6" />,
      status: setupStatus.database,
      instructions: [
        'Go to the Supabase dashboard (https://supabase.com/dashboard/projects)',
        'Create a new project if you haven\'t already',
        'Click the "Connect" button on the top toolbar',
        'Copy the URI value under "Connection string" → "Transaction pooler"',
        'Replace [YOUR-PASSWORD] with your database password',
        'Add this as DATABASE_URL in your environment secrets'
      ]
    },
    {
      key: 'googleAuth',
      title: 'Google Authentication',
      description: 'Set up Google OAuth for secure login',
      icon: <Key className="w-6 h-6" />,
      status: setupStatus.googleAuth,
      instructions: [
        'Go to Google Cloud Console (https://console.cloud.google.com)',
        'Create a new project or select an existing one',
        'Enable the Google+ API',
        'Go to "Credentials" and create OAuth 2.0 Client IDs',
        'Add your domain to authorized origins',
        'Copy the Client ID and Client Secret',
        'Add them as GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
      ]
    },
    {
      key: 'emails',
      title: 'Authorized Emails',
      description: 'Specify the two email addresses that can access the app',
      icon: <Users className="w-6 h-6" />,
      status: setupStatus.emails,
      instructions: [
        'Add your Gmail address as PARTNER1_EMAIL',
        'Add your partner\'s Gmail address as PARTNER2_EMAIL',
        'Only these two email addresses will be able to sign in',
        'Make sure both emails are Gmail accounts'
      ]
    }
  ];

  const allConfigured = Object.values(setupStatus).every(status => status);

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-romantic-pink heartbeat mx-auto mb-4" />
          <h1 className="text-4xl font-romantic text-gray-800 mb-2">
            Welcome Baby
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your romantic dashboard in just a few steps
          </p>
        </div>

        {/* Setup Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {setupSteps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.status ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < setupSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step.status ? 'bg-green-200' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {Object.values(setupStatus).filter(Boolean).length} of {setupSteps.length} steps completed
            </p>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-6">
          {setupSteps.map((step) => (
            <Card key={step.key} className={`shadow-romantic ${
              step.status ? 'border-green-200 bg-green-50' : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    step.status 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blush text-romantic-pink'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-romantic text-gray-800">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-normal">
                      {step.description}
                    </p>
                  </div>
                  {step.status && (
                    <CheckCircle className="w-6 h-6 text-green-500 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              
              {!step.status && (
                <CardContent>
                  <div className="space-y-2">
                    {step.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-romantic-pink text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Action Section */}
        <div className="mt-8 text-center">
          {allConfigured ? (
            <div className="space-y-4">
              <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-romantic text-green-800 mb-2">
                  Setup Complete!
                </h3>
                <p className="text-green-700 mb-4">
                  Your romantic dashboard is ready to use. You and your partner can now sign in with Google.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="gradient-romantic text-white hover:shadow-romantic transition-all duration-300"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-xl font-romantic text-yellow-800 mb-2">
                Configuration Needed
              </h3>
              <p className="text-yellow-700 mb-4">
                Please complete the setup steps above by adding the required environment variables in your Replit secrets.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Check Setup Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}