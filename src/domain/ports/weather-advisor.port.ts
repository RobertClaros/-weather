export interface WeatherAdvisorServicePort {
  getAdvice(latitude: number, longitude: number): Promise<string>;
}