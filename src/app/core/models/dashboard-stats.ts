export interface DashboardStats {
  totalRevenue: number;
  totalArtists: number;
  totalTicketsSold: number;
  totalActiveUsers: number;
  ticketCapacityPercentage: number;
  salesTrend: { date: string, amount: number }[];
}
