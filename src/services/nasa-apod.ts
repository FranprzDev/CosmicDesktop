
/**
 * Represents the Astronomy Picture of the Day (APOD) data from NASA.
 */
export interface Apod {
  /**
   * The title of the APOD.
   */
  title: string;
  /**
   * A URL to the high-resolution image of the APOD.
   */
  hdurl: string;
  /**
   * Explanation of the APOD.
   */
  explanation: string;
  /**
   * The copyright information for the APOD, if available.
   */
  copyright?: string;
  /**
   * The date of the APOD.
   */
  date: string;
}

/**
 * Asynchronously retrieves the Astronomy Picture of the Day (APOD) for a given date.
 *
 * @param date The date for which to retrieve the APOD.  Should be in 'YYYY-MM-DD' format.
 * @param apiKey The NASA API key to use for authentication.
 * @returns A promise that resolves to an Apod object containing the APOD data.
 */
export async function getApod(date: string, apiKey: string): Promise<Apod> {
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return {
      copyright: data.copyright,
      date: data.date,
      explanation: data.explanation,
      hdurl: data.hdurl,
      title: data.title
    };
  } catch (error) {
    console.error("Error fetching APOD:", error);
    throw error;
  }
}
