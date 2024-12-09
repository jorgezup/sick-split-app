"use client";

import React, { useState } from 'react';
import { Plus, Users, ArrowRight, Clock, Receipt, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSplits } from '@/hooks/useSplits';
import DeleteSplitDialog from '@/components/delete-split-dialog';
import { formatLastVisited } from '@/lib/utils';

const HomePage = () => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [showMySplits, setShowMySplits] = useState(false);
  const { splits, removeSplit } = useSplits();

  const handleJoinGroup = () => {
    if (inviteCode.trim()) {
      router.push(`/group/${inviteCode}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinGroup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">Sick Split</h1>
          <p className="text-gray-600">Split expenses, keep friendships</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Create New Split */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 pb-6 pr-4 pl-4">
                <Link href="/create-group">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between text-left p-2 hover:bg-purple-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Plus className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Create New Split</div>
                        <div className="text-sm text-gray-500">Start a new expense sharing group</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Join Existing Split */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Join a Split</div>
                      <div className="text-sm text-gray-500">Enter the invite code</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Enter invite code"
                      className="flex-1"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleJoinGroup}
                      disabled={!inviteCode.trim()}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Splits Section */}
          {splits.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">My Splits</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMySplits(!showMySplits)}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMySplits ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              {showMySplits && (
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {splits.map(split => (
                        <div
                          key={split.id}
                          onClick={() => router.push(`/group/${split.id}`)}
                          className="p-4 bg-white rounded-lg border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <Receipt className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium">{split.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Last visited {formatLastVisited(split.lastVisited)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <DeleteSplitDialog
                                splitName={split.name}
                                onDelete={() => removeSplit(split.id)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Split bills easily with friends and family</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;