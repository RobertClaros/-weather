import type { IssServicePort } from "../ports/iss-service.port.js";
import type { IssDataPort } from "../ports/iss-data.port.js";

export class IssService implements IssServicePort {
  constructor(private readonly dataPort: IssDataPort) {}

  async fetchCurrentPosition(): Promise<string> {
    const position = await this.dataPort.getCurrentPosition();

    if (!position) {
      return "Failed to retrieve current ISS position";
    }

    return [
      "International Space Station Position:",
      `Latitude: ${position.latitude.toFixed(4)}`,
      `Longitude: ${position.longitude.toFixed(4)}`,
      `Timestamp: ${new Date(position.timestamp * 1000).toUTCString()}`,
      "---",
    ].join("\n");
  }
}