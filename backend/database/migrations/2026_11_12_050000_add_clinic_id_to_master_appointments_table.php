<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('master_appointments', function (Blueprint $table) {
            if (! Schema::hasColumn('master_appointments', 'clinic_id')) {
                $table->foreignId('clinic_id')
                    ->nullable()
                    ->after('appointment_number')
                    ->constrained('clinics')
                    ->nullOnDelete();
            }
        });

        // Seed existing appointments to admin's clinic or first available clinic
        try {
            $defaultClinicId = DB::table('clinics')->orderBy('id', 'asc')->value('id');
            if ($defaultClinicId) {
                // First backfill from admin's clinic if admin has one
                DB::statement('
                    UPDATE master_appointments ma
                    JOIN admins a ON ma.admin_id = a.id
                    SET ma.clinic_id = a.clinic_id
                    WHERE ma.clinic_id IS NULL AND a.clinic_id IS NOT NULL
                ');

                // Any remaining nulls get the default clinic
                DB::table('master_appointments')
                    ->whereNull('clinic_id')
                    ->update(['clinic_id' => $defaultClinicId]);
            }
        } catch (\Throwable $e) {
            // Ignore if clinics table is not populated yet
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_appointments', function (Blueprint $table) {
            if (Schema::hasColumn('master_appointments', 'clinic_id')) {
                $table->dropForeign(['clinic_id']);
                $table->dropColumn('clinic_id');
            }
        });
    }
};
