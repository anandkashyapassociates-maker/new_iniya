import { superAdminApiClient } from '../auth/superAdminAuthService';

export const clinicManagementService = {
  /**
   * Fetch paginated list of clinics with optional search, location, city, status, and sorting filters.
   */
  async getClinics(params = {}) {
    const response = await superAdminApiClient.get('/superadmin/clinics', { params });
    return response.data;
  },

  /**
   * Fetch single clinic details by ID.
   */
  async getClinic(id) {
    const response = await superAdminApiClient.get(`/superadmin/clinics/${id}`);
    return response.data;
  },

  /**
   * Create a new Clinic.
   */
  async createClinic(data) {
    const response = await superAdminApiClient.post('/superadmin/clinics', data);
    return response.data;
  },

  /**
   * Update an existing Clinic.
   */
  async updateClinic(id, data) {
    const response = await superAdminApiClient.put(`/superadmin/clinics/${id}`, data);
    return response.data;
  },

  /**
   * Update Clinic operational status (active, inactive, maintenance).
   */
  async updateClinicStatus(id, status) {
    const payload = typeof status === 'string'
      ? { status }
      : { status: status ? 'active' : 'inactive' };
    const response = await superAdminApiClient.patch(`/superadmin/clinics/${id}/status`, payload);
    return response.data;
  },

  /**
   * Delete a Clinic.
   */
  async deleteClinic(id) {
    const response = await superAdminApiClient.delete(`/superadmin/clinics/${id}`);
    return response.data;
  },

  /**
   * Preview next available Clinic Code (e.g. CLN-0001).
   */
  async getPreviewCode() {
    const response = await superAdminApiClient.get('/superadmin/clinics/preview-code');
    return response.data;
  },

  /**
   * Fetch distinct cities and locations for filter dropdowns.
   */
  async getLocations() {
    const response = await superAdminApiClient.get('/superadmin/clinics/locations');
    return response.data;
  },
};

export default clinicManagementService;
