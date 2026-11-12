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
        Schema::table('admins', function (Blueprint $table) {
            if (! Schema::hasColumn('admins', 'clinic_id')) {
                $table->foreignId('clinic_id')
                    ->nullable()
                    ->after('super_admin_id')
                    ->constrained('clinics')
                    ->nullOnDelete();
            }
        });

        // Seed existing admins to first available clinic if any exists
        try {
            $defaultClinicId = DB::table('clinics')->orderBy('id', 'asc')->value('id');
            if ($defaultClinicId) {
                DB::table('admins')
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
        Schema::table('admins', function (Blueprint $table) {
            if (Schema::hasColumn('admins', 'clinic_id')) {
                $table->dropForeign(['clinic_id']);
                $table->dropColumn('clinic_id');
            }
        });
    }
};

