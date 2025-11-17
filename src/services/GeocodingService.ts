/**
 * Service responsible for geocoding addresses using OpenStreetMap Nominatim API
 * Converts addresses to coordinates and validates address existence
 */
export class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'MyEasyWebsite/1.0';

  /**
   * Geocode an address to coordinates
   * Returns latitude and longitude if found
   */
  async geocodeAddress(address: string): Promise<{
    lat: string;
    lon: string;
    displayName: string;
  } | null> {
    console.log('🌍 GeocodingService: Geocoding address:', address);

    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ GeocodingService: Address found:', result.display_name);
        return {
          lat: result.lat,
          lon: result.lon,
          displayName: result.display_name,
        };
      }

      console.log('⚠️ GeocodingService: Address not found');
      return null;
    } catch (error) {
      console.error('❌ GeocodingService: Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Validate if an address exists
   */
  async validateAddress(address: string): Promise<boolean> {
    console.log('✅ GeocodingService: Validating address:', address);

    const result = await this.geocodeAddress(address);
    return result !== null;
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lon: number): Promise<{
    displayName: string;
    address: {
      road?: string;
      houseNumber?: string;
      city?: string;
      state?: string;
      country?: string;
      postcode?: string;
    };
  } | null> {
    console.log('🌍 GeocodingService: Reverse geocoding:', lat, lon);

    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        console.log('✅ GeocodingService: Reverse geocode successful');
        return {
          displayName: data.display_name,
          address: data.address || {},
        };
      }

      console.log('⚠️ GeocodingService: Reverse geocode failed');
      return null;
    } catch (error) {
      console.error('❌ GeocodingService: Error reverse geocoding:', error);
      return null;
    }
  }
}

// Singleton instance
export const geocodingService = new GeocodingService();
