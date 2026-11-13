<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffManagementController extends Controller
{
    /**
     * Display a listing of Staff members with search, department/status filter, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Staff::with([
            'superAdmin:id,name,email',
            'clinic:id,clinic_code,name,branch_name,location,city,address,phone',
        ]);

        // Search by staff_code, name, email, or mobile
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('staff_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Filter by clinic
        if ($clinicId = $request->input('clinic_id')) {
            if ($clinicId !== '' && $clinicId !== 'all') {
                $query->where('clinic_id', $clinicId);
            }
        }

        // Filter by department
        if ($department = $request->input('department')) {
            if ($department !== '' && $department !== 'all') {
                $query->where('department', $department);
            }
        }

        // Filter by employment type
        if ($empType = $request->input('employment_type')) {
            if ($empType !== '' && $empType !== 'all') {
                $query->where('employment_type', $empType);
            }
        }

        // Filter by status (active, inactive, blocked, or boolean true/false)
        if ($request->has('status') && $request->input('status') !== '' && $request->input('status') !== 'all') {
            $statusInput = $request->input('status');
            if (in_array($statusInput, ['active', 'inactive', 'blocked'])) {
                $query->where('status', $statusInput);
            } elseif ($statusInput === 'true' || $statusInput === '1') {
                $query->where('is_active', true);
            } elseif ($statusInput === 'false' || $statusInput === '0') {
                $query->where('is_active', false);
            }
        }

        // Sorting
        $allowedSorts = [
            'id', 'staff_code', 'name', 'email', 'mobile',
            'department', 'designation', 'employment_type',
            'joining_date', 'status', 'is_active', 'created_at', 'updated_at',
        ];
        $sortBy = in_array($request->input('sort_by'), $allowedSorts)
            ? $request->input('sort_by')
            : 'created_at';
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDirection)->orderBy('id', 'desc');

        $perPage = min((int) $request->input('per_page', 10), 50);
        $staff = $query->paginate($perPage);

        return response()->json($staff);
    }

    /**
     * Preview the next available Staff Code.
     */
    public function previewCode(): JsonResponse
    {
        $code = Staff::generateUniqueCode();

        return response()->json([
            'preview_code' => $code,
        ]);
    }

    /**
     * Get distinct departments for filter dropdowns.
     */
    public function departments(): JsonResponse
    {
        $departments = Staff::whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->pluck('department');

        return response()->json($departments);
    }

    /**
     * Store a newly created Staff member.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:staff,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'mobile' => ['nullable', 'string', 'min:7', 'max:25'],
            'department' => ['nullable', 'string', 'max:100'],
            'designation' => ['nullable', 'string', 'max:100'],
            'employment_type' => ['nullable', 'string', 'max:50'],
            'joining_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'blocked'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $status = $validated['status'] ?? (isset($validated['is_active']) ? ($validated['is_active'] ? 'active' : 'inactive') : 'active');
        $isActive = ($status === 'active');

        $superAdmin = $request->user();

        // Concurrency-safe backend generated Staff Code
        $staffCode = Staff::generateUniqueCode();
        $plainPassword = ! empty($validated['password']) ? $validated['password'] : '12345678';
        $clinicId = $validated['clinic_id'] ?? \App\Models\Clinic::orderBy('id')->value('id');

        $staff = Staff::create([
            'staff_code' => $staffCode,
            'clinic_id' => $clinicId,
            'created_by_superadmin_id' => $superAdmin->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'mobile' => $validated['mobile'] ?? null,
            'department' => $validated['department'] ?? null,
            'designation' => $validated['designation'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'Full-Time',
            'joining_date' => $validated['joining_date'] ?? null,
            'address' => $validated['address'] ?? null,
            'profile_photo' => $validated['profile_photo'] ?? null,
            'status' => $status,
            'is_active' => $isActive,
        ]);

        AdminActivityLog::record(
            'super_admin',
            $superAdmin->id,
            'staff_created',
            "Super Admin '{$superAdmin->name}' created Staff '{$staff->name}' ({$staff->staff_code}) assigned to Clinic ID {$staff->clinic_id}.",
            $request
        );

        return response()->json([
            'message' => 'Staff member created successfully.',
            'staff' => $staff->load([
                'superAdmin:id,name,email',
                'clinic:id,clinic_code,name,branch_name,location,city,address,phone',
            ]),
        ], 201);
    }

    /**
     * Display the specified Staff member.
     */
    public function show(string $id): JsonResponse
    {
        $staff = Staff::with([
            'superAdmin:id,name,email',
            'clinic:id,clinic_code,name,branch_name,location,city,address,phone',
        ])->find($id);

        if (! $staff) {
            return response()->json([
                'message' => 'Staff member not found.',
            ], 404);
        }

        return response()->json([
            'staff' => $staff,
        ]);
    }

    /**
     * Update the specified Staff member.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if (! $staff) {
            return response()->json([
                'message' => 'Staff member not found.',
            ], 404);
        }

        $validated = $request->validate([
            'clinic_id' => ['sometimes', 'nullable', 'integer', 'exists:clinics,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('staff')->ignore($staff->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'mobile' => ['nullable', 'string', 'min:7', 'max:25'],
            'department' => ['nullable', 'string', 'max:100'],
            'designation' => ['nullable', 'string', 'max:100'],
            'employment_type' => ['nullable', 'string', 'max:50'],
            'joining_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'blocked'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $dataToUpdate = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (array_key_exists('clinic_id', $validated) && $validated['clinic_id']) {
            $dataToUpdate['clinic_id'] = $validated['clinic_id'];
        }

        if (! empty($validated['password'])) {
            $dataToUpdate['password'] = Hash::make($validated['password']);
        }

        foreach (['mobile', 'department', 'designation', 'employment_type', 'joining_date', 'address', 'profile_photo'] as $field) {
            if (array_key_exists($field, $validated)) {
                $dataToUpdate[$field] = $validated[$field];
            }
        }

        if (isset($validated['status'])) {
            $dataToUpdate['status'] = $validated['status'];
            $dataToUpdate['is_active'] = ($validated['status'] === 'active');
        } elseif (isset($validated['is_active'])) {
            $dataToUpdate['is_active'] = $validated['is_active'];
            $dataToUpdate['status'] = $validated['is_active'] ? 'active' : ($staff->status === 'blocked' ? 'blocked' : 'inactive');
        }

        $staff->update($dataToUpdate);

        $superAdmin = $request->user();
        AdminActivityLog::record(
            'super_admin',
            $superAdmin->id,
            'staff_updated',
            "Super Admin '{$superAdmin->name}' updated Staff '{$staff->name}' ({$staff->staff_code}) details.",
            $request
        );

        return response()->json([
            'message' => 'Staff member updated successfully.',
            'staff' => $staff->fresh()->load([
                'superAdmin:id,name,email',
                'clinic:id,clinic_code,name,branch_name,location,city,address,phone',
            ]),
        ]);
    }

    /**
     * Update the active/blocked status of a Staff member.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if (! $staff) {
            return response()->json([
                'message' => 'Staff member not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'blocked'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['status'])) {
            $status = $validated['status'];
            $isActive = ($status === 'active');
        } elseif (isset($validated['is_active'])) {
            $isActive = (bool) $validated['is_active'];
            $status = $isActive ? 'active' : 'inactive';
        } else {
            return response()->json([
                'message' => 'Status or is_active field is required.',
            ], 422);
        }

        $staff->update([
            'status' => $status,
            'is_active' => $isActive,
        ]);

        $superAdmin = $request->user();
        $statusText = match ($status) {
            'blocked' => 'blocked',
            'inactive' => 'deactivated',
            default => 'activated',
        };

        AdminActivityLog::record(
            'super_admin',
            $superAdmin->id,
            'staff_status_changed',
            "Super Admin '{$superAdmin->name}' {$statusText} Staff '{$staff->name}' ({$staff->staff_code}).",
            $request
        );

        return response()->json([
            'message' => "Staff member {$statusText} successfully.",
            'staff' => $staff->fresh()->load('superAdmin:id,name,email'),
        ]);
    }
}
