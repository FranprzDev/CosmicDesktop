"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { getApod, Apod } from "@/services/nasa-apod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchApod() {
      if (!date) return;

      const today = new Date();
      if (isAfter(date, today)) {
        toast({
          title: "Error",
          description: "No se puede seleccionar una fecha futura.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

      if (!apiKey) {
        toast({
          title: "Error",
          description: "Falta la clave de la API de la NASA. Asegúrese de que NEXT_PUBLIC_NASA_API_KEY esté configurada en sus variables de entorno.",
          variant: "destructive",
        });
        setLoading(false);
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
          title: "Error al obtener APOD",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
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
            title: "Éxito",
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
          title: "Error al establecer el fondo de pantalla",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "No hay imagen para establecer como fondo de pantalla.",
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
            onSelect={(selectedDate) => {
              if (selectedDate && isAfter(selectedDate, new Date())) {
                toast({
                  title: "Error",
                  description: "No se puede seleccionar una fecha futura.",
                  variant: "destructive",
                });
                return;
              }
              setDate(selectedDate);
            }}
            className="rounded-md border"
            max={new Date()}
            locale={es}
            disabled={date => isAfter(date, new Date())}
            classNames={{
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              day_disabled: "text-muted-foreground opacity-50 text-gray-500",
              day_outside: "text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
              day_today: "!text-black"
            }}
          />
          {apodData ? (
            <div className="space-y-2 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-center text-white">{apodData.title}</h2>
               <Button onClick={handleSetWallpaper} disabled={loading}>
                  {loading ? "Cargando..." : "Establecer como fondo de pantalla"}
                </Button>
            </div>
          ) : date ? (
            <p className="text-center text-muted-foreground text-white">Cargando...</p>
          ) : (
            <p className="text-center text-muted-foreground text-white">Selecciona una fecha para ver la imagen astronómica del día.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
