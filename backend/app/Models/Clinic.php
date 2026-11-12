<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Clinic extends Model
{
    use HasFactory;

    protected $table = 'clinics';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_MAINTENANCE = 'maintenance';

    public const ALL_STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
        self::STATUS_MAINTENANCE,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
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
        'notes',
        'created_by_superadmin_id',
    ];

    /**
     * Cast attributes.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Model booted event handlers for sanitization and normalization.
     */
    protected static function booted(): void
    {
        static::saving(function (Clinic $clinic) {
            // Normalize email
            if ($clinic->email) {
                $clinic->email = strtolower(trim($clinic->email));
            }

            // Normalize nullable string fields: convert empty strings to null
            $nullableFields = [
                'branch_name',
                'city',
                'state',
                'postal_code',
                'alternate_phone',
                'email',
                'contact_person',
                'notes',
            ];

            foreach ($nullableFields as $field) {
                if (isset($clinic->{$field}) && trim((string) $clinic->{$field}) === '') {
                    $clinic->{$field} = null;
                } elseif (isset($clinic->{$field}) && is_string($clinic->{$field})) {
                    $clinic->{$field} = trim($clinic->{$field});
                }
            }

            // Ensure status default
            if (empty($clinic->status)) {
                $clinic->status = self::STATUS_ACTIVE;
            }
        });
    }

    /**
     * Safely generate a unique Clinic Code (e.g. CLN-0001, CLN-0002).
     */
    public static function generateUniqueCode(): string
    {
        return DB::transaction(function () {
            // Find the highest existing CLN number using row lock for concurrency safety
            $latestClinic = static::where('clinic_code', 'LIKE', 'CLN-%')
                ->lockForUpdate()
                ->orderByRaw('CAST(SUBSTRING(clinic_code, 5) AS UNSIGNED) DESC')
                ->first();

            $nextNumber = 1;
            if ($latestClinic && preg_match('/^CLN-(\d+)$/', $latestClinic->clinic_code, $matches)) {
                $nextNumber = ((int) $matches[1]) + 1;
            }

            // Ensure uniqueness
            do {
                $candidate = sprintf('CLN-%04d', $nextNumber);
                $exists = static::where('clinic_code', $candidate)->exists();
                if ($exists) {
                    $nextNumber++;
                }
            } while ($exists);

            return $candidate;
        });
    }

    /**
     * Super Admin who provisioned this clinic.
     */
    public function superAdmin(): BelongsTo
    {
        return $this->belongsTo(SuperAdmin::class, 'created_by_superadmin_id');
    }

    /**
     * Staff members assigned to this clinic.
     */
    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class, 'clinic_id');
    }

    /**
     * Admins assigned to this clinic branch.
     */
    public function admins(): HasMany
    {
        return $this->hasMany(Admin::class, 'clinic_id');
    }

    /**
     * Inventory products registered for this clinic.
     */
    public function products(): HasMany
    {
        return $this->hasMany(InventoryProduct::class, 'clinic_id');
    }
}

