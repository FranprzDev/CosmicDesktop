
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setDesktopBackground(imageUrl: string) {
  console.log(`Setting desktop background to ${imageUrl}`);
  alert('This feature is not supported in the browser. To change the background, download the image and set it manually.');
}
