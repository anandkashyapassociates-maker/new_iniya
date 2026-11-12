<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Clinic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClinicManagementController extends Controller
{
    /**
     * Display a listing of Clinics with search, filtering, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Clinic::with('superAdmin:id,name,email');

        // Parameterized search across clinic_code, name, branch_name, location, city, phone, email, contact_person
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('clinic_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->input('status') !== '' && $request->input('status') !== 'all') {
            $statusInput = $request->input('status');
            if (in_array($statusInput, Clinic::ALL_STATUSES, true)) {
                $query->where('status', $statusInput);
            }
        }

        // City filter
        if ($city = $request->input('city')) {
            if ($city !== '' && $city !== 'all') {
                $query->where('city', $city);
            }
        }

        // Location filter
        if ($location = $request->input('location')) {
            if ($location !== '' && $location !== 'all') {
                $query->where('location', 'like', "%{$location}%");
            }
        }

        // Dynamic sorting
        $allowedSorts = [
            'id', 'clinic_code', 'name', 'branch_name',
            'location', 'city', 'phone', 'email', 'status',
            'created_at', 'updated_at',
        ];
        $sortBy = in_array($request->input('sort_by'), $allowedSorts, true)
            ? $request->input('sort_by')
            : 'created_at';
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDirection)->orderBy('id', 'desc');

        $perPage = min((int) $request->input('per_page', 10), 50);
        $clinics = $query->paginate($perPage);

        return response()->json($clinics);
    }

    /**
     * Preview the next available Clinic Code.
     */
    public function previewCode(): JsonResponse
    {
        $code = Clinic::generateUniqueCode();

        return response()->json([
            'preview_code' => $code,
        ]);
    }

    /**
     * Get distinct cities and locations for filter dropdowns.
     */
    public function locations(): JsonResponse
    {
        $cities = Clinic::whereNotNull('city')
            ->where('city', '!=', '')
            ->distinct()
            ->orderBy('city')
            ->pluck('city');

        $locations = Clinic::whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->orderBy('location')
            ->pluck('location');

        return response()->json([
            'cities' => $cities,
            'locations' => $locations,
        ]);
    }

    /**
     * Get active clinics options list for dropdowns (creation/edit forms).
     */
    public function options(): JsonResponse
    {
        $clinics = Clinic::where('status', Clinic::STATUS_ACTIVE)
            ->orderBy('name', 'asc')
            ->get([
                'id',
                'clinic_code',
                'name',
                'branch_name',
                'location',
                'address',
                'city',
                'state',
                'postal_code',
                'country',
                'phone',
                'alternate_phone',
                'email',
                'contact_person',
                'status',
            ]);

        return response()->json([
            'clinics' => $clinics,
        ]);
    }

    /**
     * Store a newly created Clinic.
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'email' => $request->filled('email') ? strtolower(trim($request->input('email'))) : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'branch_name' => ['nullable', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'alternate_phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:150'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::in(Clinic::ALL_STATUSES)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $superAdmin = $request->user();

        // Concurrency-safe unique Clinic Code generation
        $clinicCode = Clinic::generateUniqueCode();

        $clinic = Clinic::create([
            'clinic_code' => $clinicCode,
            'name' => $validated['name'],
            'branch_name' => $validated['branch_name'] ?? null,
            'location' => $validated['location'],
            'address' => $validated['address'],
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => $validated['country'] ?? 'India',
            'phone' => $validated['phone'],
            'alternate_phone' => $validated['alternate_phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'contact_person' => $validated['contact_person'] ?? null,
            'status' => $validated['status'] ?? Clinic::STATUS_ACTIVE,
            'notes' => $validated['notes'] ?? null,
            'created_by_superadmin_id' => $superAdmin?->id,
        ]);

        AdminActivityLog::record(
            'super_admin',
            $superAdmin?->id,
            'create_clinic',
            "SuperAdmin created Clinic '{$clinic->name}' ({$clinic->clinic_code}) at {$clinic->location}",
            $request
        );

        return response()->json([
            'message' => "Clinic '{$clinic->name}' provisioned successfully.",
            'clinic' => $clinic->fresh(),
        ], 201);
    }

    /**
     * Display the specified Clinic details.
     */
    public function show(int $id): JsonResponse
    {
        $clinic = Clinic::with('superAdmin:id,name,email')->findOrFail($id);

        return response()->json([
            'clinic' => $clinic,
        ]);
    }

    /**
     * Update the specified Clinic.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $clinic = Clinic::findOrFail($id);

        $request->merge([
            'email' => $request->filled('email') ? strtolower(trim($request->input('email'))) : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'branch_name' => ['nullable', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'alternate_phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:150'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::in(Clinic::ALL_STATUSES)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $clinic->update($validated);

        $superAdmin = $request->user();
        AdminActivityLog::record(
            'super_admin',
            $superAdmin?->id,
            'update_clinic',
            "SuperAdmin updated Clinic '{$clinic->name}' ({$clinic->clinic_code})",
            $request
        );

        return response()->json([
            'message' => "Clinic '{$clinic->name}' updated successfully.",
            'clinic' => $clinic->fresh(),
        ]);
    }

    /**
     * Update Clinic operational status (active, inactive, maintenance).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $clinic = Clinic::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(Clinic::ALL_STATUSES)],
        ]);

        $oldStatus = $clinic->status;
        $clinic->update(['status' => $validated['status']]);

        $superAdmin = $request->user();
        AdminActivityLog::record(
            'super_admin',
            $superAdmin?->id,
            'update_clinic_status',
            "SuperAdmin changed Clinic '{$clinic->name}' ({$clinic->clinic_code}) status from '{$oldStatus}' to '{$validated['status']}'",
            $request
        );

        return response()->json([
            'message' => "Clinic '{$clinic->name}' status updated to '{$validated['status']}'.",
            'clinic' => $clinic->fresh(),
        ]);
    }

    /**
     * Delete a Clinic record.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $clinic = Clinic::findOrFail($id);
        $name = $clinic->name;
        $code = $clinic->clinic_code;

        $clinic->delete();

        $superAdmin = $request->user();
        AdminActivityLog::record(
            'super_admin',
            $superAdmin?->id,
            'delete_clinic',
            "SuperAdmin deleted Clinic '{$name}' ({$code})",
            $request
        );

        return response()->json([
            'message' => "Clinic '{$name}' deleted successfully.",
        ]);
    }
}

