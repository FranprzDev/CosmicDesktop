"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { getApod, Apod } from "@/services/nasa-apod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    electron: any;
  }
}

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [apodData, setApodData] = useState<Apod | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    async function fetchApod() {
      if (!date) return;

      setLoading(true); // Set loading to true when fetching starts
      const formattedDate = format(date, 'yyyy-MM-dd');
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

      if (!apiKey) {
        toast({
          title: "Error",
          description: "NASA API key is missing. Ensure NEXT_PUBLIC_NASA_API_KEY is set in your environment variables.",
          variant: "destructive",
        });
        setLoading(false); // Ensure loading is set to false in case of an error
        return;
      }
      try {
        const apod = await getApod(formattedDate, apiKey);
        setApodData(apod);
        setBackgroundImage(apod.hdurl);
      } catch (error: any) {
        console.error("Failed to fetch APOD:", error);
        setApodData(null);
        setBackgroundImage(null);
        toast({
          title: "Error fetching APOD",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Set loading to false when fetching completes, regardless of success or failure
      }
    }

    fetchApod();
  }, [date, toast]);

  const handleSetWallpaper = async () => {
    if (backgroundImage && window.electron) {
      try {
        window.electron.ipcRenderer.send('set-background', backgroundImage);
        window.electron.ipcRenderer.on('background-set-success', (event: any, message: any) => {
          toast({
            title: "Success",
            description: message,
          });
        });
        window.electron.ipcRenderer.on('background-set-error', (event: any, message: any) => {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        });
      } catch (error: any) {
        toast({
          title: "Error setting background",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "No image to set as background.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen py-2"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50 transition duration-500 ease-in-out"></div>
      <Card className="w-full max-w-md space-y-4 relative z-10 bg-transparent border-none shadow-none">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-center text-white text-2xl">Cosmic Desktop</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 flex flex-col items-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            max={new Date()}
          />
          {apodData ? (
            <div className="space-y-2 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-center text-white">{apodData.title}</h2>
              {apodData.copyright && <p className="text-xs text-center text-white">Copyright: {apodData.copyright}</p>}
               <Button onClick={handleSetWallpaper} disabled={loading}>
                  {loading ? "Loading..." : "Set as Wallpaper"}
                </Button>
            </div>
          ) : date ? (
            <p className="text-center text-muted-foreground text-white">Loading...</p>
          ) : (
            <p className="text-center text-muted-foreground text-white">Select a date to view the Astronomy Picture of the Day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
