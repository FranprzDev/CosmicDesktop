
"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { getApod, Apod } from "@/services/nasa-apod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setDesktopBackground } from "@/lib/utils";

const NASA_API_KEY = "iMhj1gU40yAOWvy2PwaSFUqb5mdR5GqnrVHwmNGm";

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [apodData, setApodData] = useState<Apod | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApod() {
      if (!date) return;

      const formattedDate = date.toISOString().split('T')[0];
      try {
        const apod = await getApod(formattedDate, NASA_API_KEY);
        setApodData(apod);
        setBackgroundImage(apod.hdurl);
      } catch (error) {
        console.error("Failed to fetch APOD:", error);
        setApodData(null);
        setBackgroundImage(null);
      }
    }

    fetchApod();
  }, [date]);

  useEffect(() => {
    if (backgroundImage) {
      setDesktopBackground(backgroundImage);
    }
  }, [backgroundImage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-center">Cosmic Desktop</CardTitle>
          <CardDescription className="text-center">
            Select a date to set the Astronomy Picture of the Day as your desktop background.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          {apodData && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{apodData.title}</h2>
              <p className="text-sm">{apodData.explanation}</p>
              {apodData.copyright && <p className="text-xs">Copyright: {apodData.copyright}</p>}
            </div>
          )}
          {!apodData && date && (
            <p className="text-center text-muted-foreground">
              Loading...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
