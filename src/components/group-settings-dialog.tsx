import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Users,
  Save,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { Group } from "@/types";
import { toast } from "@/hooks/use-toast";

interface GroupSettingsDialogProps {
  group: Group;
  onUpdateGroup: (data: {
    name: string;
    description: string;
  }) => Promise<void>;
  onAddParticipant: (name: string) => Promise<void>;
}

const GroupSettingsDialog = ({
  group,
  onUpdateGroup,
  onAddParticipant,
}: GroupSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [groupForm, setGroupForm] = useState({
    name: group.name,
    description: group.description || "",
  });

  const handleSaveSettings = async () => {
    if (!groupForm.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onUpdateGroup({
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
      });
      toast({
        title: "Success",
        description: "Group settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update group settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onAddParticipant(newParticipantName.trim());
      setNewParticipantName("");
      toast({
        title: "Success",
        description: "Participant added successfully",
      });
    } catch (error) {
      console.error("Error adding participant:", error);
      toast({
        title: "Error",
        description: "Failed to add participant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          Group Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
          <DialogDescription>
            Manage group details and participants
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] mt-4">
          <div className="space-y-6">
            {/* Group Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Group Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <Input
                    placeholder="Enter group name"
                    value={groupForm.name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="Enter group description"
                    value={groupForm.description}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, description: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading || !groupForm.name.trim()}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Participants Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Participants</h3>
              <Card className="p-4">
                <div className="space-y-4">
                  {/* Current Participants */}
                  <div className="space-y-2">
                    {group.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 p-1.5 rounded-full">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <span>{participant.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Participant */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Add New Participant
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter participant name"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddParticipant();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddParticipant}
                        disabled={loading || !newParticipantName.trim()}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;