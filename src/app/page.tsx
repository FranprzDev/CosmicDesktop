"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { getApod, Apod } from "@/services/nasa-apod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    async function fetchApod() {
      if (!date) return;

      const formattedDate = date.toISOString().split('T')[0];
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

      if (!apiKey) {
        toast({
          title: "Error",
          description: "NASA API key is missing. Ensure NEXT_PUBLIC_NASA_API_KEY is set in your environment variables.",
          variant: "destructive",
        });
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
      }
    }

    fetchApod();
  }, [date, toast]);

  useEffect(() => {
    async function setBackground() {
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
      }
    }

    setBackground();
  }, [backgroundImage, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-center">Cosmic Desktop</CardTitle>
          <CardDescription className="text-center">
            Select a date to set the Astronomy Picture of the Day as your desktop background.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            max={new Date()}
          />
          {apodData ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-center">{apodData.title}</h2>
              <Avatar className="w-full h-auto aspect-video rounded-md overflow-hidden">
                {apodData.hdurl ? (
                  <AvatarImage src={apodData.hdurl} alt={apodData.title} style={{ objectFit: 'cover' }} />
                ) : (
                  <AvatarFallback>No Image</AvatarFallback>
                )}
              </Avatar>
              {apodData.copyright && <p className="text-xs text-center">Copyright: {apodData.copyright}</p>}
              <p className="text-sm text-muted-foreground">{apodData.explanation}</p>
            </div>
          ) : date ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-center text-muted-foreground">Select a date to view the Astronomy Picture of the Day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    