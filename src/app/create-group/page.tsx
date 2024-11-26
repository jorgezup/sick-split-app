// app/create-group/page.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Users, Receipt, Share2, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"
import { useSplits } from '@/hooks/useSplits';
import { Participant } from "@/types"

interface CreateSplitFormData {
  name: string;
  description: string;
  currency: string;
  participants: Participant[];
}

const CreateSplitPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSplitFormData>({
    name: '',
    description: '',
    currency: 'USD',
    participants: [{ id: '1', name: '', groupId: '' }]
  });
  const [shareLink, setShareLink] = useState('');
  const { addSplit } = useSplits();

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      // Filter out empty participant names
      const validParticipants = formData.participants
        .filter(p => p.name.trim())
        .map(p => ({ name: p.name.trim() }));

      if (validParticipants.length === 0) {
        toast({
          title: "Error",
          description: "At least one participant is required",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post('/api/groups', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        currency: formData.currency,
        participants: validParticipants
      });

      const group = response.data;
      addSplit({ id: group.id, name: group.name });
      setShareLink(`${window.location.origin}/group/${group.id}`);
      setStep(3);

      toast({
        title: "Success",
        description: "Group created successfully!",
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [
        ...formData.participants,
        { id: Math.random().toString(), name: '', groupId: '' }
      ]
    });
  };

  const removeParticipant = (id: string) => {
    if (formData.participants.length > 1) {
      setFormData({
        ...formData,
        participants: formData.participants.filter(p => p.id !== id)
      });
    }
  };

  const updateParticipant = (id: string, name: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.map(p =>
        p.id === id ? { ...p, name } : p
      )
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${index === step ? 'w-8 bg-purple-600' : 'w-2 bg-gray-200'
            }`}
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Split Name
                </label>
                <Input
                  placeholder="e.g., Summer Trip 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  placeholder="e.g., Beach vacation with friends"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="BRL">BRL - Brazilian Real</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Participants
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                  className="flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {formData.participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <Input
                      placeholder={`Participant ${index + 1}`}
                      value={participant.name}
                      onChange={(e) => updateParticipant(participant.id, e.target.value)}
                      className="flex-1"
                    />
                    {formData.participants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Create Your Split</h3>
              <p className="text-gray-500">
                You&apos;re about to create {formData.name}. After creation, you&apos;ll get a link to invite others.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Split Details:</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-500">Name:</span> {formData.name}</li>
                {formData.description && (
                  <li><span className="text-gray-500">Description:</span> {formData.description}</li>
                )}
                <li><span className="text-gray-500">Currency:</span> {formData.currency}</li>
                <li>
                  <span className="text-gray-500">Participants:</span>
                  <ul className="ml-4 mt-1">
                    {formData.participants
                      .filter(p => p.name.trim())
                      .map(p => (
                        <li key={p.id}>• {p.name}</li>
                      ))}
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
              <Share2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Split Created Successfully!</h3>
              <p className="text-gray-500 mb-4">
                Share this link with your friends to invite them to the split.
              </p>
              <div className="flex gap-2 mb-4">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    // You could add a toast notification here
                  }}
                  variant="outline"
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                This link will expire in 3 hours
              </p>
            </div>
          </div>
        );
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name.trim() && formData.participants.some(p => p.name.trim());
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="container mx-auto max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 1 && "Create New Split"}
              {step === 2 && "Confirm Details"}
              {step === 3 && "Invite Friends"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-end">
            {step < 3 && (
              <Button
                onClick={step === 1 ? () => setStep(2) : handleCreateGroup}
                disabled={!isStepValid() || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  step === 1 ? 'Continue' : 'Create Split'
                )}
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={() => router.push(`/group/${shareLink.split('/').pop()}`)}
                className="w-full sm:w-auto"
              >
                Go to Split
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CreateSplitPage;