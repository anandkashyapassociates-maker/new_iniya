import { superAdminApiClient } from '../auth/superAdminAuthService';

export const salesMemberManagementService = {
  /**
   * Fetch paginated list of sales team members with optional search, department, territory, status, and sorting filters.
   */
  async getSalesMembers(params = {}) {
    const response = await superAdminApiClient.get('/superadmin/sales-members', { params });
    return response.data;
  },

  /**
   * Fetch single sales member details by ID.
   */
  async getSalesMember(id) {
    const response = await superAdminApiClient.get(`/superadmin/sales-members/${id}`);
    return response.data;
  },

  /**
   * Create a new Sales Member.
   */
  async createSalesMember(data) {
    const response = await superAdminApiClient.post('/superadmin/sales-members', data);
    return response.data;
  },

  /**
   * Update an existing Sales Member.
   */
  async updateSalesMember(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    if (isFormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      const response = await superAdminApiClient.post(`/superadmin/sales-members/${id}`, data);
      return response.data;
    }
    const response = await superAdminApiClient.put(`/superadmin/sales-members/${id}`, data);
    return response.data;
  },

  /**
   * Update Sales Member status (active, inactive, blocked).
   */
  async updateSalesMemberStatus(id, status) {
    const payload = typeof status === 'string'
      ? { status }
      : { status: status ? 'active' : 'inactive' };
    const response = await superAdminApiClient.patch(`/superadmin/sales-members/${id}/status`, payload);
    return response.data;
  },

  /**
   * Preview next available Sales Code (e.g. SAL-0001).
   */
  async getPreviewCode() {
    const response = await superAdminApiClient.get('/superadmin/sales-members/preview-code');
    return response.data;
  },

  /**
   * Get list of unique departments.
   */
  async getDepartments() {
    const response = await superAdminApiClient.get('/superadmin/sales-members/departments');
    return response.data;
  },

  /**
   * Get list of unique sales territories.
   */
  async getTerritories() {
    const response = await superAdminApiClient.get('/superadmin/sales-members/territories');
    return response.data;
  },
};

export default salesMemberManagementService;

