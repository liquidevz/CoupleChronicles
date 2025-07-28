import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Images, Upload, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Photo } from "@shared/schema";

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { url: string; caption?: string }) => {
      return apiRequest("POST", "/api/photos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setCaption("");
      toast({
        title: "Photo uploaded!",
        description: "Your memory has been added to the gallery.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Create a temporary URL for display
      // In a real implementation, this would upload to Supabase Storage
      const tempUrl = URL.createObjectURL(selectedFile);
      
      uploadMutation.mutate({
        url: tempUrl,
        caption: caption || undefined,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="shadow-romantic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-romantic text-gray-800 flex items-center gap-2">
              <Images className="w-6 h-6 text-romantic-pink" />
              Our Memories
            </CardTitle>
            <Button 
              onClick={() => setUploadDialogOpen(true)}
              className="gradient-romantic text-white hover:shadow-romantic transition-all duration-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="memory-card bg-gray-100 rounded-2xl overflow-hidden aspect-square cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Memory"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            
            <div 
              className="glass-morphism rounded-2xl aspect-square flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all"
              onClick={() => setUploadDialogOpen(true)}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-romantic-pink mx-auto mb-2" />
                <p className="text-sm text-gray-600">Add Memory</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-screen p-0 bg-transparent border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-romantic-pink z-10"
            >
              <X className="w-6 h-6" />
            </Button>
            {selectedPhoto && (
              <img 
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Memory"}
                className="max-w-full max-h-screen rounded-2xl shadow-romantic"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-xl font-romantic text-gray-800">Upload a Memory</h2>
            
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mb-2"
              />
              {selectedFile && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <Input
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="flex-1 gradient-romantic text-white"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
