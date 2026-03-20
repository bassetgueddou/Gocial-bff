import api from './api';

export interface CreateReportData {
  report_type: 'user' | 'activity';
  reported_user_id?: number;
  activity_id?: number;
  reason: string;
  description?: string;
}

export const reportService = {
  createReport: async (data: CreateReportData): Promise<{ message: string }> => {
    const response = await api.post('/api/reports', data);
    return response.data;
  },
};
